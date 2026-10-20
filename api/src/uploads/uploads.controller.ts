import { Controller, Post, Get, Param, Query, Res, Req, UseInterceptors, UploadedFiles, UploadedFile, UseGuards } from '@nestjs/common';
import { FilesInterceptor, FileInterceptor } from '@nestjs/platform-express';
import * as fs from 'fs';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { UploadsService } from './uploads.service';

@Controller('uploads')
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Get('s3')
  async getS3Image(@Query('url') url: string, @Req() req: any, @Res() res: any) {
    if (!url) {
      return res.status(400).send('Missing url parameter');
    }
    const media = await this.uploadsService.getMediaFile(url);
    if (!media || !fs.existsSync(media.filePath)) {
      if (url.includes('.mp4') || url.includes('.webm') || url.includes('.mov')) {
        return res.status(404).send('Video not found');
      }
      return res.redirect('https://images.unsplash.com/photo-1560518883-ce09059eeffa?q=80&w=800&auto=format&fit=crop');
    }

    const totalSize = media.size;
    const range = req.headers?.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : totalSize - 1;

      if (isNaN(start) || start >= totalSize || end >= totalSize || start > end) {
        res.setHeader('Content-Range', `bytes */${totalSize}`);
        return res.status(416).send('Requested range not satisfiable');
      }

      const chunkSize = (end - start) + 1;

      res.status(206);
      res.setHeader('Content-Range', `bytes ${start}-${end}/${totalSize}`);
      res.setHeader('Accept-Ranges', 'bytes');
      res.setHeader('Content-Length', chunkSize);
      res.setHeader('Content-Type', media.contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      const stream = fs.createReadStream(media.filePath, { start, end });
      return stream.pipe(res);
    }

    res.setHeader('Content-Type', media.contentType);
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', totalSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    const stream = fs.createReadStream(media.filePath);
    return stream.pipe(res);
  }

  /**
   * Upload listing photos grouped under parent listing folder in S3:
   * S3 Path: production/listings/{listingId}/{uuid}.webp
   */
  @UseGuards(JwtAuthGuard)
  @Post('listings/:listingId')
  @UseInterceptors(FilesInterceptor('files', 15))
  async uploadListingFiles(
    @Param('listingId') listingId: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    const urls = await this.uploadsService.uploadListingImages(listingId, files);
    return { urls };
  }

  /**
   * Upload 15s Walkthrough Reel Video grouped under parent listing folder in S3:
   * S3 Path: production/listings/{listingId}/reel-{uuid}.mp4
   */
  @UseGuards(JwtAuthGuard)
  @Post('listings/:listingId/video')
  @UseInterceptors(FileInterceptor('video', {
    limits: { fileSize: 100 * 1024 * 1024 }, // Max 100MB for up to 1.30min (90s) video
  }))
  async uploadListingVideo(
    @Param('listingId') listingId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const url = await this.uploadsService.uploadListingVideo(listingId, file);
    return { url };
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
  async uploadAvatar(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub || 'common';
    const url = await this.uploadsService.uploadFile(file, `avatars/${userId}`);
    return { url };
  }
}
