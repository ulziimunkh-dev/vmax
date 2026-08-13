import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { SavedSearch } from './saved-search.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class SavedSearchesService {
  private readonly logger = new Logger(SavedSearchesService.name);

  constructor(
    @InjectRepository(SavedSearch)
    private savedSearchesRepository: Repository<SavedSearch>,
  ) {}

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleExpiredSearchAlerts() {
    const now = new Date();
    await this.savedSearchesRepository
      .createQueryBuilder()
      .update(SavedSearch)
      .set({ isActive: false })
      .where('expiresAt <= :now AND isActive = true', { now })
      .execute();
    this.logger.log('🧹 Cleaned up expired 7-day search alert subscriptions');
  }

  async create(data: {
    userId?: string;
    email?: string;
    title?: string;
    filters: any;
    isEmailAlert?: boolean;
  }) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Valid for 7 days

    const savedSearch = this.savedSearchesRepository.create({
      userId: data.userId,
      email: data.email,
      title: data.title || 'Тохируулсан хайлтын мэдэгдэл',
      filters: data.filters,
      isEmailAlert: data.isEmailAlert ?? true,
      isActive: true,
      isTriggered: false,
      expiresAt,
    });

    return this.savedSearchesRepository.save(savedSearch);
  }

  async findByUserId(userId: string) {
    return this.savedSearchesRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async delete(id: string, userId?: string) {
    if (userId) {
      return this.savedSearchesRepository.delete({ id, userId });
    }
    return this.savedSearchesRepository.delete({ id });
  }

  async checkAndNotifyMatchingSearches(listing: Listing) {
    try {
      const now = new Date();
      const activeSavedSearches = await this.savedSearchesRepository
        .createQueryBuilder('alert')
        .where('alert.isActive = true')
        .andWhere('alert.isTriggered = false')
        .andWhere('(alert.expiresAt IS NULL OR alert.expiresAt >= :now)', { now })
        .getMany();

      if (activeSavedSearches.length === 0) return;

      const matchingAlerts: SavedSearch[] = [];

      for (const alert of activeSavedSearches) {
        const f = alert.filters || {};
        const listingPrice = Number(listing.price);

        // Check Type match (sale vs rent)
        if (f.type && listing.type && f.type.toLowerCase() !== listing.type.toLowerCase()) {
          continue;
        }

        // Check Category match
        if (f.category && listing.category && f.category.toLowerCase() !== listing.category.toLowerCase()) {
          continue;
        }

        // Check District match
        if (f.district && listing.district && !listing.district.toLowerCase().includes(f.district.toLowerCase())) {
          continue;
        }

        // Check Khoroo match
        if (f.khoroo && listing.khoroo && !listing.khoroo.toLowerCase().includes(f.khoroo.toLowerCase())) {
          continue;
        }

        // Check Min Price
        if (f.priceMin && listingPrice < Number(f.priceMin)) {
          continue;
        }

        // Check Max Price
        if (f.priceMax && listingPrice > Number(f.priceMax)) {
          continue;
        }

        // Check Area Min (м.кв)
        if (f.areaMin && Number(listing.areaSqm) < Number(f.areaMin)) {
          continue;
        }

        // Check Area Max (м.кв)
        if (f.areaMax && Number(listing.areaSqm) > Number(f.areaMax)) {
          continue;
        }

        // Check Bedrooms
        const attrs = listing.attributes || {};
        const listingBedrooms = attrs.bedrooms || attrs.rooms || 0;
        if (f.bedrooms && listingBedrooms < Number(f.bedrooms)) {
          continue;
        }

        // Check Bathrooms
        if (f.bathrooms && (attrs.bathrooms || 0) < Number(f.bathrooms)) {
          continue;
        }

        // Check Year Built Min
        if (f.yearBuiltMin && (attrs.yearBuilt || 0) < Number(f.yearBuiltMin)) {
          continue;
        }

        // Check Construction Type
        if (f.constructionType && attrs.constructionType) {
          if (!attrs.constructionType.toLowerCase().includes(f.constructionType.toLowerCase())) {
            continue;
          }
        }

        // Check Query string match
        if (f.query) {
          const q = f.query.toLowerCase();
          const matchTitle = listing.title.toLowerCase().includes(q);
          const matchDesc = listing.description?.toLowerCase().includes(q);
          if (!matchTitle && !matchDesc) continue;
        }

        matchingAlerts.push(alert);
      }

      if (matchingAlerts.length > 0) {
        this.logger.log(
          `🔔 Found ${matchingAlerts.length} matching search alerts for new listing "${listing.title}" (ID: ${listing.id})`
        );

        for (const alert of matchingAlerts) {
          const recipient = alert.email || `User #${alert.userId}`;
          this.logger.log(
            `📧 [INSTANT SINGLE ALERT SENT] Notified ${recipient}: New property match "${listing.title}" (${listing.price} ₮)`
          );

          // Mark as triggered and inactive (One-time alert per subscription)
          alert.isTriggered = true;
          alert.isActive = false;
          await this.savedSearchesRepository.save(alert);
        }
      }
    } catch (error) {
      this.logger.error(`Failed to check saved search alerts: ${error.message}`);
    }
  }
}

