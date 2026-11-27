import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  OnModuleInit,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { EventVenue, EventPackageItem } from './event-venue.entity';
import { EventInquiry } from './event-inquiry.entity';
import { EventOrganization } from './event-organization.entity';
import { EventPhoneReveal } from './event-phone-reveal.entity';
import { EventMessage } from './event-message.entity';
import {
  CreateEventVenueDto,
  UpdateEventVenueDto,
  CreateEventPackageDto,
  CreateEventInquiryDto,
  BulkEventInquiryDto,
  UpdateEventInquiryDto,
  CreateEventOrganizationDto,
  UpdateEventOrganizationDto,
  QueryEventsDto,
} from './dto/events.dto';

@Injectable()
export class EventsService implements OnModuleInit {
  constructor(
    @InjectRepository(EventVenue)
    private venueRepository: Repository<EventVenue>,
    @InjectRepository(EventInquiry)
    private inquiryRepository: Repository<EventInquiry>,
    @InjectRepository(EventOrganization)
    private orgRepository: Repository<EventOrganization>,
    @InjectRepository(EventPhoneReveal)
    private phoneRevealRepository: Repository<EventPhoneReveal>,
    @InjectRepository(EventMessage)
    private messageRepository: Repository<EventMessage>,
  ) {}

  async onModuleInit() {
    try {
      const count = await this.venueRepository.count();
      if (count === 0) {
        await this.seedDemoVenues();
      }
    } catch (err) {
      console.warn('EventsService seed check skipped:', err?.message || err);
    }
  }

  async getMyOrganization(userId: string): Promise<EventOrganization | null> {
    if (!userId) return null;
    return this.orgRepository.findOne({ where: { userId } });
  }

  async createOrganization(
    dto: CreateEventOrganizationDto,
    userId: string,
  ): Promise<EventOrganization> {
    const existing = await this.orgRepository.findOne({ where: { userId } });
    if (existing) {
      throw new BadRequestException(
        'Нэг хэрэглэгчийн аккаунт дээр зөвхөн 1 байгууллагын профайл үүсгэх боломжтой (1/1).',
      );
    }
    const org = this.orgRepository.create({
      ...dto,
      userId,
      city: dto.city || 'Улаанбаатар',
      district: dto.district || 'Сүхбаатар',
    });
    return this.orgRepository.save(org);
  }

  async updateOrganization(
    id: string,
    dto: UpdateEventOrganizationDto,
    userId: string,
  ): Promise<EventOrganization> {
    const org = await this.orgRepository.findOne({ where: { id } });
    if (!org) {
      throw new NotFoundException(`Organization ${id} not found`);
    }
    if (org.userId !== userId) {
      throw new ForbiddenException('Зөвхөн байгууллагын эзэмшигч засах боломжтой');
    }
    Object.assign(org, dto);
    return this.orgRepository.save(org);
  }

  async create(createDto: CreateEventVenueDto, userId?: string): Promise<EventVenue> {
    let organizationId: string | undefined;
    if (userId) {
      const org = await this.orgRepository.findOne({ where: { userId } });
      if (!org) {
        throw new BadRequestException(
          'Эхлээд Байгууллагын Профайл (1/1) үүсгэсний дараа ресторан / эвент заал нэмнэ үү.',
        );
      }
      organizationId = org.id;
    }

    const packages: EventPackageItem[] = (createDto.packages || []).map((pkg: any) => ({
      id: pkg.id || uuidv4(),
      title: pkg.title,
      eventType: pkg.eventType || 'NEW_YEAR',
      pricePerPerson: pkg.pricePerPerson,
      minGuests: pkg.minGuests,
      maxGuests: pkg.maxGuests,
      description: pkg.description,
      includes: pkg.includes || [],
      imageUrl: pkg.imageUrl,
    }));

    const venue = this.venueRepository.create({
      ...createDto,
      userId,
      organizationId,
      venueType: createDto.venueType || 'EVENT_HALL',
      eventTypes: createDto.eventTypes?.length
        ? createDto.eventTypes
        : ['NEW_YEAR', 'WEDDING', 'BIRTHDAY', 'CORPORATE'],
      minCapacity: createDto.minCapacity ?? 20,
      maxCapacity: createDto.maxCapacity ?? 250,
      amenities: createDto.amenities || ['LED дэлгэц', 'Тайз & Хөгжим', 'Авто зогсоол'],
      images: createDto.images || (createDto.coverUrl ? [createDto.coverUrl] : []),
      packages,
    });

    return this.venueRepository.save(venue);
  }

  async findAll(query: QueryEventsDto) {
    const qb = this.venueRepository.createQueryBuilder('venue');

    if (query.search && query.search.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(venue.name ILIKE :search OR venue.tagline ILIKE :search OR venue.description ILIKE :search OR venue.district ILIKE :search OR venue.addressDetail ILIKE :search)',
        { search },
      );
    }

    if (query.venueType && query.venueType !== 'ALL') {
      qb.andWhere('venue.venueType = :venueType', { venueType: query.venueType });
    }

    if (query.eventType && query.eventType !== 'ALL') {
      qb.andWhere('venue.eventTypes LIKE :eventType', {
        eventType: `%${query.eventType}%`,
      });
    }

    if (query.district && query.district !== 'Бүгд' && query.district !== 'Бүх дүүрэг' && query.district !== 'All') {
      qb.andWhere('venue.district ILIKE :district', { district: `%${query.district}%` });
    }

    if (query.guests && Number(query.guests) > 0) {
      const guests = Number(query.guests);
      qb.andWhere('venue.maxCapacity >= :guests', { guests });
    }

    if (query.maxPricePerPerson && Number(query.maxPricePerPerson) > 0) {
      const maxPrice = Number(query.maxPricePerPerson);
      qb.andWhere('(venue.pricePerPerson IS NULL OR venue.pricePerPerson <= :maxPrice)', {
        maxPrice,
      });
    }

    qb.orderBy('venue.isFeatured', 'DESC');
    qb.addOrderBy('venue.rating', 'DESC');
    qb.addOrderBy('venue.createdAt', 'DESC');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    let allItems = await qb.getMany();

    if (query.availableDate && query.availableDate.trim()) {
      const targetDate = query.availableDate.trim().slice(0, 10);
      const confirmedOnDate = await this.inquiryRepository.find({
        where: { eventDate: targetDate, status: 'CONFIRMED' },
        select: { venueId: true },
      });
      const confirmedVenueIds = new Set(confirmedOnDate.map((i) => i.venueId));

      allItems = allItems.filter((v) => {
        const manuallyBooked = (v.bookedDates || []).some(
          (d) => d.slice(0, 10) === targetDate,
        );
        return !manuallyBooked && !confirmedVenueIds.has(v.id);
      });
    }

    const total = allItems.length;
    const items = allItems.slice(skip, skip + limit);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findByUser(userId: string): Promise<EventVenue[]> {
    if (!userId) return [];
    return this.venueRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<EventVenue> {
    const venue = await this.venueRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!venue) {
      throw new NotFoundException(`Event venue with ID ${id} not found`);
    }
    await this.venueRepository.increment({ id }, 'views', 1);
    venue.views = (venue.views || 0) + 1;
    return venue;
  }

  async revealPhoneContact(
    id: string,
    viewerUser?: any,
    reqIp?: string,
    userAgent?: string,
  ) {
    const venue = await this.venueRepository.findOne({ where: { id } });
    if (!venue) {
      throw new NotFoundException(`Event venue with ID ${id} not found`);
    }

    await this.venueRepository.increment({ id }, 'phoneRevealsCount', 1);
    const revealsCount = (venue.phoneRevealsCount || 0) + 1;

    const viewerUserId = viewerUser?.id || viewerUser?.sub || undefined;
    try {
      const log = this.phoneRevealRepository.create({
        venueId: id,
        viewerUserId,
        viewerIp: reqIp,
        userAgent,
      });
      await this.phoneRevealRepository.save(log);
    } catch (e) {
      console.warn('Failed to save event phone reveal log:', e);
    }

    return {
      phone: venue.phone,
      secondaryPhone: venue.secondaryPhone,
      revealsCount,
    };
  }

  async getMyPhoneRevealLogs(ownerUserId: string) {
    if (!ownerUserId) return [];
    const venues = await this.venueRepository.find({
      where: { userId: ownerUserId },
      select: { id: true },
    });
    if (!venues.length) return [];

    const venueIds = venues.map((v) => v.id);
    const logs = await this.phoneRevealRepository
      .createQueryBuilder('log')
      .leftJoinAndSelect('log.venue', 'venue')
      .leftJoinAndSelect('log.viewerUser', 'viewerUser')
      .where('log.venueId IN (:...venueIds)', { venueIds })
      .orderBy('log.createdAt', 'DESC')
      .take(100)
      .getMany();

    return logs.map((log) => ({
      id: log.id,
      venueId: log.venueId,
      venueName: log.venue?.name || 'Эвент газар',
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

  async getVenueMessages(
    venueId: string,
    userId: string,
    customerUserIdParam?: string,
  ): Promise<EventMessage[]> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException(`Event venue with ID ${venueId} not found`);
    }
    const isOwner = venue.userId === userId;
    const targetCustomerId = isOwner && customerUserIdParam ? customerUserIdParam : userId;

    return this.messageRepository.find({
      where: { venueId, customerUserId: targetCustomerId },
      order: { createdAt: 'ASC' },
    });
  }

  async sendVenueMessage(
    venueId: string,
    user: any,
    content: string,
    customerUserIdParam?: string,
  ): Promise<EventMessage> {
    const venue = await this.venueRepository.findOne({ where: { id: venueId } });
    if (!venue) {
      throw new NotFoundException(`Event venue with ID ${venueId} not found`);
    }
    const userId = user?.id || user?.sub;
    const isOwner = venue.userId === userId;
    const senderRole: 'CUSTOMER' | 'OWNER' =
      isOwner && customerUserIdParam && customerUserIdParam !== userId
        ? 'OWNER'
        : 'CUSTOMER';
    const customerUserId =
      senderRole === 'OWNER' && customerUserIdParam ? customerUserIdParam : userId;

    const msg = this.messageRepository.create({
      venueId,
      customerUserId,
      senderRole,
      senderName:
        senderRole === 'OWNER'
          ? venue.name
          : user?.name || user?.email || 'Хэрэглэгч',
      content: content.trim(),
    });
    return this.messageRepository.save(msg);
  }

  async getOwnerChatThreads(ownerUserId: string) {
    if (!ownerUserId) return [];
    const venues = await this.venueRepository.find({
      where: { userId: ownerUserId },
      select: { id: true, name: true },
    });
    if (!venues.length) return [];

    const venueIds = venues.map((v) => v.id);
    const messages = await this.messageRepository
      .createQueryBuilder('msg')
      .leftJoinAndSelect('msg.venue', 'venue')
      .leftJoinAndSelect('msg.customerUser', 'customerUser')
      .where('msg.venueId IN (:...venueIds)', { venueIds })
      .orderBy('msg.createdAt', 'ASC')
      .getMany();

    const threadMap = new Map<string, any>();
    for (const m of messages) {
      const key = `${m.venueId}__${m.customerUserId}`;
      if (!threadMap.has(key)) {
        threadMap.set(key, {
          key,
          venueId: m.venueId,
          venueName: m.venue?.name || 'Эвент газар',
          customerUserId: m.customerUserId,
          customerName: m.customerUser?.name || m.senderName || 'Хэрэглэгч',
          customerPhone: m.customerUser?.phone,
          messages: [],
        });
      }
      threadMap.get(key).messages.push(m);
    }

    return Array.from(threadMap.values()).sort((a, b) => {
      const aLast = a.messages[a.messages.length - 1]?.createdAt || '';
      const bLast = b.messages[b.messages.length - 1]?.createdAt || '';
      return String(bLast).localeCompare(String(aLast));
    });
  }

  async update(id: string, updateDto: UpdateEventVenueDto, userId: string): Promise<EventVenue> {
    const venue = await this.findOne(id);
    if (venue.userId && venue.userId !== userId) {
      throw new ForbiddenException('Та зөвхөн өөрийн бүртгэсэн заал/рестораныг засах боломжтой');
    }

    Object.assign(venue, updateDto);
    return this.venueRepository.save(venue);
  }

  async delete(id: string, userId: string): Promise<void> {
    const venue = await this.findOne(id);
    if (venue.userId && venue.userId !== userId) {
      throw new ForbiddenException('Та зөвхөн өөрийн бүртгэсэн заал/рестораныг устгах боломжтой');
    }
    await this.venueRepository.remove(venue);
  }

  async addPackage(
    id: string,
    pkgDto: CreateEventPackageDto,
    userId: string,
  ): Promise<EventVenue> {
    const venue = await this.findOne(id);
    if (venue.userId && venue.userId !== userId) {
      throw new ForbiddenException('Зөвхөн эзэмшигч багц нэмэх боломжтой');
    }

    const newPackage: EventPackageItem = {
      id: uuidv4(),
      title: pkgDto.title,
      eventType: pkgDto.eventType,
      pricePerPerson: pkgDto.pricePerPerson,
      minGuests: pkgDto.minGuests,
      maxGuests: pkgDto.maxGuests,
      description: pkgDto.description,
      includes: pkgDto.includes || [],
      imageUrl: pkgDto.imageUrl,
    };

    venue.packages = [...(venue.packages || []), newPackage];
    return this.venueRepository.save(venue);
  }

  async removePackage(id: string, packageId: string, userId: string): Promise<EventVenue> {
    const venue = await this.findOne(id);
    if (venue.userId && venue.userId !== userId) {
      throw new ForbiddenException('Зөвхөн эзэмшигч багц устгах боломжтой');
    }

    venue.packages = (venue.packages || []).filter((p) => p.id !== packageId);
    return this.venueRepository.save(venue);
  }

  async createInquiry(
    venueId: string,
    dto: CreateEventInquiryDto,
    userId?: string,
  ): Promise<EventInquiry> {
    await this.findOne(venueId); // Ensure venue exists

    const inquiry = this.inquiryRepository.create({
      venueId,
      userId,
      contactName: dto.contactName,
      contactPhone: dto.contactPhone,
      eventType: dto.eventType,
      eventDate: dto.eventDate,
      guestCount: dto.guestCount,
      message: dto.message,
      packageName: dto.packageName,
      status: 'PENDING',
    });

    return this.inquiryRepository.save(inquiry);
  }

  async createBulkInquiries(
    dto: BulkEventInquiryDto,
    userId?: string,
  ): Promise<{ count: number; inquiries: EventInquiry[] }> {
    const uniqueIds = Array.from(new Set(dto.venueIds || [])).slice(0, 5);
    const created: EventInquiry[] = [];

    for (const venueId of uniqueIds) {
      const venue = await this.venueRepository.findOne({ where: { id: venueId } });
      if (!venue) continue;
      const inquiry = this.inquiryRepository.create({
        venueId,
        userId,
        contactName: dto.contactName,
        contactPhone: dto.contactPhone,
        eventType: dto.eventType,
        eventDate: dto.eventDate,
        guestCount: dto.guestCount,
        message: dto.message,
        packageName: dto.packageName,
        status: 'PENDING',
      });
      created.push(await this.inquiryRepository.save(inquiry));
    }

    return { count: created.length, inquiries: created };
  }

  async getInquiriesForOwner(userId: string): Promise<EventInquiry[]> {
    if (!userId) return [];
    const venues = await this.venueRepository.find({
      where: { userId },
      select: { id: true },
    });
    if (!venues.length) return [];

    const venueIds = venues.map((v) => v.id);
    return this.inquiryRepository
      .createQueryBuilder('inquiry')
      .leftJoinAndSelect('inquiry.venue', 'venue')
      .where('inquiry.venueId IN (:...venueIds)', { venueIds })
      .orderBy('inquiry.createdAt', 'DESC')
      .getMany();
  }

  async updateInquiryStatus(
    inquiryId: string,
    dto: UpdateEventInquiryDto,
    userId: string,
  ): Promise<EventInquiry> {
    const inquiry = await this.inquiryRepository.findOne({
      where: { id: inquiryId },
      relations: { venue: true },
    });
    if (!inquiry) {
      throw new NotFoundException(`Inquiry ${inquiryId} not found`);
    }
    if (inquiry.venue?.userId && inquiry.venue.userId !== userId) {
      throw new ForbiddenException('Зөвхөн байгууллагын эзэмшигч захиалгыг шинэчлэх эрхтэй');
    }
    if (dto.status) inquiry.status = dto.status;
    if (dto.quotedPrice !== undefined) inquiry.quotedPrice = dto.quotedPrice;
    if (dto.quoteMessage !== undefined) inquiry.quoteMessage = dto.quoteMessage;
    if (dto.quotedPrice !== undefined || dto.quoteMessage !== undefined || dto.status) {
      inquiry.respondedAt = new Date();
    }
    const saved = await this.inquiryRepository.save(inquiry);

    // Sync confirmed booking date into venue.bookedDates
    if (dto.status === 'CONFIRMED' && inquiry.venue && inquiry.eventDate) {
      const dateKey = inquiry.eventDate.slice(0, 10);
      const existingDates = inquiry.venue.bookedDates || [];
      if (!existingDates.includes(dateKey)) {
        inquiry.venue.bookedDates = [...existingDates, dateKey];
        await this.venueRepository.save(inquiry.venue);
      }
    }

    return saved;
  }

  async getInquiriesForVenue(venueId: string, userId: string): Promise<EventInquiry[]> {
    const venue = await this.findOne(venueId);
    if (venue.userId && venue.userId !== userId) {
      throw new ForbiddenException('Зөвхөн тухайн газрын эзэмшигч захиалгын хүсэлтүүдийг харах боломжтой');
    }

    return this.inquiryRepository.find({
      where: { venueId },
      order: { createdAt: 'DESC' },
    });
  }

  private async seedDemoVenues() {
    const demoVenues: Partial<EventVenue>[] = [
      {
        name: 'Aurora Grand Ballroom',
        tagline: 'Шинэ жил, Хурим, Томоохон хүлээн авалтын 5 одтой их танхим',
        description:
          'Улаанбаатар хотын төвд байрлах, 8 метр өндөр таазтай, баганагүй цэлгэр их танхим. Хамгийн сүүлийн үеийн 4K LED хана, концерт түвшний дуу чимээний систем болон мастер тогоочийн тусгай цэстэй.',
        venueType: 'HOTEL_BALLROOM',
        eventTypes: ['NEW_YEAR', 'WEDDING', 'CORPORATE', 'CONFERENCE', 'GRADUATION'],
        coverUrl:
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
        logoUrl:
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
        ],
        minCapacity: 100,
        maxCapacity: 500,
        pricePerPerson: 185000,
        rentalPrice: 4500000,
        amenities: [
          '4K LED дэлгэц',
          'Мэргэжлийн тайз & Гэрэлтүүлэг',
          'VIP угталтын лоунж',
          '150 машины зогсоол',
          'Хувцас солих өрөө',
          'Тусгай цэс',
        ],
        city: 'Улаанбаатар',
        district: 'Сүхбаатар',
        addressDetail: 'Сүхбаатарын талбайн зүүн талд, Aurora Tower 3 давхар',
        phone: '9911-8800',
        secondaryPhone: '7711-8800',
        facebookUrl: 'https://facebook.com',
        instagramUrl: 'https://instagram.com',
        rating: 4.95,
        reviewsCount: 64,
        isVerified: true,
        isFeatured: true,
        packages: [
          {
            id: uuidv4(),
            title: 'Шинэ жилийн Алтан багц 2026',
            eventType: 'NEW_YEAR',
            pricePerPerson: 195000,
            minGuests: 120,
            maxGuests: 500,
            description: 'Байгууллагын шинэ жилийн баярт зориулсан иж бүрэн багц.',
            includes: [
              'Угталтын оргилуун дарс & Канапе',
              '4 төрлийн тансаг оройн зоог',
              'LED дэлгэц, тайз, гэрэлтүүлэг үнэгүй',
              'Өвлийн өвгөн & Цасан охины мэндчилгээ',
            ],
          },
          {
            id: uuidv4(),
            title: 'Хуримын Мөрөөдлийн багц',
            eventType: 'WEDDING',
            pricePerPerson: 210000,
            minGuests: 150,
            maxGuests: 450,
            description: 'Хосуудын амьдралын хамгийн дурсамжтай өдөрт зориулсан онцгой үйлчилгээ.',
            includes: [
              'Хуримын арк болон ширээний амьд цэцгийн чимэглэл',
              'Сүйт бүсгүйн амрах VIP өрөө',
              '4 давхар хуримын бялуу',
              'Фото зураг авах тусгай булан',
            ],
          },
        ],
      },
      {
        name: 'Veranda Sky Restaurant & Lounge',
        tagline: 'Хотын үзэмжтэй төрсөн өдөр, ойн баяр болон цомхон хүлээн авалт',
        description:
          'Хан-Уул дүүрэгт байрлах панорама шилэн цонхтой, Европ болон Ази фьюжн гал тогоотой ресторан. Төрсөн өдөр, сүй тавих ёслол, найз нөхдийн үдэшлэг болон VIP уулзалт хийхэд төгс орчин.',
        venueType: 'RESTAURANT',
        eventTypes: ['BIRTHDAY', 'HAIR_CEREMONY', 'NEW_YEAR', 'CORPORATE', 'GRADUATION', 'OTHER'],
        coverUrl:
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
        logoUrl:
          'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&w=1400&q=80',
        ],
        minCapacity: 15,
        maxCapacity: 110,
        pricePerPerson: 115000,
        amenities: [
          'VIP тусдаа өрөө (15-30 хүн)',
          'Панорама хотын үзэмж',
          'DJ болон амьд хөгжим',
          'Коктейль бар',
          'Авто зогсоол',
        ],
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        addressDetail: 'Зайсан, Marshall Town-ийн хойд талд Sky Plaza 12 давхар',
        phone: '8800-4455',
        secondaryPhone: '7505-4455',
        instagramUrl: 'https://instagram.com',
        rating: 4.88,
        reviewsCount: 41,
        isVerified: true,
        isFeatured: true,
        packages: [
          {
            id: uuidv4(),
            title: 'Төрсөн өдрийн VIP багц',
            eventType: 'BIRTHDAY',
            pricePerPerson: 120000,
            minGuests: 15,
            maxGuests: 40,
            description: 'Тусдаа VIP танхим, бөмбөлгөн чимэглэл болон тусгай цэстэй.',
            includes: [
              'VIP өрөөний түрээс үнэгүй',
              'Төрсөн өдрийн бэлэгний бялуу',
              '3 төрлийн сет хоол + уух зүйлс',
              'Караоке & Дуу хөгжмийн систем',
            ],
          },
        ],
      },
      {
        name: 'Royal Palace Event Hall',
        tagline: 'Хурим найр, одонгийн найр, шинэ жилийн хүндэтгэлийн ордон',
        description:
          'Сонгодог интерьер дизайнтай, болор гэрлийн бүрхүүл, өргөн бүжгийн талбай бүхий эвент заал. Заалны түрээс уян хатан, өөрийн хүссэн чимэглэл болон хөтөлбөрийг хэрэгжүүлэх боломжтой.',
        venueType: 'EVENT_HALL',
        eventTypes: ['WEDDING', 'NEW_YEAR', 'ANNIVERSARY', 'GRADUATION', 'CORPORATE'],
        coverUrl:
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
        logoUrl:
          'https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1478146896981-b80fe463b330?auto=format&fit=crop&w=1400&q=80',
        ],
        minCapacity: 60,
        maxCapacity: 320,
        pricePerPerson: 135000,
        rentalPrice: 2800000,
        amenities: [
          'Бүжгийн гэрэлтдэг талбай',
          'LED дэлгэц',
          'Амрах өрөө',
          'Монгол & Европ хоол',
          'Зогсоол сайтай',
        ],
        city: 'Улаанбаатар',
        district: 'Баянзүрх',
        addressDetail: '13-р хороолол, Натур худалдааны төвийн зүүн талд',
        phone: '9909-3322',
        facebookUrl: 'https://facebook.com',
        rating: 4.82,
        reviewsCount: 33,
        isVerified: true,
        isFeatured: false,
        packages: [
          {
            id: uuidv4(),
            title: 'Шинэ жил & Төгсөлтийн Хит багц',
            eventType: 'NEW_YEAR',
            pricePerPerson: 135000,
            minGuests: 80,
            maxGuests: 320,
            description: 'Боломжийн үнээр хамгийн чанартай үйлчилгээ авах багц.',
            includes: [
              '3 төрлийн хоол + зууш',
              'Хөгжим техник & Микрофон',
              'Угталтын улаан хивс',
            ],
          },
        ],
      },
      {
        name: 'Nomad Lounge & Rooftop',
        tagline: 'Залуусын үдэшлэг, төрсөн өдөр, after-party лоунж',
        description:
          'Баянгол дүүргийн төвд байрлах орчин үеийн неон гэрэлтүүлэгтэй лоунж. Төрсөн өдөр, бэчелор үдэшлэг, хамт олны цомхон шинэ жил болон амьд хөгжмийн эвентүүдэд тохиромжтой.',
        venueType: 'LOUNGE_BAR',
        eventTypes: ['BIRTHDAY', 'NEW_YEAR', 'GRADUATION', 'CORPORATE'],
        coverUrl:
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
        logoUrl:
          'https://images.unsplash.com/photo-1572116469696-31de0f17cc34?auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1566417713940-fe7c737a9ef2?auto=format&fit=crop&w=1400&q=80',
        ],
        minCapacity: 15,
        maxCapacity: 90,
        pricePerPerson: 95000,
        amenities: ['DJ Booth', 'Караоке VIP өрөө', 'Тусгай коктейль', 'Шөнийн гэрэлтүүлэг'],
        city: 'Улаанбаатар',
        district: 'Баянгол',
        addressDetail: '3, 4-р хороолол, Өргөө кино театрын урд',
        phone: '8611-7788',
        instagramUrl: 'https://instagram.com',
        rating: 4.76,
        reviewsCount: 27,
        isVerified: true,
        isFeatured: false,
        packages: [
          {
            id: uuidv4(),
            title: 'Party & Birthday Сет',
            eventType: 'BIRTHDAY',
            pricePerPerson: 95000,
            minGuests: 15,
            maxGuests: 60,
            description: 'Шарсан мах, фингер фүүд болон коктейлийн сет.',
            includes: [
              'Finger food & Гриль сет',
              'DJ 2 цаг үнэгүй',
              'Төрсөн өдрийн чимэглэл',
            ],
          },
        ],
      },
      {
        name: 'Bogd Khan Resort & Garden Hall',
        tagline: 'Зуны хурим, гадаа цэцэрлэгт хүрээлэн & амралтын цогцолбор',
        description:
          'Богд уулын бэлд цэвэр агаарт байрлах гадаа цэцэрлэгт хүрээлэн болон шилэн эвент танхим. Зуны хурим, гэр бүлийн ойн баяр болон байгууллагын тим билдинг хийхэд нэн тохиромжтой.',
        venueType: 'OUTDOOR_RESORT',
        eventTypes: ['WEDDING', 'ANNIVERSARY', 'CORPORATE', 'BIRTHDAY', 'NEW_YEAR'],
        coverUrl:
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
        logoUrl:
          'https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=400&q=80',
        images: [
          'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1400&q=80',
          'https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1400&q=80',
        ],
        minCapacity: 30,
        maxCapacity: 220,
        pricePerPerson: 145000,
        rentalPrice: 3200000,
        amenities: [
          'Гадаа цэцэрлэгт талбай',
          'Шилэн эвент заал',
          'Зочид буудлын өрөө',
          'BBQ & Хорхог',
          'Хүүхдийн тоглоомын талбай',
        ],
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        addressDetail: 'Зайсан, Богд уулын дархан цаазат бүсийн баруун ам',
        phone: '9919-5566',
        facebookUrl: 'https://facebook.com',
        rating: 4.91,
        reviewsCount: 38,
        isVerified: true,
        isFeatured: true,
        packages: [
          {
            id: uuidv4(),
            title: 'Цэцэрлэгт Хуримын Багц',
            eventType: 'WEDDING',
            pricePerPerson: 155000,
            minGuests: 50,
            maxGuests: 220,
            description: 'Байгалийн үзэсгэлэнт орчинд хуримаа хийх онцгой багц.',
            includes: [
              'Гадаа талбайн хуримын ёслолын засал',
              'Шилэн танхим дахь оройн хүлээн авалт',
              'Хосуудын люкс өрөө 1 хоног үнэгүй',
            ],
          },
        ],
      },
    ];

    for (const data of demoVenues) {
      const entity = this.venueRepository.create(data);
      await this.venueRepository.save(entity);
    }

    console.log(`✅ Seeded ${demoVenues.length} demo event venues & restaurants!`);
  }
}
