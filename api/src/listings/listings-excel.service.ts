import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as ExcelJS from 'exceljs';
import { Listing } from './listing.entity';
import { User } from '../users/user.entity';
import { ListingCategory, ListingStatus, ListingType } from './enums/listing.enums';

export interface ImportResult {
  success: boolean;
  totalRows: number;
  importedCount: number;
  failedCount: number;
  errors: { row: number; title: string; reason: string }[];
}

@Injectable()
export class ListingsExcelService {
  private readonly logger = new Logger(ListingsExcelService.name);

  constructor(
    @InjectRepository(Listing)
    private readonly listingsRepository: Repository<Listing>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  /**
   * 1. EXCEL-ЭЭР ТАТАЖ АВАХ (EXPORT)
   */
  async exportListingsToBuffer(filter: { userId?: string }): Promise<Buffer> {
    const where: any = {};
    if (filter.userId) {
      where.userId = filter.userId;
    }

    const listings = await this.listingsRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: 2000,
    });

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'Vmax.mn';
    workbook.created = new Date();

    const ws = workbook.addWorksheet('VMAX_ЗАРУУД', {
      views: [{ showGridLines: true }],
    });

    ws.columns = [
      { header: 'Д/д', key: 'no', width: 8 },
      { header: 'ID', key: 'id', width: 36 },
      { header: 'Зарын гарчиг', key: 'title', width: 35 },
      { header: 'Гүйлгээний төрөл', key: 'type', width: 16 },
      { header: 'Ангилал', key: 'category', width: 20 },
      { header: 'Нийт үнэ (₮)', key: 'price', width: 18 },
      { header: 'Талбай (м²)', key: 'areaSqm', width: 14 },
      { header: 'Өрөөний тоо', key: 'bedrooms', width: 12 },
      { header: 'Хэдэн давхарт', key: 'floor', width: 14 },
      { header: 'Нийт давхар', key: 'totalFloors', width: 14 },
      { header: 'Хот / Аймаг', key: 'location', width: 18 },
      { header: 'Дүүрэг / Сум', key: 'district', width: 18 },
      { header: 'Хороо', key: 'khoroo', width: 16 },
      { header: 'Холбоо барих утас', key: 'phone', width: 20 },
      { header: 'Үндсэн зураг', key: 'mainImage', width: 35 },
      { header: 'Бүх зураг (холбоос)', key: 'images', width: 45 },
      { header: 'Дэлгэрэнгүй тайлбар', key: 'description', width: 50 },
      { header: 'Үүсгэсэн огноо', key: 'createdAt', width: 18 },
    ];

    // Header styling
    const headerRow = ws.getRow(1);
    headerRow.height = 28;
    headerRow.eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF1F4E79' },
      };
      cell.font = { name: 'Segoe UI', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    listings.forEach((item: Listing, idx: number) => {
      const attrs = (item.attributes || {}) as Record<string, any>;
      const imgs = Array.isArray(item.images) ? item.images : [];
      const row = ws.addRow({
        no: idx + 1,
        id: item.id,
        title: item.title,
        type:
          item.type === ListingType.DAILY_RENT
            ? 'Хоногоор түрээслүүлнэ'
            : item.type === ListingType.RENT
            ? 'Түрээслүүлнэ'
            : 'Зарна',
        category: this.mapCategoryToMn(item.category),
        price: item.price,
        areaSqm: item.areaSqm,
        bedrooms: attrs.bedrooms || attrs.rooms || '',
        floor: attrs.floor || '',
        totalFloors: attrs.totalFloors || '',
        location: item.location || 'Улаанбаатар',
        district: item.district || '',
        khoroo: item.khoroo || '',
        phone: item.contactPhone || attrs.phone || '',
        mainImage: imgs[0] || '',
        images: imgs.join(', '),
        description: item.description || '',
        createdAt: item.createdAt ? new Date(item.createdAt).toISOString().slice(0, 10) : '',
      });

      row.height = 22;
      row.getCell('price').numFmt = '#,##0" ₮"';
      row.alignment = { vertical: 'middle' };
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * 2. БЭЛЭН ЗАГВАР EXCEL ФАЙЛ (TEMPLATE)
   */
  async generateSampleTemplate(): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('ЗАГВАР_ОРУУЛАХ');

    ws.columns = [
      { header: 'Зарын гарчиг *', key: 'title', width: 35 },
      { header: 'Гүйлгээний төрөл (Зарна/Түрээслүүлнэ) *', key: 'type', width: 30 },
      { header: 'Ангилал (Орон сууц/Хаус/Газар/Оффис/Үйлчилгээ) *', key: 'category', width: 35 },
      { header: 'Нийт үнэ (₮) *', key: 'price', width: 18 },
      { header: 'Талбай (м²) *', key: 'areaSqm', width: 14 },
      { header: 'Өрөөний тоо', key: 'bedrooms', width: 12 },
      { header: 'Хэдэн давхарт', key: 'floor', width: 14 },
      { header: 'Нийт давхар', key: 'totalFloors', width: 14 },
      { header: 'Хот / Аймаг', key: 'location', width: 18 },
      { header: 'Дүүрэг / Сум *', key: 'district', width: 18 },
      { header: 'Хороо', key: 'khoroo', width: 16 },
      { header: 'Байршил / Хотхон', key: 'address', width: 25 },
      { header: 'Утасны дугаар *', key: 'phone', width: 20 },
      { header: 'Төлбөрийн нөхцөл', key: 'paymentTerms', width: 20 },
      { header: 'Бүх зургийн линк (таслалаар тусгаарлах)', key: 'images', width: 45 },
      { header: 'Дэлгэрэнгүй тайлбар', key: 'description', width: 45 },
    ];

    ws.getRow(1).height = 30;
    ws.getRow(1).eachCell((cell) => {
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF863BFF' }, // VMAX Brand Purple
      };
      cell.font = { name: 'Segoe UI', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
      cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
    });

    // Example Row
    ws.addRow({
      title: 'ХУД 15-р хороо King Tower 3 өрөө 84мкв байр',
      type: 'Зарна',
      category: 'Орон сууц',
      price: 520000000,
      areaSqm: 84,
      bedrooms: 3,
      floor: 12,
      totalFloors: 16,
      location: 'Улаанбаатар',
      district: 'Хан-Уул',
      khoroo: '15-р хороо',
      address: 'King Tower',
      phone: '99112233',
      paymentTerms: 'Бэлэн болон банкны зээл',
      images: 'https://cdn1.unegui.mn/sample1.webp, https://cdn1.unegui.mn/sample2.webp',
      description: 'Мастер унтлагын өрөөтэй, наран тал руу харсан цонхтой цэвэрхэн тохилог орон сууц.',
    });

    return (await workbook.xlsx.writeBuffer()) as unknown as Buffer;
  }

  /**
   * 3. EXCEL БУФФЕРЭЭС ЗАР БӨӨНӨӨР БААЗАД ОРУУЛАХ (IMPORT)
   */
  async importFromBuffer(buffer: Buffer, userId?: string): Promise<ImportResult> {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(buffer as any);
    const ws = workbook.worksheets[0];

    const result: ImportResult = {
      success: true,
      totalRows: 0,
      importedCount: 0,
      failedCount: 0,
      errors: [],
    };

    if (!ws || ws.rowCount < 2) {
      result.success = false;
      result.errors.push({ row: 0, title: 'Файл', reason: 'Excel файлд өгөгдөл олдсонгүй.' });
      return result;
    }

    // Resolve userId if not provided
    let finalUserId = userId;
    if (!finalUserId) {
      const users = await this.usersRepository.find({
        order: { createdAt: 'ASC' },
        take: 1,
      });
      if (users.length > 0) {
        finalUserId = users[0].id;
      }
    }

    // Dynamic header mapping
    const headerMap: { [key: string]: number } = {};
    ws.getRow(1).eachCell((cell, colNumber) => {
      const val = cell.value?.toString().toLowerCase().trim() || '';
      headerMap[val] = colNumber;
    });

    const getCol = (possibleNames: string[]): number | undefined => {
      for (const name of possibleNames) {
        for (const [key, idx] of Object.entries(headerMap)) {
          if (key.includes(name.toLowerCase())) return idx;
        }
      }
      return undefined;
    };

    const titleCol = getCol(['зарын гарчиг', 'гарчиг', 'title']) || 4;
    const typeCol = getCol(['гүйлгээний төрөл', 'гүйлгээ', 'төрөл', 'type']) || 6;
    const catCol = getCol(['үл хөдлөхийн төрөл', 'ангилал', 'category']) || 5;
    const priceCol = getCol(['нийт үнэ', 'үнэ (₮)', 'үнэ', 'price']) || 7;
    const areaCol = getCol(['талбай', 'area']) || 10;
    const roomCol = getCol(['өрөөний тоо', 'өрөө', 'bedroom']) || 11;
    const floorCol = getCol(['хэдэн давхарт', 'давхар', 'floor']) || 12;
    const totalFloorCol = getCol(['нийт давхар', 'totalfloors']) || 13;
    const locCol = getCol(['хот / аймаг', 'хот', 'аймаг', 'location']) || 14;
    const distCol = getCol(['дүүрэг / сум', 'дүүрэг', 'сум', 'district']) || 15;
    const khorooCol = getCol(['хороо', 'khoroo']) || 16;
    const addressCol = getCol(['байршил / хотхон', 'байршил', 'хотхон', 'address']) || 17;
    const phoneCol = getCol(['утасны дугаар', 'утас', 'phone']) || 24;
    const imgCol = getCol(['бүх зургийн линк', 'бүх зураг', 'зураг', 'image']) || 29;
    const mainImgCol = getCol(['үндсэн зураг']) || 28;
    const descCol = getCol(['дэлгэрэнгүй тайлбар', 'тайлбар', 'description']) || 27;
    const uneguiIdCol = getCol(['зарын id (unegui)', 'зарын id']) || 3;
    const urlCol = getCol(['эх сурвалж', 'unegui url', 'url']) || 30;
    const paymentCol = getCol(['төлбөрийн нөхцөл']) || 18;
    const buildCol = getCol(['барилгын явц']) || 19;
    const yearCol = getCol(['ашиглалтад орсон он']) || 20;
    const windowCol = getCol(['цонх']) || 21;
    const garageCol = getCol(['гараж']) || 22;
    const balconyCol = getCol(['тагт']) || 23;

    const listingsToCreate: Partial<Listing>[] = [];

    const now = new Date();
    const expiresAt = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 30,
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds(),
    ));

    for (let rowNumber = 2; rowNumber <= ws.rowCount; rowNumber++) {
      const row = ws.getRow(rowNumber);
      const title = row.getCell(titleCol).value?.toString().trim();
      if (!title) continue;

      result.totalRows++;

      try {
        const typeRaw = row.getCell(typeCol).value?.toString().toLowerCase() || '';
        let type = ListingType.SALE;
        if (typeRaw.includes('өдөр') || typeRaw.includes('хоног') || typeRaw.includes('stay') || typeRaw.includes('daily')) {
          type = ListingType.DAILY_RENT;
        } else if (typeRaw.includes('түрээс') || typeRaw.includes('rent')) {
          type = ListingType.RENT;
        }

        const catRaw = row.getCell(catCol).value?.toString() || '';
        const category = this.mapCategoryToEnum(catRaw);

        // Price parse
        const priceRaw = row.getCell(priceCol).value;
        let price = 0;
        if (typeof priceRaw === 'number') {
          price = priceRaw;
        } else if (priceRaw) {
          const cleaned = priceRaw.toString().replace(/[^\d.]/g, '');
          price = parseFloat(cleaned) || 0;
        }

        // Area parse
        const areaRaw = row.getCell(areaCol).value?.toString().replace(',', '.') || '0';
        const areaSqm = parseFloat(areaRaw.replace(/[^\d.]/g, '')) || 0;

        // Rooms / Floor
        const roomVal = parseInt(row.getCell(roomCol).value?.toString() || '0', 10);
        const floorVal = parseInt(row.getCell(floorCol).value?.toString() || '0', 10);
        const totalFloorVal = parseInt(row.getCell(totalFloorCol).value?.toString() || '0', 10);

        // Phone
        const rawPhone = row.getCell(phoneCol).value?.toString().trim() || '';
        const contactPhone = rawPhone.replace(/[^\d+]/g, '');

        // Location / District / Khoroo
        const locationVal = row.getCell(locCol).value?.toString().trim() || 'Улаанбаатар';
        const districtVal = row.getCell(distCol).value?.toString().trim() || 'Хан-Уул';
        const khorooVal = row.getCell(khorooCol).value?.toString().trim() || '';
        const addressVal = row.getCell(addressCol).value?.toString().trim() || '';

        // Description
        let description = row.getCell(descCol).value?.toString().trim() || title;
        if (contactPhone && !description.includes(contactPhone)) {
          description += `\n\nХолбогдох утас: ${contactPhone}`;
        }

        // Images: priority to all images list, fallback to main image
        const imgRaw = row.getCell(imgCol).value?.toString() || '';
        const mainImgRaw = row.getCell(mainImgCol).value?.toString() || '';
        let images: string[] = [];

        if (imgRaw) {
          images = imgRaw
            .split(/[,;\n]/)
            .map((u) => u.trim())
            .filter((u) => u.startsWith('http'));
        }
        if (images.length === 0 && mainImgRaw && mainImgRaw.startsWith('http')) {
          images = [mainImgRaw.trim()];
        }

        // Fallback extract room count from title/description when Excel column is empty
        let resolvedRoomVal = !isNaN(roomVal) && roomVal > 0 ? roomVal : 0;
        if (resolvedRoomVal === 0 && category !== 'LAND') {
          const roomRe = /(?:^|[^\d])([1-9][0-9]?)\s*(?:-н\s*|-?тай\s*)?(?:өрөө|oroo|uruu)/i;
          const tm = title.match(roomRe) || description.match(roomRe);
          if (tm) resolvedRoomVal = parseInt(tm[1], 10);
        }

        // Attributes
        const attributes: Record<string, any> = {
          bedrooms: resolvedRoomVal > 0 ? resolvedRoomVal : undefined,
          rooms: resolvedRoomVal > 0 ? resolvedRoomVal : undefined,
          floor: !isNaN(floorVal) && floorVal > 0 ? floorVal : undefined,
          totalFloors: !isNaN(totalFloorVal) && totalFloorVal > 0 ? totalFloorVal : undefined,
          originalCategory: catRaw,
          address: addressVal || undefined,
          paymentTerms: row.getCell(paymentCol).value?.toString().trim() || undefined,
          buildingStage: row.getCell(buildCol).value?.toString().trim() || undefined,
          yearBuilt: parseInt(row.getCell(yearCol).value?.toString() || '0', 10) || undefined,
          windowDirections: row.getCell(windowCol).value?.toString().trim() || undefined,
          garage: row.getCell(garageCol).value?.toString().trim() || undefined,
          balcony: row.getCell(balconyCol).value?.toString().trim() || undefined,
          uneguiId: row.getCell(uneguiIdCol).value?.toString().trim() || undefined,
          originalUrl: row.getCell(urlCol).value?.toString().trim() || undefined,
          source: 'Excel Importer',
          importDate: new Date().toISOString(),
        };

        const listingEntity: Partial<Listing> = {
          title,
          description,
          type,
          category,
          price,
          areaSqm,
          location: locationVal,
          district: districtVal,
          khoroo: khorooVal || undefined,
          images,
          contactPhone: contactPhone || undefined,
          status: ListingStatus.ACTIVE,
          userId: finalUserId,
          expiresAt,
          attributes,
          viewsCount: 0,
          sharesCount: 0,
          phoneRevealsCount: 0,
        };

        listingsToCreate.push(listingEntity);
      } catch (err: any) {
        result.failedCount++;
        result.errors.push({
          row: rowNumber,
          title: title || 'N/A',
          reason: err.message || 'Формат буруу байна',
        });
      }
    }

    // Save to PostgreSQL via TypeORM
    if (listingsToCreate.length > 0) {
      try {
        const entities = this.listingsRepository.create(listingsToCreate);
        await this.listingsRepository.save(entities, { chunk: 50 });
        result.importedCount = listingsToCreate.length;
      } catch (dbErr: any) {
        this.logger.error(`Database error bulk saving listings: ${dbErr.message}`);
        // Fallback row by row saving
        for (let i = 0; i < listingsToCreate.length; i++) {
          try {
            const single = this.listingsRepository.create(listingsToCreate[i]);
            await this.listingsRepository.save(single);
            result.importedCount++;
          } catch (singleErr: any) {
            result.failedCount++;
            result.errors.push({
              row: i + 2,
              title: listingsToCreate[i].title || 'N/A',
              reason: singleErr.message || 'Баазад хадгалахад алдаа гарлаа',
            });
          }
        }
      }
    }

    result.success = result.failedCount === 0;
    return result;
  }

  private mapCategoryToEnum(raw: string): ListingCategory {
    const lower = (raw || '').toLowerCase();
    if (lower.includes('сууц') || lower.includes('байр') || lower.includes('өрөө') || lower.includes('apartment')) {
      return ListingCategory.APARTMENT;
    }
    if (lower.includes('хаус') || lower.includes('зуслан') || lower.includes('аос') || lower.includes('house')) {
      return ListingCategory.HOUSE;
    }
    if (lower.includes('газар') || lower.includes('хашаа') || lower.includes('land')) {
      return ListingCategory.LAND;
    }
    if (lower.includes('амралт') || lower.includes('сувилал') || lower.includes('resort')) {
      return ListingCategory.RESORT;
    }
    // Office, commercial, warehouse, objects map to COMMERCIAL
    return ListingCategory.COMMERCIAL;
  }

  private mapCategoryToMn(categoryEnum: ListingCategory | string): string {
    const map: { [key: string]: string } = {
      [ListingCategory.APARTMENT]: 'Орон сууц',
      [ListingCategory.HOUSE]: 'Хаус / Зуслан',
      [ListingCategory.LAND]: 'Газар',
      [ListingCategory.COMMERCIAL]: 'Үйлчилгээ / Оффис',
      [ListingCategory.RESORT]: 'Амралтын газар',
    };
    return map[categoryEnum] || String(categoryEnum);
  }
}
