import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
import { ListingsExcelService } from './listings-excel.service';
import { ListingsExcelController } from './listings-excel.controller';
import { Listing } from './listing.entity';
import { User } from '../users/user.entity';
import { ListingExpiryCron } from './listing-expiry.cron';
import { MailModule } from '../mail/mail.module';
import { SavedSearchesModule } from '../saved-searches/saved-searches.module';
import { ListingContactLog } from './listing-contact-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Listing, User, ListingContactLog]),
    MailModule,
    SavedSearchesModule,
  ],
  providers: [ListingsService, ListingsExcelService, ListingExpiryCron],
  controllers: [ListingsExcelController, ListingsController],
})
export class ListingsModule {}
