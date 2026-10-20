import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { pipeline } from 'stream/promises';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;
  private readonly cacheDir = path.join(process.cwd(), 'uploads-cache');
  private inFlightDownloads = new Map<string, Promise<{ filePath: string; contentType: string; size: number } | null>>();

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    this.bucketName = this.configService.get<string>('aws.s3BucketName') || 'vmax-property-images';

    if (!fs.existsSync(this.cacheDir)) {
      try {
        fs.mkdirSync(this.cacheDir, { recursive: true });
      } catch (err: any) {
        this.logger.error(`Failed to create uploads-cache dir: ${err.message}`);
      }
    }

    if (accessKeyId && secretAccessKey) {
      this.s3Client = new S3Client({
        region,
        credentials: {
          accessKeyId,
          secretAccessKey,
        },
      });
      this.logger.log(`☁️ AWS S3 Upload Service initialized for bucket: ${this.bucketName} in region: ${region}`);
    } else {
      this.logger.warn(`⚠️ AWS credentials not set. Falling back to local file upload storage.`);
    }
  }

  /**
   * Upload single file to S3 (or local fallback) with specified subfolder.
   * For listing photos: subfolder = `listings/${listingId}`
   */
  async uploadFile(file: Express.Multer.File, subfolder: string = 'uploads'): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const envFolder = this.configService.get<string>('aws.folder') || 'development';
    const region = this.configService.get<string>('aws.region') || 'us-east-1';

    // Key format: e.g. production/listings/{listingId}/{uuid}.jpg or development/uploads/{uuid}.jpg
    const s3Key = `${envFolder}/${subfolder.replace(/^\//, '')}/${uuidv4()}${fileExt}`;

    // If AWS S3 credentials are provided, upload to Amazon S3
    if (this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: file.buffer || (file.path ? fs.readFileSync(file.path) : undefined),
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        const s3Url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        this.logger.log(`✅ File uploaded successfully to S3 bucket [${this.bucketName}]: ${s3Url}`);

        // Prime local disk cache so immediate previews and video playback are instant (0ms latency)
        try {
          const hash = crypto.createHash('md5').update(`${this.bucketName}:${s3Key}`).digest('hex');
          const ext = fileExt || '.bin';
          const cachedFilePath = path.join(this.cacheDir, `${hash}${ext}`);
          const metaPath = path.join(this.cacheDir, `${hash}.meta.json`);
          const buf = file.buffer || (file.path ? fs.readFileSync(file.path) : null);
          if (buf && buf.length > 0) {
            fs.writeFileSync(cachedFilePath, buf);
            fs.writeFileSync(
              metaPath,
              JSON.stringify({ contentType: file.mimetype, size: buf.length }),
              'utf8',
            );
            this.logger.log(`⚡ Primed upload cache for ${s3Key} (${(buf.length / 1024 / 1024).toFixed(2)} MB)`);
          }
        } catch (cacheErr: any) {
          this.logger.warn(`Failed to prime cache: ${cacheErr.message}`);
        }

        return s3Url;
      } catch (error: any) {
        this.logger.error(`❌ Failed to upload file to S3: ${error.message}`);
        // Fallback to local storage on S3 failure
      }
    }

    // Local Storage Fallback with grouped parent directory
    const targetSubDir = subfolder.replace(/\//g, path.sep);
    const uploadDir = path.join(process.cwd(), 'uploads', targetSubDir);
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, localFileName);
    fs.writeFileSync(filePath, file.buffer || (file.path ? fs.readFileSync(file.path) : Buffer.from([])));

    const relativeUrl = `/uploads/${subfolder}/${localFileName}`.replace(/\\/g, '/');
    this.logger.log(`📂 Saved file locally: ${relativeUrl}`);
    return relativeUrl;
  }

  /**
   * Upload listing photos grouped under listing ID as parent folder in S3:
   * S3 Key format: listings/{listingId}/{uuid}{fileExt}
   */
  async uploadListingImages(listingId: string, files: Express.Multer.File[]): Promise<string[]> {
    if (!files || files.length === 0) return [];
    this.logger.log(`📸 Uploading ${files.length} images grouped under parent listing folder: listings/${listingId}/`);
    return Promise.all(files.map((file) => this.uploadFile(file, `listings/${listingId}`)));
  }

  /**
   * Upload 15s Walkthrough Reel Video grouped under listing ID in S3:
   * S3 Key format: listings/{listingId}/reel-{uuid}{fileExt}
   */
  async uploadListingVideo(listingId: string, file: Express.Multer.File): Promise<string> {
    if (!file) throw new Error('No video file provided');
    this.logger.log(`🎬 Uploading 15s Reel video for listing [${listingId}]: ${file.originalname} (${file.size} bytes)`);
    return this.uploadFile(file, `listings/${listingId}`);
  }

  async uploadMultipleFiles(files: Express.Multer.File[], subfolder: string = 'uploads'): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadFile(file, subfolder)));
  }

  async getMediaFile(s3UrlOrKey: string): Promise<{ filePath: string; contentType: string; size: number } | null> {
    if (!s3UrlOrKey) return null;

    let key = s3UrlOrKey;
    let targetBucket = this.bucketName;

    if (s3UrlOrKey.startsWith('http://') || s3UrlOrKey.startsWith('https://')) {
      const urlObj = new URL(s3UrlOrKey);
      const hostParts = urlObj.hostname.split('.');
      if (hostParts.length > 0 && hostParts[0] !== 's3') {
        targetBucket = hostParts[0];
      }
      key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
    }

    const ext = path.extname(key) || '.bin';
    const hash = crypto.createHash('md5').update(`${targetBucket}:${key}`).digest('hex');
    const cachedFilePath = path.join(this.cacheDir, `${hash}${ext}`);
    const metaPath = path.join(this.cacheDir, `${hash}.meta.json`);

    // 1. Fast path: check if already cached on disk
    if (fs.existsSync(cachedFilePath) && fs.existsSync(metaPath)) {
      try {
        const stats = await fs.promises.stat(cachedFilePath);
        const meta = JSON.parse(await fs.promises.readFile(metaPath, 'utf8'));
        if (stats.size > 0) {
          return {
            filePath: cachedFilePath,
            contentType: meta.contentType || (ext === '.mp4' ? 'video/mp4' : 'application/octet-stream'),
            size: stats.size,
          };
        }
      } catch (err: any) {
        this.logger.warn(`Cache read error for ${hash}: ${err.message}`);
      }
    }

    // 2. Coalesce concurrent downloads for the same resource
    if (this.inFlightDownloads.has(hash)) {
      return this.inFlightDownloads.get(hash)!;
    }

    const downloadPromise = (async () => {
      try {
        if (!this.s3Client) return null;

        const command = new GetObjectCommand({
          Bucket: targetBucket,
          Key: key,
        });

        const response = await this.s3Client.send(command);
        if (!response.Body) return null;

        const tempPath = `${cachedFilePath}.tmp-${Date.now()}`;
        const writeStream = fs.createWriteStream(tempPath);
        await pipeline(response.Body as any, writeStream);

        const stats = await fs.promises.stat(tempPath);
        if (stats.size === 0) {
          await fs.promises.unlink(tempPath).catch(() => {});
          return null;
        }

        await fs.promises.rename(tempPath, cachedFilePath);
        const contentType = response.ContentType || (ext === '.mp4' ? 'video/mp4' : 'application/octet-stream');
        await fs.promises.writeFile(
          metaPath,
          JSON.stringify({ contentType, size: stats.size }),
          'utf8',
        );

        this.logger.log(`⚡ Cached S3 media to disk: ${key} (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
        return {
          filePath: cachedFilePath,
          contentType,
          size: stats.size,
        };
      } catch (err: any) {
        this.logger.error(`Error downloading S3 object for cache [${key}]: ${err.message}`);
        return null;
      } finally {
        this.inFlightDownloads.delete(hash);
      }
    })();

    this.inFlightDownloads.set(hash, downloadPromise);
    return downloadPromise;
  }

  async getS3Object(s3UrlOrKey: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    const media = await this.getMediaFile(s3UrlOrKey);
    if (!media || !fs.existsSync(media.filePath)) return null;
    try {
      const buffer = await fs.promises.readFile(media.filePath);
      return { buffer, contentType: media.contentType };
    } catch (err: any) {
      this.logger.error(`Error reading cached media buffer: ${err.message}`);
      return null;
    }
  }
}
