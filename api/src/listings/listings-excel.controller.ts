import {
  Controller,
  Get,
  Post,
  Res,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  BadRequestException,
  ForbiddenException,
  Query,
  Req,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Response } from 'express';
import { ListingsExcelService } from './listings-excel.service';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('listings')
export class ListingsExcelController {
  constructor(private readonly excelService: ListingsExcelService) { }

  /**
   * 1. EXCEL ТАТАХ (EXPORT)
   * GET /api/listings/export/excel?myOnly=true
   * Бүх зар татах (myOnly !== 'true') эрх зөвхөн 89767700 дугаартай админд нээлттэй.
   */
  @Get('export/excel')
  @UseGuards(OptionalJwtAuthGuard)
  async exportListings(
    @Res() res: Response,
    @Query('myOnly') myOnly?: string,
    @Req() req?: any,
  ) {
    const user = req?.user;
    const cleanPhone = (user?.phone || '').replace(/\D/g, '');
    const isSuperAdmin = cleanPhone.endsWith('89767700') || cleanPhone.endsWith('89357373');

    // Хэрэв бүх зар татахыг хүсэж байгаа боловч 89767700 дугаартай хэрэглэгч биш бол хориглоно
    if (myOnly !== 'true' && !isSuperAdmin) {
      throw new ForbiddenException(
        'Бүх зарыг экспортлох эрх зөвхөн 89767700 дугаартай хэрэглэгчид олгогдсон. Та өөрийн зарыг татна уу (myOnly=true).',
      );
    }

    const userId = user?.id;
    const buffer = await this.excelService.exportListingsToBuffer({
      userId: myOnly === 'true' && userId ? userId : (isSuperAdmin && myOnly !== 'true' ? undefined : userId),
    });

    const filename = `vmax_listings_${new Date().toISOString().slice(0, 10)}.xlsx`;

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${filename}"`,
    );

    res.send(buffer);
  }

  /**
   * 2. БЭЛЭН ЗАГВАР ТАТАХ (SAMPLE TEMPLATE)
   * GET /api/listings/import/template
   */
  @Get('import/template')
  async downloadTemplate(@Res() res: Response) {
    const buffer = await this.excelService.generateSampleTemplate();

    res.setHeader(
      'Content-Type',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    res.setHeader(
      'Content-Disposition',
      'attachment; filename="vmax_import_template.xlsx"',
    );

    res.send(buffer);
  }

  /**
   * 3. EXCEL-ЭЭР ЗАР БӨӨНӨӨР ОРУУЛАХ (IMPORT)
   * POST /api/listings/import/excel
   */
  @Post('import/excel')
  @UseGuards(OptionalJwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: 30 * 1024 * 1024 }, // 30MB max
      fileFilter: (req, file, cb) => {
        if (
          file.mimetype.includes('spreadsheetml') ||
          file.mimetype.includes('excel') ||
          file.mimetype.includes('csv') ||
          file.originalname.match(/\.(xlsx|xls|csv)$/i)
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Зөвхөн .xlsx, .xls эсвэл .csv файл оруулна уу!'), false);
        }
      },
    }),
  )
  async importListings(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('Excel файл сонгогдоогүй байна!');
    }

    const userId = req?.user?.id;
    return await this.excelService.importFromBuffer(file.buffer, userId);
  }
}
