import { Controller, Post, Get, Query, Res, UseInterceptors, UploadedFiles, UploadedFile, UseGuards } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('s3')
  async getS3Image(@Query('url') url: string, @Res() res: any) {
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }
    const s3Data = await this.uploadsService.getS3Object(url);
    if (!s3Data) {
      return res.redirect('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop');
    }
    res.setHeader('Content-Type', s3Data.contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400');
    return res.send(s3Data.buffer);
  }

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


