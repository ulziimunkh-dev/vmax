import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { Listing } from './listing.entity';
import { ListingStatus } from './enums/listing.enums';
import { MailService } from '../mail/mail.service';

@Injectable()
export class ListingExpiryCron {
  private readonly logger = new Logger(ListingExpiryCron.name);

  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    private mailService: MailService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    this.logger.debug('Running listing expiry check...');

    const now = new Date();

    const expiredListings = await this.listingsRepository.find({
      where: {
        status: ListingStatus.ACTIVE,
        expiresAt: LessThan(now),
      },
      relations: { user: true },
    });

    if (expiredListings.length > 0) {
      this.logger.log(`Found ${expiredListings.length} expired listings.`);

      for (const listing of expiredListings) {
        listing.status = ListingStatus.EXPIRED;
        await this.listingsRepository.save(listing);

        try {
          await this.mailService.sendListingExpiredEmail(listing.user, listing);
          this.logger.log(`Sent expiry email to ${listing.user.email} for listing ${listing.id}`);
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : 'Unknown error';
          this.logger.error(`Failed to send email for listing ${listing.id}: ${message}`);
        }
      }
    } else {
      this.logger.debug('No expired listings found.');
    }
  }
}
