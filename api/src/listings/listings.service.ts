import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Listing } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { User } from '../users/user.entity';
import { ListingStatus, PromotionTier } from './enums/listing.enums';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '../users/enums/user.enums';

import { ListingContactLog } from './listing-contact-log.entity';
import { SavedSearchesService } from '../saved-searches/saved-searches.service';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(ListingContactLog)
    private contactLogsRepository: Repository<ListingContactLog>,
    private savedSearchesService: SavedSearchesService,
  ) { }



  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredAndPromotedListings() {
    const now = new Date();

    // Auto-expire listings past their expiration date
    await this.listingsRepository
      .createQueryBuilder()
      .update(Listing)
      .set({ status: ListingStatus.EXPIRED })
      .where('expiresAt <= :now AND status = :activeStatus', {
        now,
        activeStatus: ListingStatus.ACTIVE,
      })
      .execute();

    // Auto-unpromote listings past their promotion period
    await this.listingsRepository
      .createQueryBuilder()
      .update(Listing)
      .set({ isPromoted: false, promotionTier: PromotionTier.STANDARD })
      .where('promotedUntil <= :now AND isPromoted = true', { now })
      .execute();
  }

  private async checkUserQuota(user: User) {
    const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
    const tier = freshUser?.subscriptionTier || SubscriptionTier.FREE;
    const limit = SUBSCRIPTION_LIMITS[tier] || 3;

    const activeCount = await this.listingsRepository.count({
      where: { userId: user.id, status: ListingStatus.ACTIVE },
    });

    if (activeCount >= limit) {
      throw new ForbiddenException(
        `Зарын хязгаар хэтэрсэн байна. Таны (${tier}) багцын зөвшөөрөгдөх идэвхтэй зарын хязгаар ${limit} байна. Та багцаа ахиулна уу.`
      );
    }
  }

  async findAll(query: QueryListingDto) {
    const { type, category, location, priceMin, priceMax, areaMin, areaMax, sortBy } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 50;

    const queryBuilder = this.listingsRepository.createQueryBuilder('listing');
    queryBuilder.leftJoinAndSelect('listing.user', 'user');

    queryBuilder.where('listing.status = :status', { status: ListingStatus.ACTIVE });

    if (type) queryBuilder.andWhere('listing.type = :type', { type });
    if (category) queryBuilder.andWhere('listing.category = :category', { category });
    if (location) queryBuilder.andWhere('(listing.location ILIKE :location OR listing.district ILIKE :location OR listing.khoroo ILIKE :location)', { location: `%${location}%` });
    if (query.khoroo) queryBuilder.andWhere('listing.khoroo ILIKE :khoroo', { khoroo: `%${query.khoroo}%` });

    if (priceMin !== undefined) queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
    if (priceMax !== undefined) queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });

    if (areaMin !== undefined) queryBuilder.andWhere('listing.areaSqm >= :areaMin', { areaMin });
    if (areaMax !== undefined) queryBuilder.andWhere('listing.areaSqm <= :areaMax', { areaMax });

    if (query.bedrooms !== undefined) {
      queryBuilder.andWhere("CAST(listing.attributes->>'bedrooms' AS INTEGER) >= :bedrooms", { bedrooms: query.bedrooms });
    }
    if (query.bathrooms !== undefined) {
      queryBuilder.andWhere("CAST(listing.attributes->>'bathrooms' AS INTEGER) >= :bathrooms", { bathrooms: query.bathrooms });
    }
    if (query.yearBuiltMin !== undefined) {
      queryBuilder.andWhere("CAST(listing.attributes->>'yearBuilt' AS INTEGER) >= :yearBuiltMin", { yearBuiltMin: query.yearBuiltMin });
    }
    if (query.constructionType) {
      queryBuilder.andWhere("listing.attributes->>'constructionType' ILIKE :constructionType", { constructionType: `%${query.constructionType}%` });
    }


    if (query.search) {
      queryBuilder.andWhere('(listing.title ILIKE :search OR listing.description ILIKE :search)', { search: `%${query.search}%` });
    }

    if (sortBy === 'views') {
      queryBuilder.orderBy('listing.viewsCount', 'DESC');
    } else if (sortBy === 'mostShared') {
      queryBuilder.orderBy('listing.sharesCount', 'DESC');
    } else if (sortBy === 'priceAsc') {
      queryBuilder.orderBy('listing.price', 'ASC');
    } else if (sortBy === 'priceDesc') {
      queryBuilder.orderBy('listing.price', 'DESC');
    } else {
      queryBuilder.orderBy('listing.isPromoted', 'DESC');
      queryBuilder.addOrderBy('listing.createdAt', 'DESC');
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(id: string) {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    listing.viewsCount = (listing.viewsCount || 0) + 1;
    await this.listingsRepository.save(listing);
    return listing;
  }

  async incrementShares(id: string) {
    const listing = await this.listingsRepository.findOne({ where: { id } });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }
    listing.sharesCount = (listing.sharesCount || 0) + 1;
    return this.listingsRepository.save(listing);
  }

  async revealPhoneContact(id: string, viewerUser?: any, reqIp?: string, userAgent?: string) {
    const listing = await this.listingsRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!listing) {
      throw new NotFoundException('Listing not found');
    }

    listing.phoneRevealsCount = (listing.phoneRevealsCount || 0) + 1;
    await this.listingsRepository.save(listing);

    // Save audit log
    const log = this.contactLogsRepository.create({
      listingId: id,
      viewerUserId: viewerUser?.id,
      viewerIp: reqIp || '127.0.0.1',
      userAgent,
    });
    await this.contactLogsRepository.save(log);

    const contactPhone = listing.contactPhone || listing.user?.phone;
    return {
      phone: contactPhone || 'Утас оруулаагүй',
      ownerName: listing.user?.name || 'Зар байршуулагч',
      revealsCount: listing.phoneRevealsCount,
    };
  }

  async getContactAuditLogs(id: string, currentUser: any) {
    const listing = await this.findOne(id);
    if (listing.userId !== currentUser.id) {
      throw new ForbiddenException('You can only view audit logs for your own listing');
    }

    return this.contactLogsRepository.find({
      where: { listingId: id },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async create(createListingDto: CreateListingDto, user: User) {
    await this.checkUserQuota(user);

    const contactPhone = (createListingDto.contactPhone || user.phone || '').trim();
    if (!contactPhone) {
      throw new BadRequestException('Утасны дугааргүй зар оруулах боломжгүй. Холбоо барих утасны дугаараа оруулна уу.');
    }

    // If user didn't have phone in profile, automatically save this phone
    if (!user.phone && contactPhone) {
      await this.usersRepository.update(user.id, { phone: contactPhone });
    }

    const now = new Date();
    const expiresAt = new Date(Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 30,  // 30 days from today in UTC
      now.getUTCHours(),
      now.getUTCMinutes(),
      now.getUTCSeconds()
    ));

    const listing = this.listingsRepository.create({
      ...createListingDto,
      contactPhone,
      user,
      expiresAt,
    });

    const savedListing = await this.listingsRepository.save(listing);
    this.savedSearchesService.checkAndNotifyMatchingSearches(savedListing);
    return savedListing;
  }


  async close(id: string, user: User) {
    const listing = await this.findOne(id);

    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only close your own listings');
    }

    listing.status = ListingStatus.CLOSED;
    return this.listingsRepository.save(listing);
  }

  async findMyListings(user: User) {
    return this.listingsRepository.find({ where: { userId: user.id }, order: { createdAt: 'DESC' } });
  }

  async update(id: string, updateDto: UpdateListingDto, user: User) {
    const listing = await this.findOne(id);
    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only edit your own listings');
    }
    Object.assign(listing, updateDto);
    return this.listingsRepository.save(listing);
  }

  async remove(id: string, user: User) {
    const listing = await this.findOne(id);
    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only delete your own listings');
    }
    await this.listingsRepository.remove(listing);
    return { deleted: true };
  }

  async renew(id: string, user: User) {
    const listing = await this.findOne(id);
    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only renew your own listings');
    }
    listing.status = ListingStatus.ACTIVE;
    listing.expiresAt = new Date();
    listing.expiresAt.setDate(listing.expiresAt.getDate() + 30);
    return this.listingsRepository.save(listing);
  }

  async publish(id: string, user: User) {
    const listing = await this.findOne(id);
    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only publish your own listings');
    }
    if (listing.status === ListingStatus.ACTIVE) {
      listing.status = ListingStatus.CLOSED;
    } else {
      await this.checkUserQuota(user);
      listing.status = ListingStatus.ACTIVE;
      listing.expiresAt = new Date();
      listing.expiresAt.setDate(listing.expiresAt.getDate() + 30);
    }
    return this.listingsRepository.save(listing);
  }

  async promote(id: string, user: User, tier: PromotionTier = PromotionTier.VIP, durationDays: number = 7) {
    const listing = await this.findOne(id);
    if (listing.userId !== user.id) {
      throw new ForbiddenException('You can only promote your own listings');
    }
    listing.isPromoted = tier !== PromotionTier.STANDARD;
    listing.promotionTier = tier;
    const promotedUntil = new Date();
    promotedUntil.setDate(promotedUntil.getDate() + durationDays);
    listing.promotedUntil = promotedUntil;
    return this.listingsRepository.save(listing);
  }
}

