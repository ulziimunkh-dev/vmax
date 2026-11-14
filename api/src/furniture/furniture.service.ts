import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FurnitureMaker, FurniturePortfolioItem, FurnitureArticleItem } from './furniture.entity';
import { CreateFurnitureMakerDto, UpdateFurnitureMakerDto, CreatePortfolioItemDto, QueryFurnitureDto } from './dto/furniture.dto';
import { v4 as uuidv4 } from 'uuid';

export const MAX_FURNITURE_MAKERS_PER_USER = 1;

@Injectable()
export class FurnitureService {
  constructor(
    @InjectRepository(FurnitureMaker)
    private furnitureRepository: Repository<FurnitureMaker>,
  ) {}

  async create(createDto: CreateFurnitureMakerDto, userId?: string): Promise<FurnitureMaker> {
    if (userId) {
      const existing = await this.furnitureRepository.findOne({ where: { userId } });
      if (existing) {
        throw new BadRequestException(
          'Нэг хэрэглэгчийн аккаунт дээр зөвхөн 1 урлангийн профайл бүртгэх боломжтой. Та одоо байгаа урлангаа засна уу.',
        );
      }
    }

    const maker = this.furnitureRepository.create({
      ...createDto,
      userId,
      categories: createDto.categories || ['KITCHEN', 'WARDROBE', 'CUSTOM'],
      materialsUsed: createDto.materialsUsed || ['E0 Хавтан', 'Blum тоноглол'],
      portfolio: createDto.portfolio || [],
      articles: createDto.articles || [],
    });
    return this.furnitureRepository.save(maker);
  }

  async findByUser(userId: string): Promise<FurnitureMaker | null> {
    if (!userId) return null;
    return this.furnitureRepository.findOne({
      where: { userId },
      relations: { user: true },
    });
  }

  async findAll(query: QueryFurnitureDto) {
    const qb = this.furnitureRepository.createQueryBuilder('maker');

    if (query.search && query.search.trim()) {
      const search = `%${query.search.trim()}%`;
      qb.andWhere(
        '(maker.name ILIKE :search OR maker.tagline ILIKE :search OR maker.description ILIKE :search OR maker.district ILIKE :search OR maker.addressDetail ILIKE :search)',
        { search },
      );
    }

    if (query.district && query.district !== 'Бүгд' && query.district !== 'All') {
      qb.andWhere('maker.district ILIKE :district', { district: `%${query.district}%` });
    }

    if (query.category && query.category !== 'ALL' && query.category !== 'Бүгд') {
      qb.andWhere('maker.categories LIKE :category', { category: `%${query.category}%` });
    }

    qb.orderBy('maker.isFeatured', 'DESC');
    qb.addOrderBy('maker.rating', 'DESC');
    qb.addOrderBy('maker.createdAt', 'DESC');

    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 20;
    const skip = (page - 1) * limit;

    let items = await qb.getMany();

    // Filter by hasVideo if requested
    if (String(query.hasVideo) === 'true') {
      items = items.filter((m) => m.portfolio?.some((p) => Boolean(p.videoUrl && p.videoUrl.trim().length > 0)));
    }

    const total = items.length;
    const paginatedItems = items.slice(skip, skip + limit);

    return {
      items: paginatedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<FurnitureMaker> {
    const maker = await this.furnitureRepository.findOne({
      where: { id },
      relations: { user: true },
    });
    if (!maker) {
      throw new NotFoundException(`Furniture maker with ID ${id} not found`);
    }
    return maker;
  }

  async update(id: string, updateDto: UpdateFurnitureMakerDto, userId?: string): Promise<FurnitureMaker> {
    const maker = await this.findOne(id);
    if (maker.userId && userId && maker.userId !== userId) {
      throw new ForbiddenException('Та энэ урлангийн эзэмшигч биш байна.');
    }
    if (!maker.userId && userId) {
      maker.userId = userId;
    }
    Object.assign(maker, updateDto);
    return this.furnitureRepository.save(maker);
  }

  async addPortfolioItem(id: string, itemDto: CreatePortfolioItemDto, userId?: string): Promise<FurnitureMaker> {
    const maker = await this.findOne(id);
    if (maker.userId && userId && maker.userId !== userId) {
      throw new ForbiddenException('Та энэ урлангийн эзэмшигч биш тул ажил нэмэх эрхгүй байна.');
    }
    if (!maker.userId && userId) {
      maker.userId = userId;
    }
    const newItem: FurniturePortfolioItem = {
      id: uuidv4(),
      title: itemDto.title,
      category: itemDto.category || 'CUSTOM',
      description: itemDto.description || '',
      images: itemDto.images || [],
      videoUrl: itemDto.videoUrl,
      thumbnailUrl: itemDto.thumbnailUrl || (itemDto.images && itemDto.images[0]) || '',
      materials: itemDto.materials,
      durationDays: itemDto.durationDays || 14,
      location: itemDto.location || maker.district,
      year: itemDto.year || '2026',
      createdAt: new Date().toISOString(),
    };

    maker.portfolio = [newItem, ...(maker.portfolio || [])];
    return this.furnitureRepository.save(maker);
  }

  async removePortfolioItem(makerId: string, portfolioId: string, userId?: string): Promise<FurnitureMaker> {
    const maker = await this.findOne(makerId);
    if (maker.userId && userId && maker.userId !== userId) {
      throw new ForbiddenException('Та энэ урлангийн эзэмшигч биш байна.');
    }
    maker.portfolio = (maker.portfolio || []).filter((p) => p.id !== portfolioId);
    return this.furnitureRepository.save(maker);
  }

  async delete(id: string, userId?: string): Promise<void> {
    const maker = await this.findOne(id);
    if (maker.userId && userId && maker.userId !== userId) {
      throw new ForbiddenException('Та энэ урлангийн эзэмшигч биш байна.');
    }
    await this.furnitureRepository.remove(maker);
  }

  /**
   * Returns all expert advice and articles across all makers
   */
  async getAllTips(): Promise<any[]> {
    const makers = await this.furnitureRepository.find();
    const allTips: any[] = [];
    makers.forEach((m) => {
      (m.articles || []).forEach((a) => {
        allTips.push({
          ...a,
          makerId: m.id,
          makerName: m.name,
          makerLogo: m.logoUrl,
          makerPhone: m.phone,
        });
      });
    });
    return allTips;
  }

  /**
   * Seed realistic, high-quality furniture makers & workshops if table is empty
   */
  async seedDemoFurnitureIfEmpty() {
    const count = await this.furnitureRepository.count();
    if (count > 0) return;

    const demoMakers: Partial<FurnitureMaker>[] = [
      {
        name: 'Мөнх Мод Урлан (Munkh Mod Studio)',
        tagline: 'Гал тогоо, хувцасны өрөөний орчин үеийн захиалгат интерьер хийц',
        description: 'Манай урлан нь 2017 оноос хойш Монголын зах зээлд өндөр чанарын Герман Egger хавтан, Австрийн Blum тоноглолоор чанартай захиалгат тавилга үйлдвэрлэж байна. Хэмжээ авалтаас угсралт хүртэл бүх шатанд 3D зураглалтайгаар гүйцэтгэнэ.',
        logoUrl: 'https://images.unsplash.com/photo-1540518614846-7ede433c4ef4?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80',
        categories: ['KITCHEN', 'WARDROBE', 'LIVING_ROOM', 'CUSTOM'],
        experienceYears: 8,
        warrantyMonths: 36,
        city: 'Улаанбаатар',
        district: 'Хан-Уул',
        addressDetail: 'Мишээл Экспо тавилгын их дэлгүүр, 2-р давхар В-08 павильон',
        phone: '8911-7722',
        secondaryPhone: '9901-8833',
        facebookUrl: 'https://facebook.com/munkhmodfurniture',
        instagramUrl: 'https://instagram.com/munkhmod_interior',
        materialsUsed: ['Герман Egger E0 хавтан', 'Австрийн Blum нугас тоноглол', 'Солонгос Акрил тавцан', 'LED мэдрэгчтэй гэрэлтүүлэг'],
        rating: 4.95,
        reviewsCount: 42,
        isVerified: true,
        isFeatured: true,
        portfolio: [
          {
            id: uuidv4(),
            title: 'Ривер Гарден хотхоны Minimalist гал тогооны иж бүрдэл',
            category: 'KITCHEN',
            description: 'Egger матт хар болон байгалийн царс модны хослол бүхий бариулгүй Push-to-open шийдэлтэй гал тогоо. Blum Aventos нугас болон далд сорогчтой.',
            images: [
              'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1556909212-d5b604d0c90d?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1507089947368-19c1da9775ae?auto=format&fit=crop&w=1000&q=80',
            ],
            videoUrl: 'https://vmax-app-images.s3.ap-southeast-1.amazonaws.com/development/listings/50b98635-5f12-4b7b-af5b-6ced1dc402f6/233acae1-855f-458e-ab46-fb607725bf5f.mp4',
            thumbnailUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
            materials: 'Egger E0 хавтан, Blum тоноглол, Кварц чулуу',
            durationDays: 14,
            location: 'Хан-Уул, Ривер Гарден',
            year: '2026',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            title: 'Гранд Мед хотхоны Мастер хувцасны өрөөний шүүгээ',
            category: 'WARDROBE',
            description: 'Бор шаргал шилэн хаалга, хайлшин хүрээ болон LED гэрэлтүүлэгтэй тансаг зэрэглэлийн Walk-in closet шүүгээний систем.',
            images: [
              'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1000&q=80',
            ],
            materials: 'Хайлшин профиль, Утаат шилэн хаалга, Саарал хавтан',
            durationDays: 10,
            location: 'Хан-Уул, Гранд Мед орчим',
            year: '2026',
            createdAt: new Date().toISOString(),
          },
        ],
        articles: [
          {
            id: uuidv4(),
            title: 'Гал тогооны тавилга захиалахад гаргадаг нийтлэг 5 алдаа',
            summary: 'Тавилгаа захиалахаас өмнө розетканы байрлал, сантехник болон ажлын гурвалжны дүрмийг хэрхэн зөв төлөвлөх тухай.',
            content: `Гал тогоо нь аливаа айлын хамгийн их ашиглагддаг бүс юм. Ихэнх хэрэглэгчид дизайн гоё харагдах тал дээр анхаараад дараах 5 алдааг гаргадаг:
1. Ажлын гурвалжин буруу төлөвлөх (Хөргөгч - Угаалтуур - Плитка хоорондын зай 1.2-2.7м байх ёстой).
2. Засвар эхлэхээс өмнө розетка, унтраалга төлөвлөөгүйгээс дараа нь уртасгагч татах хэрэг гардаг.
3. Хямд нугас, чиглүүлэгч сонгох (Blum, Hettich зэрэг зөөлөн хаагчтай тоноглол нь тавилгын насыг 3-5 дахин уртасгадаг).
4. Агааржуулагч (Сорогч)-ийн хоолойн өргөн болон дуу чимээг тооцоолохгүй байх.
5. Хавтангийн E0 ба E1 стандартыг анхаарахгүй байх.`,
            category: 'ЗӨВЛӨГӨӨ',
            imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
            readMinutes: 3,
            publishedAt: '2026.10.25',
          },
        ],
      },
      {
        name: 'Smart Wood Interior Studio',
        tagline: 'Цэвэр модон тансаг хийц, орчин үеийн лофт & скандинави шийдэл',
        description: 'Цэвэр царс, хус болон байгалийн модоор ширээ сандал, ханын чимэглэл, зурагтын тавиур болон интерьерийн модон хийцүүдийг 100% гараар урлан хийнэ.',
        logoUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1400&q=80',
        categories: ['SOLID_WOOD', 'LIVING_ROOM', 'CUSTOM', 'OFFICE'],
        experienceYears: 10,
        warrantyMonths: 60,
        city: 'Улаанбаатар',
        district: 'Сүхбаатар',
        addressDetail: '1-р хороо, Чингисийн өргөн чөлөө, Гурван гал худалдааны төвийн хойно',
        phone: '9911-3388',
        secondaryPhone: '8800-4499',
        facebookUrl: 'https://facebook.com/smartwoodmongolia',
        instagramUrl: 'https://instagram.com/smartwood_mn',
        materialsUsed: ['Орос цэвэр царс мод', 'Байгалийн хуш мод', 'Герман Rubio Monocoat эко тосон будаг', 'Хөнгөн цагаан хайлш'],
        rating: 4.98,
        reviewsCount: 56,
        isVerified: true,
        isFeatured: true,
        portfolio: [
          {
            id: uuidv4(),
            title: 'Америк Сургуулийн захирлын оффисын цэвэр модон ширээ',
            category: 'OFFICE',
            description: 'Байгалийн амьд ирмэг бүхий цэвэр царс модон 2.8 метрийн лофт оффис ажлын ширээ. Металл хөл болон кабель далдлагч системтэй.',
            images: [
              'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=80',
            ],
            materials: 'Цэвэр царс мод, Металл профиль, Rubio тос',
            durationDays: 12,
            location: 'Сүхбаатар, Төвийн бүс',
            year: '2026',
            createdAt: new Date().toISOString(),
          },
          {
            id: uuidv4(),
            title: 'Зайсан вилла хаус - Зочны өрөөний модон ханын чимэглэл & TV стэнд',
            category: 'LIVING_ROOM',
            description: 'Акустик модон рейк хана болон өлгөгдсөн минимал зурагтын тавиур.',
            images: [
              'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1000&q=80',
            ],
            materials: 'Байгалийн царс мод, Акустик эсгий, LED гэрэл',
            durationDays: 8,
            location: 'Хан-Уул, Зайсан',
            year: '2026',
            createdAt: new Date().toISOString(),
          },
        ],
        articles: [
          {
            id: uuidv4(),
            title: 'E0 ба E1 хавтангийн ялгаа ба гэр бүлийн эрүүл мэнд',
            summary: 'Тавилга хийлгэхэд хамгийн их яригддаг формальдегид ялгаруулалтын түвшинг хэрхэн ялгаж мэдэх вэ?',
            content: `Формальдегид нь тавилгын шахмал хавтангийн цавуунд агуулагддаг химийн бодис юм:
• E0 Хавтан: Формальдегид ялгаруулалт нь 0.5 мг/л-ээс бага бөгөөд байгалийн модтой адил хамгийн аюулгүй, хүүхдийн өрөө болон унтлагын өрөөнд нэн тохиромжтой.
• E1 Хавтан: Европын холбооны аюулгүй стандартын хязгаарт багтдаг (1.5 мг/л хүртэл), үнэ болон чанарын хамгийн тэнцвэртэй сонголт.
• E2 Хавтан: Дотор орон зайд ашиглахыг ихэнх улсад хориглосон бөгөөд хурц үнэртэй, толгой өвтгөх аюултай тул зөвхөн E0, E1 баталгаатай брэнд хавтанг сонгохыг зөвлөж байна.`,
            category: 'МАТЕРИАЛ',
            imageUrl: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
            readMinutes: 4,
            publishedAt: '2026.10.18',
          },
        ],
      },
      {
        name: 'Modart Kitchen & Furniture',
        tagline: 'Ухаалаг багтаамжтай шүүгээ, хүүхдийн өрөөний эргономик тавилга',
        description: 'Орон зайн хэмжээг хамгийн оновчтой ашигласан ухаалаг хувиргагч тавилга, хүүхдийн эрүүл мэндэд ээлтэй будаггүй E0 хавтангаар хийсэн тавилга үйлдвэрлэл.',
        logoUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=400&q=80',
        coverUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=1400&q=80',
        categories: ['KIDS', 'WARDROBE', 'KITCHEN', 'CUSTOM'],
        experienceYears: 6,
        warrantyMonths: 24,
        city: 'Улаанбаатар',
        district: 'Баянзүрх',
        addressDetail: '16-р хороолол, Офицеруудын ордны зүүн хойно, Модарт билдинг 1 давхарт',
        phone: '8088-2211',
        secondaryPhone: '7722-1100',
        facebookUrl: 'https://facebook.com/modartfurniture',
        instagramUrl: 'https://instagram.com/modart_mongolia',
        materialsUsed: ['Турк Kastamonu E0 хавтан', 'DTC зөөлөн хаагчтай тоноглол', 'Эко PVC хүрээ наалт'],
        rating: 4.88,
        reviewsCount: 29,
        isVerified: true,
        isFeatured: false,
        portfolio: [
          {
            id: uuidv4(),
            title: 'Энканто таун хотхоны 2 хүүхдийн хамтарсан өрөөний цогц тавилга',
            category: 'KIDS',
            description: '2 давхар ор, хичээлийн ширээ, хувцасны шүүгээ болон тоглоом хадгалах шургуулгатай шат бүхий орон зай хэмнэсэн төсөл.',
            images: [
              'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1000&q=80',
              'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1000&q=80',
            ],
            materials: 'Kastamonu E0 хавтан, Пастел ногоон болон цагаан хослол',
            durationDays: 10,
            location: 'Баянзүрх, Энканто таун',
            year: '2026',
            createdAt: new Date().toISOString(),
          },
        ],
        articles: [
          {
            id: uuidv4(),
            title: 'Жижиг орон сууцанд шүүгээ төлөвлөх 4 ухаалаг арга',
            summary: 'Таазанд тулсан өндөр шүүгээ, тольтой хаалга болон гүйдэг хаалганы давуу талууд.',
            content: `Бага талбайтай орон сууцанд шүүгээг зөв төлөвлөснөөр 30-40% илүү зүйл багтаах боломжтой:
1. Тааз хүртэл өндөртэй хийх: Тааз хоорондын сул зайг битүүлснээр тоос цугларахгүй, улирлын чанартай чемодан, хөнжил даавууг дээд хэсэгт чөлөөтэй хадгална.
2. Гүйдэг хаалга (Coupe): Хаалга нээгдэх зай шаардахгүй тул орны хажуу дахь нарийн зайд маш тохиромжтой.
3. Дотор зохион байгуулалт: Өлгүүрийн өндрийг богино (цамц) ба урт (пальто) хувцсаар хувааж, доод хэсэгт гутал ба дотуур хувцасны сагс төлөвлөх.`,
            category: 'ОРОН ЗАЙ',
            imageUrl: 'https://images.unsplash.com/photo-1595428774223-ef52624120d2?auto=format&fit=crop&w=800&q=80',
            readMinutes: 3,
            publishedAt: '2026.10.12',
          },
        ],
      },
    ];

    for (const data of demoMakers) {
      const entity = this.furnitureRepository.create(data);
      await this.furnitureRepository.save(entity);
    }

    console.log(`✅ Seeded ${demoMakers.length} realistic furniture makers with portfolio and tips!`);
  }
}
