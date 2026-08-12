import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { User } from '../users/user.entity';
import { ListingStatus } from './enums/listing.enums';

@Injectable()
export class ListingsService {
  constructor(
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
  ) {}

  async findAll(query: QueryListingDto) {
    const { type, category, location, priceMin, priceMax, areaMin, areaMax } = query;
    const page = query.page ?? 1;
    const limit = query.limit ?? 12;

    const queryBuilder = this.listingsRepository.createQueryBuilder('listing');

    queryBuilder.where('listing.status = :status', { status: ListingStatus.ACTIVE });

    if (type) queryBuilder.andWhere('listing.type = :type', { type });
    if (category) queryBuilder.andWhere('listing.category = :category', { category });
    if (location) queryBuilder.andWhere('listing.location ILIKE :location', { location: `%${location}%` });

    if (priceMin !== undefined) queryBuilder.andWhere('listing.price >= :priceMin', { priceMin });
    if (priceMax !== undefined) queryBuilder.andWhere('listing.price <= :priceMax', { priceMax });

    if (areaMin !== undefined) queryBuilder.andWhere('listing.areaSqm >= :areaMin', { areaMin });
    if (areaMax !== undefined) queryBuilder.andWhere('listing.areaSqm <= :areaMax', { areaMax });

    queryBuilder.orderBy('listing.createdAt', 'DESC');

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
    return listing;
  }

  async create(createListingDto: CreateListingDto, user: User) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now

    const listing = this.listingsRepository.create({
      ...createListingDto,
      user,
      expiresAt,
    });

    return this.listingsRepository.save(listing);
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
    listing.expiresAt.setDate(listing.expiresAt.getDate() + 7);
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
      listing.status = ListingStatus.ACTIVE;
      listing.expiresAt = new Date();
      listing.expiresAt.setDate(listing.expiresAt.getDate() + 7);
    }
    return this.listingsRepository.save(listing);
  }
}
