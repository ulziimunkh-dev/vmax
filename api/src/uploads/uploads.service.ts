import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
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

  async uploadFile(file: Express.Multer.File, subfolder: string = 'uploads'): Promise<string> {
    const fileExt = path.extname(file.originalname);
    const folder = this.configService.get<string>('aws.folder') || 'development';
    const region = this.configService.get<string>('aws.region') || 'us-east-1';
    const s3Key = `${folder}/${subfolder}/${uuidv4()}${fileExt}`;

    // If AWS S3 credentials are provided, upload to Amazon S3
    if (this.s3Client) {
      try {
        const command = new PutObjectCommand({
          Bucket: this.bucketName,
          Key: s3Key,
          Body: file.buffer,
          ContentType: file.mimetype,
        });

        await this.s3Client.send(command);

        const s3Url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${s3Key}`;
        this.logger.log(`✅ File uploaded successfully to S3: ${s3Url}`);
        return s3Url;
      } catch (error) {
        this.logger.error(`❌ Failed to upload file to S3: ${error.message}`);
        // Fallback to local storage on S3 failure
      }
    }

    // Local Storage Fallback
    const uploadDir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const localFileName = `${uuidv4()}${fileExt}`;
    const filePath = path.join(uploadDir, localFileName);
    fs.writeFileSync(filePath, file.buffer || fs.readFileSync(file.path));

    return `/uploads/${localFileName}`;
  }

  async uploadMultipleFiles(files: Express.Multer.File[], subfolder: string = 'uploads'): Promise<string[]> {
    if (!files || files.length === 0) return [];
    return Promise.all(files.map((file) => this.uploadFile(file, subfolder)));
  }

}
