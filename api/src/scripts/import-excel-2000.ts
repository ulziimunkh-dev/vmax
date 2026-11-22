import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { ListingsExcelService } from '../listings/listings-excel.service';
import { DataSource } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import * as fs from 'fs';
import * as path from 'path';

async function main() {
  console.log('🚀 Initializing VMAX NestJS application context...');
  const app = await NestFactory.createApplicationContext(AppModule);
  const excelService = app.get(ListingsExcelService);
  const dataSource = app.get(DataSource);
  const listingRepo = dataSource.getRepository(Listing);

  const initialCount = await listingRepo.count();
  console.log(`📊 Initial listings count in database: ${initialCount}`);

  const filePath = path.resolve('unegui_real_estate_2000_mixed.xlsx');
  console.log(`📂 Reading Excel file: ${filePath}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);
  console.log(`📦 Buffer size: ${fileBuffer.length} bytes. Starting import...`);

  const t0 = Date.now();
  const result = await excelService.importFromBuffer(fileBuffer);
  const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

  console.log('====================================');
  console.log(`✅ Import finished in ${elapsed}s!`);
  console.log(`   Total Rows in file: ${result.totalRows}`);
  console.log(`   Successfully Imported: ${result.importedCount}`);
  console.log(`   Skipped Duplicates: ${result.skippedCount}`);
  console.log(`   Failed Rows: ${result.failedCount}`);
  if (result.errors.length > 0) {
    console.log(`   First 5 Errors:`, result.errors.slice(0, 5));
  }
  console.log('====================================');

  const finalCount = await listingRepo.count();
  console.log(`📊 Final listings count in database: ${finalCount}`);

  await app.close();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Error during import:', err);
  process.exit(1);
});
