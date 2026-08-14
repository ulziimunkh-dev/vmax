import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadsService {
  private readonly logger = new Logger(UploadsService.name);
  private s3Client: S3Client | null = null;
  private bucketName: string;

  constructor(private configService: ConfigService) {
    const accessKeyId = this.configService.get<string>('aws.accessKeyId');
    const secretAccessKey = this.configService.get<string>('aws.secretAccessKey');
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    this.bucketName = this.configService.get<string>('aws.s3BucketName') || 'vmax-property-images';

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

    // Key format: e.g. listings/{listingId}/{uuid}.jpg or development/listings/{listingId}/{uuid}.jpg
    const s3Key = subfolder.startsWith('listings/')
      ? `${subfolder}/${uuidv4()}${fileExt}`
      : `${envFolder}/${subfolder}/${uuidv4()}${fileExt}`;

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

  async uploadMultipleFiles(files: Express.Multer.File[], subfolder: string = 'uploads'): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadFile(file, subfolder)));
  }

  async getS3Object(s3UrlOrKey: string): Promise<{ buffer: Buffer; contentType: string } | null> {
    if (!this.s3Client) return null;
    try {
      let key = s3UrlOrKey;
      if (s3UrlOrKey.startsWith('http://') || s3UrlOrKey.startsWith('https://')) {
        const urlObj = new URL(s3UrlOrKey);
        key = decodeURIComponent(urlObj.pathname.replace(/^\//, ''));
      }
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      const response = await this.s3Client.send(command);
      const streamToBuffer = async (stream: any): Promise<Buffer> => {
        const chunks: any[] = [];
        for await (const chunk of stream) {
          chunks.push(chunk);
        }
        return Buffer.concat(chunks);
      };
      const buffer = await streamToBuffer(response.Body);
      const contentType = response.ContentType || 'image/jpeg';
      return { buffer, contentType };
    } catch (err: any) {
      this.logger.error(`Error fetching S3 object: ${err.message}`);
      return null;
    }
  }
}
