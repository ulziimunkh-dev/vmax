import { Controller, Post, UseInterceptors, UploadedFiles, UploadedFile, UseGuards } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @UseInterceptors(FilesInterceptor('files', 10))
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[]) {
    const urls = await this.uploadsService.uploadMultipleFiles(files);
    return { urls };
  }

  @UseGuards(JwtAuthGuard)
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingleFile(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.uploadFile(file, 'uploads');
    return { url };
  }

  @UseGuards(JwtAuthGuard)
  @Post('avatar')
  @UseInterceptors(FileInterceptor('file'))
  async uploadAvatar(@UploadedFile() file: Express.Multer.File) {
    const url = await this.uploadsService.uploadFile(file, 'avatars');
    return { url };
  }
}


