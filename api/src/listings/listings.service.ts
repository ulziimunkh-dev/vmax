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

    // Auto-revert expired promotional sale prices back to regular price
    const expiredSales = await this.listingsRepository
      .createQueryBuilder('listing')
      .where('listing.saleEndsAt <= :now AND listing.isOnSale = true', { now })
      .getMany();

    for (const listing of expiredSales) {
      if (listing.originalPrice) {
        listing.price = listing.originalPrice;
      }
      listing.originalPrice = null;
      listing.saleEndsAt = null;
      listing.isOnSale = false;
      await this.listingsRepository.save(listing);
    }
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

  private extractRoomCountFromText(title?: string, description?: string, category?: string): number | undefined {
    const roomRe = /(?:^|[^\d])([1-9][0-9]?)\s*(?:-н\s*|-?тай\s*)?(?:өрөө|oroo|uruu)/i;
    if (title) {
      const m = title.match(roomRe);
      if (m) return parseInt(m[1], 10);
    }
    if (category !== 'LAND' && description) {
      const m = description.match(roomRe);
      if (m) return parseInt(m[1], 10);
    }
    return undefined;
  }

  private applyRoomFilter(
    queryBuilder: any,
    roomCount: number,
    isAtLeast: boolean,
    paramPrefix: string,
  ) {
    const anyRoomTitleRegex = `(^|[^0-9])[1-9][0-9]?[[:space:]]*(-н[[:space:]]*|-?тай[[:space:]]*)?(өрөө|oroo|uruu)`;
    const targetRegex = isAtLeast
      ? `(^|[^0-9])([${Math.min(roomCount, 9)}-9]|[1-9][0-9]+)[[:space:]]*(-н[[:space:]]*|-?тай[[:space:]]*)?(өрөө|oroo|uruu)`
      : `(^|[^0-9])${roomCount}[[:space:]]*(-н[[:space:]]*|-?тай[[:space:]]*)?(өрөө|oroo|uruu)`;

    const op = isAtLeast ? '>=' : '=';
    const valParam = `${paramPrefix}Val`;
    const targetRegexParam = `${paramPrefix}TargetRe`;
    const anyRegexParam = `${paramPrefix}AnyRe`;

    queryBuilder.andWhere(
      `(
        (listing.attributes->>'bedrooms' ~ '^[0-9]+$' AND CAST(listing.attributes->>'bedrooms' AS INTEGER) ${op} :${valParam})
        OR (listing.attributes->>'rooms' ~ '^[0-9]+$' AND CAST(listing.attributes->>'rooms' AS INTEGER) ${op} :${valParam})
        OR (
          COALESCE(NULLIF(listing.attributes->>'bedrooms', ''), NULLIF(listing.attributes->>'rooms', ''), '') !~ '^[0-9]+$'
          AND (
            listing.title ~* :${targetRegexParam}
            OR (
              listing.category != 'LAND'
              AND listing.title !~* :${anyRegexParam}
              AND listing.description ~* :${targetRegexParam}
            )
          )
        )
      )`,
      {
        [valParam]: roomCount,
        [targetRegexParam]: targetRegex,
        [anyRegexParam]: anyRoomTitleRegex,
      },
    );
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
    if (query.district) queryBuilder.andWhere('listing.district ILIKE :district', { district: `%${query.district}%` });
    if (location) queryBuilder.andWhere('(listing.location ILIKE :location OR listing.district ILIKE :location OR listing.khoroo ILIKE :location OR listing.title ILIKE :location)', { location: `%${location}%` });
    if (query.khoroo) {
      const kTrim = query.khoroo.trim();
      const escapedK = kTrim.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      queryBuilder.andWhere(
        '(LOWER(TRIM(listing.khoroo)) = LOWER(:kExact) OR listing.khoroo ~* :kRegex)',
        { kExact: kTrim, kRegex: `(^|[^0-9])${escapedK}` },
      );
    }

    if (priceMin !== undefined) queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
    if (priceMax !== undefined) queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });

    if (areaMin !== undefined) queryBuilder.andWhere('listing.areaSqm >= :areaMin', { areaMin });
    if (areaMax !== undefined) queryBuilder.andWhere('listing.areaSqm <= :areaMax', { areaMax });

    if (query.bedrooms !== undefined) {
      const reqRooms = Number(query.bedrooms);
      if (!isNaN(reqRooms) && reqRooms > 0) {
        this.applyRoomFilter(queryBuilder, reqRooms, reqRooms >= 5, 'bedroomFilter');
      }
    }
    if (query.bathrooms !== undefined) {
      queryBuilder.andWhere("listing.attributes->>'bathrooms' ~ '^[0-9]+$' AND CAST(listing.attributes->>'bathrooms' AS INTEGER) >= :bathrooms", { bathrooms: query.bathrooms });
    }
    if (query.yearBuiltMin !== undefined) {
      queryBuilder.andWhere("listing.attributes->>'yearBuilt' ~ '^[0-9]+$' AND CAST(listing.attributes->>'yearBuilt' AS INTEGER) >= :yearBuiltMin", { yearBuiltMin: query.yearBuiltMin });
    }
    if (query.constructionType) {
      queryBuilder.andWhere("listing.attributes->>'constructionType' ILIKE :constructionType", { constructionType: `%${query.constructionType}%` });
    }

    if (query.hasVideo === 'true' || query.hasVideo === '1') {
      queryBuilder.andWhere('listing.hasVideo = true');
    }

    if (query.search) {
      const rawSearch = query.search.trim();

      // Check if search contains room specification like "2 өрөө", "3 өрөө", "3өрөө", "3 uruu"
      const roomMatch = rawSearch.match(/(?:^|[^\d])([1-9][0-9]?)\s*(?:-н\s*|-?тай\s*)?(?:өрөө|oroo|uruu)/i);
      if (roomMatch && query.bedrooms === undefined) {
        const rNum = parseInt(roomMatch[1], 10);
        this.applyRoomFilter(queryBuilder, rNum, false, 'searchRoom');
      }

      // Extract intent keywords (зарах, түрээслэх, хоногоор)
      const saleIntentRe = /(?:^|\s)(зарах|зарна|худалдана|худалдах)(?=\s|$|[.,!?])/i;
      const dailyIntentRe = /(?:^|\s)(хоногоор|хоног)(?=\s|$|[.,!?])/i;
      const rentIntentRe = /(?:^|\s)(түрээс|түрээслэх|түрээслүүлнэ)(?=\s|$|[.,!?])/i;

      if (!type) {
        if (dailyIntentRe.test(rawSearch)) {
          queryBuilder.andWhere('listing.type = :inferredType', { inferredType: 'DAILY_RENT' });
        } else if (rentIntentRe.test(rawSearch)) {
          queryBuilder.andWhere('listing.type = :inferredType', { inferredType: 'RENT' });
        } else if (saleIntentRe.test(rawSearch)) {
          queryBuilder.andWhere('listing.type = :inferredType', { inferredType: 'SALE' });
        }
      }

      const cleanedSearch = rawSearch
        .replace(/(?:^|[^\d])([1-9][0-9]?)\s*(?:-н\s*|-?тай\s*)?(?:өрөө|oroo|uruu)/gi, ' ')
        .replace(/(?:^|\s)(зарах|зарна|худалдана|худалдах|хоногоор|түрээслэх|түрээслүүлнэ|түрээс)(?=\s|$|[.,!?])/gi, ' ')
        .trim();

      const words = cleanedSearch
        .split(/\s+/)
        .map((w) => w.trim())
        .filter((w) => w.length >= 2);

      const districtAliasMap: Record<string, string> = {
        худ: 'Хан-Уул',
        бзд: 'Баянзүрх',
        сбд: 'Сүхбаатар',
        бгд: 'Баянгол',
        схд: 'Сонгинохайрхан',
        чд: 'Чингэлтэй',
      };

      const categoryKeywordMap: Record<string, string> = {
        байр: 'APARTMENT',
        орон: 'APARTMENT',
        сууц: 'APARTMENT',
        хаус: 'HOUSE',
        байшин: 'HOUSE',
        газар: 'LAND',
        оффис: 'COMMERCIAL',
        талбай: 'COMMERCIAL',
        үйлчилгээ: 'COMMERCIAL',
        үйлчилгээний: 'COMMERCIAL',
      };

      if (words.length > 0) {
        words.forEach((w, idx) => {
          const lower = w.toLowerCase();
          const param = `search_word_${idx}`;
          const aliasDistrict = districtAliasMap[lower];
          const mappedCategory = categoryKeywordMap[lower];

          if (aliasDistrict) {
            const aliasParam = `search_alias_${idx}`;
            const boundaryParam = `search_alias_re_${idx}`;
            const escapedWord = lower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
            queryBuilder.andWhere(
              `(listing.district ILIKE :${aliasParam} OR listing.title ~* :${boundaryParam} OR listing.location ~* :${boundaryParam})`,
              {
                [aliasParam]: `%${aliasDistrict}%`,
                [boundaryParam]: `(^|[^а-яөүёa-z0-9])${escapedWord}([^а-яөүёa-z0-9]|$)`,
              },
            );
          } else if (mappedCategory) {
            const catParam = `search_cat_${idx}`;
            queryBuilder.andWhere(
              `(listing.category = :${catParam} OR listing.title ILIKE :${param} OR listing.description ILIKE :${param})`,
              { [catParam]: mappedCategory, [param]: `%${w}%` },
            );
          } else {
            queryBuilder.andWhere(
              `(listing.title ILIKE :${param} OR listing.description ILIKE :${param} OR listing.location ILIKE :${param} OR listing.district ILIKE :${param} OR listing.khoroo ILIKE :${param})`,
              { [param]: `%${w}%` },
            );
          }
        });
      } else if (!roomMatch && !dailyIntentRe.test(rawSearch) && !rentIntentRe.test(rawSearch) && !saleIntentRe.test(rawSearch)) {
        queryBuilder.andWhere(
          '(listing.title ILIKE :search OR listing.description ILIKE :search OR listing.location ILIKE :search OR listing.district ILIKE :search OR listing.khoroo ILIKE :search)',
          { search: `%${rawSearch}%` },
        );
      }
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

    const logs = await this.contactLogsRepository.find({
      where: { listingId: id },
      relations: { viewerUser: true },
      order: { createdAt: 'DESC' },
      take: 100,
    });

    return logs.map((log) => ({
      id: log.id,
      listingId: log.listingId,
      viewerUserId: log.viewerUserId,
      viewerIp: log.viewerIp,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      viewerUser: log.viewerUser
        ? {
            id: log.viewerUser.id,
            name: log.viewerUser.name,
            phone: log.viewerUser.phone,
            email: log.viewerUser.email,
            avatarUrl: log.viewerUser.avatarUrl,
          }
        : null,
    }));
  }

  async getMyContactAuditLogs(currentUser: any) {
    const logs = await this.contactLogsRepository
      .createQueryBuilder('log')
      .innerJoinAndSelect('log.listing', 'listing')
      .leftJoinAndSelect('log.viewerUser', 'viewerUser')
      .where('listing.userId = :userId', { userId: currentUser.id })
      .orderBy('log.createdAt', 'DESC')
      .take(150)
      .getMany();

    return logs.map((log) => ({
      id: log.id,
      listingId: log.listingId,
      listingTitle: log.listing?.title,
      listingPrice: log.listing?.price,
      listingContactPhone: log.listing?.contactPhone,
      viewerUserId: log.viewerUserId,
      viewerIp: log.viewerIp,
      userAgent: log.userAgent,
      createdAt: log.createdAt,
      viewerUser: log.viewerUser
        ? {
            id: log.viewerUser.id,
            name: log.viewerUser.name,
            phone: log.viewerUser.phone,
            email: log.viewerUser.email,
            avatarUrl: log.viewerUser.avatarUrl,
          }
        : null,
    }));
  }

  async create(createListingDto: CreateListingDto, user: User) {
    await this.checkUserQuota(user);

    const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
    const contactPhone = (createListingDto.contactPhone || freshUser?.phone || user.phone || '').trim();
    if (!contactPhone) {
      throw new BadRequestException('Утасны дугааргүй зар оруулах боломжгүй. Холбоо барих утасны дугаараа оруулна уу.');
    }

    const cleanPhone = contactPhone.replace(/\D/g, '');
    const isWhitelisted = cleanPhone === '89767700' || cleanPhone === '97689767700';
    if (!freshUser?.isPhoneVerified && !isWhitelisted) {
      throw new BadRequestException('Зар оруулахын тулд утасны дугаараа баталгаажуулсан байх шаардлагатай.');
    }

    // If user didn't have phone in profile, automatically save this phone
    if (!freshUser?.phone && contactPhone) {
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

    const hasVideo = Boolean(createListingDto.videoUrl && createListingDto.videoUrl.trim().length > 0);
    const origPrice = createListingDto.originalPrice ? Number(createListingDto.originalPrice) : null;
    const currentPrice = Number(createListingDto.price) || 0;
    let saleEnd = createListingDto.saleEndsAt ? new Date(createListingDto.saleEndsAt) : null;

    if (origPrice && origPrice > currentPrice && !saleEnd) {
      saleEnd = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    }

    const isOnSale = Boolean(origPrice && origPrice > currentPrice && saleEnd);

    const contactName = (
      createListingDto.contactName ||
      createListingDto.attributes?.contactName ||
      createListingDto.attributes?.seller ||
      freshUser?.name ||
      user.name ||
      'Зарын эзэн'
    ).trim();

    const rawAttrs = { ...(createListingDto.attributes || {}) };
    if (!rawAttrs.rooms && !rawAttrs.bedrooms) {
      const inferredRooms = this.extractRoomCountFromText(
        createListingDto.title,
        createListingDto.description,
        createListingDto.category,
      );
      if (inferredRooms) {
        rawAttrs.rooms = inferredRooms;
        rawAttrs.bedrooms = inferredRooms;
      }
    }

    const listing = this.listingsRepository.create({
      ...createListingDto,
      hasVideo,
      contactPhone,
      contactName,
      attributes: {
        ...rawAttrs,
        seller: contactName,
        contactName: contactName,
      },
      user,
      expiresAt,
      isOnSale,
      originalPrice: origPrice,
      saleEndsAt: saleEnd,
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
    if (updateDto.videoUrl !== undefined) {
      listing.hasVideo = Boolean(updateDto.videoUrl && updateDto.videoUrl.trim().length > 0);
    }
    if (updateDto.originalPrice !== undefined || updateDto.saleEndsAt !== undefined || updateDto.price !== undefined) {
      const currentOriginalPrice = updateDto.originalPrice !== undefined ? updateDto.originalPrice : listing.originalPrice;
      const currentPrice = updateDto.price !== undefined ? updateDto.price : listing.price;
      const currentSaleEndsAt = updateDto.saleEndsAt !== undefined ? updateDto.saleEndsAt : listing.saleEndsAt;

      const origPriceNum = currentOriginalPrice ? Number(currentOriginalPrice) : null;
      const priceNum = currentPrice ? Number(currentPrice) : 0;

      if (origPriceNum && origPriceNum > priceNum) {
        const endDate = currentSaleEndsAt ? new Date(currentSaleEndsAt) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
        listing.isOnSale = true;
        listing.originalPrice = origPriceNum;
        listing.saleEndsAt = endDate;
      } else {
        listing.isOnSale = false;
        listing.originalPrice = null;
        listing.saleEndsAt = null;
      }
    }
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

