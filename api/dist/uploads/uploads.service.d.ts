import { ConfigService } from '@nestjs/config';
export declare class UploadsService {
    private configService;
    private readonly logger;
    private s3Client;
    private bucketName;
    constructor(configService: ConfigService);
    uploadFile(file: Express.Multer.File, subfolder?: string): Promise<string>;
    uploadMultipleFiles(files: Express.Multer.File[], subfolder?: string): Promise<string[]>;
}
