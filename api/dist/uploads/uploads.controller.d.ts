import { UploadsService } from './uploads.service';
export declare class UploadsController {
    private readonly uploadsService;
    constructor(uploadsService: UploadsService);
    uploadFiles(files: Express.Multer.File[]): Promise<{
        urls: string[];
    }>;
    uploadSingleFile(file: Express.Multer.File): Promise<{
        url: string;
    }>;
    uploadAvatar(file: Express.Multer.File): Promise<{
        url: string;
    }>;
}
