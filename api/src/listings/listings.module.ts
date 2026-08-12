import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { Listing } from './listing.entity';
import { ListingExpiryCron } from './listing-expiry.cron';
import { MailModule } from '../mail/mail.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing]),
    MailModule,
  ],
  providers: [ListingsService, ListingExpiryCron],
  controllers: [ListingsController],
})
export class ListingsModule {}
