import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ListingsService } from './listings.service';
import { ListingsController } from './listings.controller';
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



  providers: [ListingsService, ListingExpiryCron],
  controllers: [ListingsController],
})
export class ListingsModule {}
