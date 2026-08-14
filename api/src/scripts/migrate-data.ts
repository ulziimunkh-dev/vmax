import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { DataSource } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { UploadsService } from '../uploads/uploads.service';
import * as fs from 'fs';
import * as path from 'path';

async function migrateData() {
  console.log('🔄 Starting Vmax data migration script...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);
  const uploadsService = app.get(UploadsService);
  const listingRepo = dataSource.getRepository(Listing);

  const listings = await listingRepo.find();
  console.log(`📋 Found ${listings.length} existing listings to process.`);

  let updatedCount = 0;

  for (const listing of listings) {
    let modified = false;

    // 1. Backfill Khoroo if missing in database
    if (!listing.khoroo) {
      const match = listing.title.match(/(\d+-р хороо|\d+-р хороонд)/i) || listing.description.match(/(\d+-р хороо|\d+-р хороонд)/i);
      if (match) {
        listing.khoroo = match[1].replace('хороонд', 'хороо');
        modified = true;
        console.log(`  📍 Extracted Khoroo for [${listing.title.slice(0, 30)}...]: ${listing.khoroo}`);
      } else {
        listing.khoroo = '1-р хороо';
        modified = true;
      }
    }

    // 2. Migrate images into parent folder grouped by listing ID: listings/{listingId}/{filename}
    if (listing.images && listing.images.length > 0) {
      const newImages: string[] = [];

      for (let idx = 0; idx < listing.images.length; idx++) {
        const img = listing.images[idx];

        // If image is already grouped under listings/{listingId}/, keep as is
        if (img.includes(`/listings/${listing.id}/`) || img.includes(`listings/${listing.id}/`)) {
          newImages.push(img);
          continue;
        }

        // Try migrating local files or demo placeholder images
        try {
          let fileBuffer: Buffer | null = null;
          let fileExt = '.png';

          if (img.startsWith('/uploads/')) {
            const localPath = path.join(process.cwd(), img.replace('/uploads/', 'uploads/'));
            if (fs.existsSync(localPath)) {
              fileBuffer = fs.readFileSync(localPath);
              fileExt = path.extname(localPath) || '.png';
            }
          } else if (img.startsWith('/images/')) {
            const publicPath = path.join(process.cwd(), '..', 'client', 'public', img.slice(1));
            if (fs.existsSync(publicPath)) {
              fileBuffer = fs.readFileSync(publicPath);
              fileExt = path.extname(publicPath) || '.png';
            }
          }

          if (fileBuffer) {
            const mockFile: Express.Multer.File = {
              fieldname: 'files',
              originalname: `image-${idx + 1}${fileExt}`,
              encoding: '7bit',
              mimetype: fileExt === '.png' ? 'image/png' : 'image/jpeg',
              buffer: fileBuffer,
              size: fileBuffer.length,
              stream: null as any,
              destination: '',
              filename: `image-${idx + 1}${fileExt}`,
              path: '',
            };

            // Upload using UploadsService under subfolder `listings/${listing.id}`
            const migratedUrl = await uploadsService.uploadFile(mockFile, `listings/${listing.id}`);
            newImages.push(migratedUrl);
            modified = true;
            console.log(`  📸 Migrated image ${idx + 1} for listing [${listing.id}]: ${migratedUrl}`);
          } else {
            newImages.push(img);
          }
        } catch (err: any) {
          console.warn(`  ⚠️ Could not migrate image [${img}]:`, err.message);
          newImages.push(img);
        }
      }

      listing.images = newImages;
    }

    if (modified) {
      await listingRepo.save(listing);
      updatedCount++;
    }
  }

  console.log(`✨ Data migration completed successfully! Updated ${updatedCount}/${listings.length} listings.`);
  await app.close();
}

migrateData().catch((err) => {
  console.error('❌ Data migration failed:', err);
  process.exit(1);
});
