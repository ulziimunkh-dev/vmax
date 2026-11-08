import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { Project } from '../projects/project.entity';
import { ListingStatus, ListingCategory, ListingType } from '../listings/enums/listing.enums';
import { AiChatDto, GenerateDescriptionDto, EstimatePriceDto } from './dto/ai.dto';

interface ExtractedCriteria {
  district?: string;
  subLocation?: string;
  subLocationLabel?: string;
  category?: ListingCategory;
  categoryLabel?: string;
  type?: ListingType;
  roomsCount?: number;
  budgetMax?: number;
  isMortgage6?: boolean;
}

const SUB_LOCATIONS: { name: string; aliases: string[]; district: string }[] = [
  { name: 'Зайсан', aliases: ['зайсан', 'зайсанд', 'зайсангийн', 'zaisan'], district: 'Хан-Уул' },
  { name: 'Яармаг', aliases: ['яармаг', 'яармагт', 'яармагаас', 'яармагийн', 'yarmag'], district: 'Хан-Уул' },
  { name: 'Нисэх', aliases: ['нисэх', 'нисэхэд', 'нисэхийн', 'niseh'], district: 'Хан-Уул' },
  { name: 'River Garden', aliases: ['river garden', 'ривер гарден', 'ривер', 'river'], district: 'Хан-Уул' },
  { name: '120 мянгат', aliases: ['120 мянгат', '120-д', '120', '120-т'], district: 'Хан-Уул' },
  { name: 'Хүннү 2222', aliases: ['хүннү 2222', 'хүннү', 'hunnu'], district: 'Хан-Уул' },
  { name: 'Маршал Таун', aliases: ['маршал таун', 'маршал', 'marshal'], district: 'Хан-Уул' },
  { name: 'King Tower', aliases: ['king tower', 'кинг тауэр', 'кинг'], district: 'Хан-Уул' },
  { name: 'Alpha Zone', aliases: ['alpha zone', 'альфа зон', 'alpha'], district: 'Хан-Уул' },
  { name: 'Bella Vista', aliases: ['bella vista', 'белла виста'], district: 'Хан-Уул' },
  { name: 'Сансар', aliases: ['сансар', 'сансарт', 'сансарын', 'sansar'], district: 'Баянзүрх' },
  { name: 'Баянмонгол', aliases: ['баянмонгол', 'баян монгол', 'bayanmongol'], district: 'Баянзүрх' },
  { name: 'Encanto Town', aliases: ['encanto', 'энканто'], district: 'Баянзүрх' },
  { name: 'Төв талбай', aliases: ['төв талбай', 'сб талбай', 'их дэлгүүр', 'цирк'], district: 'Сүхбаатар' },
  { name: 'Бэлх / Сэлх', aliases: ['бэлх', 'сэлх', 'бэлхэд'], district: 'Сүхбаатар' },
  { name: '3, 4-р хороолол', aliases: ['3-р хороолол', '4-р хороолол', '3, 4', '3 4', '3 4-р хороолол'], district: 'Баянгол' },
  { name: '10-р хороолол', aliases: ['10-р хороолол', '10 хороолол'], district: 'Баянгол' },
  { name: '1-р хороолол', aliases: ['1-р хороолол', '1 хороолол', 'саппоро', 'драгон'], district: 'Сонгинохайрхан' },
];

const DISTRICTS: { name: string; aliases: string[] }[] = [
  { name: 'Хан-Уул', aliases: ['хан-уул', 'хан уул', 'хануул', 'худ'] },
  { name: 'Баянзүрх', aliases: ['баянзүрх', 'баян зүрх', 'бзд'] },
  { name: 'Сүхбаатар', aliases: ['сүхбаатар', 'сүх баатар', 'сбд'] },
  { name: 'Баянгол', aliases: ['баянгол', 'баян гол', 'бгд'] },
  { name: 'Сонгинохайрхан', aliases: ['сонгинохайрхан', 'сонгино хайрхан', 'схд'] },
  { name: 'Чингэлтэй', aliases: ['чингэлтэй', 'чд'] },
  { name: 'Багануур', aliases: ['багануур'] },
  { name: 'Багахангай', aliases: ['багахангай'] },
  { name: 'Налайх', aliases: ['налайх'] },
];

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  // Ulaanbaatar Districts benchmark price per sqm (in MNT)
  private readonly districtBenchmarks: Record<string, { saleMin: number; saleAvg: number; saleMax: number; rentMonthlyAvg: number }> = {
    'Хан-Уул': { saleMin: 3200000, saleAvg: 4500000, saleMax: 8500000, rentMonthlyAvg: 2200000 },
    'Сүхбаатар': { saleMin: 3000000, saleAvg: 4200000, saleMax: 7800000, rentMonthlyAvg: 2000000 },
    'Баянзүрх': { saleMin: 2300000, saleAvg: 3200000, saleMax: 4800000, rentMonthlyAvg: 1500000 },
    'Баянгол': { saleMin: 2400000, saleAvg: 3300000, saleMax: 5000000, rentMonthlyAvg: 1600000 },
    'Чингэлтэй': { saleMin: 2200000, saleAvg: 3100000, saleMax: 4500000, rentMonthlyAvg: 1400000 },
    'Сонгинохайрхан': { saleMin: 1800000, saleAvg: 2500000, saleMax: 3500000, rentMonthlyAvg: 1100000 },
  };

  constructor(
    @InjectRepository(Listing)
    private readonly listingRepo: Repository<Listing>,
    @InjectRepository(Project)
    private readonly projectRepo: Repository<Project>,
  ) {}

  /**
   * 1. AI Real Estate Consultant Chat
   * Parses intent, performs intelligent database SQL search, calculates mortgage estimates.
   */
  async chat(dto: AiChatDto) {
    const rawMsg = (dto.message || '').trim();
    const queryLower = rawMsg.toLowerCase();

    // 1. Extract criteria from user query
    const criteria = this.extractCriteria(rawMsg, queryLower);

    // 2. Perform intelligent SQL search across active database listings
    const { items: matchingListings, notes } = await this.searchListings(criteria);

    // 3. Perform intelligent SQL search across projects
    const matchingProjects = await this.searchProjects(criteria);

    // 4. Try Gemini LLM if configured
    const geminiKey = process.env.GEMINI_API_KEY;
    if (geminiKey) {
      try {
        const reply = await this.callGemini(rawMsg, matchingListings, matchingProjects);
        return {
          reply,
          recommendations: {
            listings: matchingListings,
            projects: matchingProjects,
          },
        };
      } catch (err: any) {
        this.logger.warn(`Gemini call failed, falling back to smart built-in engine: ${err.message}`);
      }
    }

    // 5. Smart Built-in NLP Response Generation (100% Free, Zero Cost)
    const replyText = this.generateSmartChatReply(rawMsg, criteria, matchingListings, matchingProjects, notes);

    return {
      reply: replyText,
      recommendations: {
        listings: matchingListings,
        projects: matchingProjects,
      },
    };
  }

  private extractCriteria(rawMsg: string, queryLower: string): ExtractedCriteria {
    const criteria: ExtractedCriteria = {};

    // 1. Sub-locations / Landmarks (e.g. Zaisan, Yarmag, Sansar)
    for (const sub of SUB_LOCATIONS) {
      if (sub.aliases.some((alias) => queryLower.includes(alias))) {
        criteria.subLocation = sub.name.toLowerCase();
        criteria.subLocationLabel = sub.name;
        criteria.district = sub.district;
        break;
      }
    }

    // 2. District (if not already set by sub-location)
    if (!criteria.district) {
      for (const d of DISTRICTS) {
        if (d.aliases.some((alias) => queryLower.includes(alias))) {
          criteria.district = d.name;
          break;
        }
      }
    }

    // 3. Category
    if (/хаус|амины сууц|хашаа байшин|зуслан|коттеж|villa/i.test(queryLower)) {
      criteria.category = ListingCategory.HOUSE;
      criteria.categoryLabel = 'Хаус / Амины сууц';
    } else if (/үйлчилгээ|оффис|ресторан|дэлгүүр|агуулах|үйлдвэр|обьект|эмнэлэг|commercial/i.test(queryLower)) {
      criteria.category = ListingCategory.COMMERCIAL;
      criteria.categoryLabel = 'Үйлчилгээ / Оффис';
    } else if (/газар|хашаа газар|газрын/i.test(queryLower)) {
      criteria.category = ListingCategory.LAND;
      criteria.categoryLabel = 'Газар / Хашаа';
    } else if (/байр|орон сууц|апартмент|пентхаус|өрөө|apartment/i.test(queryLower)) {
      criteria.category = ListingCategory.APARTMENT;
      criteria.categoryLabel = 'Орон сууц';
    }

    // 4. Rooms count
    const numRoomMatch = queryLower.match(/([1-9])\s*(?:өрөө|oroo)/i);
    if (numRoomMatch) {
      criteria.roomsCount = parseInt(numRoomMatch[1], 10);
      if (!criteria.category) {
        criteria.category = ListingCategory.APARTMENT;
        criteria.categoryLabel = 'Орон сууц';
      }
    } else {
      const wordRoomMatch = queryLower.match(/(нэг|хоёр|гурван|дөрвөн|таван|зургаан)\s*(?:өрөө|oroo)/i);
      if (wordRoomMatch) {
        const wordMap: Record<string, number> = {
          нэг: 1, хоёр: 2, гурван: 3, дөрвөн: 4, таван: 5, зургаан: 6
        };
        criteria.roomsCount = wordMap[wordRoomMatch[1].toLowerCase()];
        if (!criteria.category) {
          criteria.category = ListingCategory.APARTMENT;
          criteria.categoryLabel = 'Орон сууц';
        }
      }
    }

    // 5. Transaction type
    if (/түрээс|түрээсл|хөлсл|сараар|rent/i.test(queryLower)) {
      criteria.type = ListingType.RENT;
    } else if (/худалда|авах|авна|зарна|зар|шинэ|бэлэн|sale/i.test(queryLower)) {
      criteria.type = ListingType.SALE;
    }

    // 6. Budget
    const billionMatch = queryLower.match(/(\d+(?:\.\d+)?)\s*(?:тэрбум|terbum)/i);
    if (billionMatch) {
      criteria.budgetMax = parseFloat(billionMatch[1]) * 1000000000;
    } else {
      const millionMatch = queryLower.match(/(\d+(?:\.\d+)?)\s*(?:сая|say|саяд|саяын|sayad)/i);
      if (millionMatch) {
        criteria.budgetMax = parseFloat(millionMatch[1]) * 1000000;
      }
    }

    // 7. Mortgage
    if (/6%|ипотек|зээл/i.test(queryLower)) {
      criteria.isMortgage6 = true;
    }

    return criteria;
  }

  private async searchListings(criteria: ExtractedCriteria): Promise<{ items: Listing[]; notes: string[] }> {
    const notes: string[] = [];

    const buildQuery = (opts: {
      useSubLoc: boolean;
      useDistrict: boolean;
      useCategory: boolean;
      useType: boolean;
      useRooms: boolean;
      budgetMultiplier: number;
    }) => {
      const qb = this.listingRepo.createQueryBuilder('listing');
      qb.where('listing.status = :status', { status: ListingStatus.ACTIVE });

      if (opts.useType && criteria.type) {
        qb.andWhere('listing.type = :type', { type: criteria.type });
      }

      if (opts.useCategory && criteria.category) {
        qb.andWhere('listing.category = :category', { category: criteria.category });
      }

      if (opts.useDistrict && criteria.district) {
        qb.andWhere('listing.district ILIKE :district', { district: `%${criteria.district}%` });
      }

      if (opts.useSubLoc && criteria.subLocation) {
        qb.andWhere(
          '(listing.location ILIKE :subLoc OR listing.title ILIKE :subLoc OR listing.description ILIKE :subLoc)',
          { subLoc: `%${criteria.subLocation}%` },
        );
      }

      if (opts.useRooms && criteria.roomsCount) {
        const r = criteria.roomsCount;
        qb.andWhere(
          "(listing.attributes->>'rooms' = :rStr OR listing.attributes->>'bedrooms' = :rStr OR listing.title ILIKE :rPattern1 OR listing.title ILIKE :rPattern2)",
          {
            rStr: String(r),
            rPattern1: `%${r} өрөө%`,
            rPattern2: `%${r}өрөө%`,
          },
        );
      }

      if (criteria.budgetMax) {
        qb.andWhere('listing.price <= :budgetMax', { budgetMax: criteria.budgetMax * opts.budgetMultiplier });
      }

      qb.orderBy('listing.isPromoted', 'DESC');
      qb.addOrderBy('listing.createdAt', 'DESC');
      qb.take(6);
      return qb;
    };

    // Stage 1: Strict search with all criteria
    let items = await buildQuery({
      useSubLoc: true,
      useDistrict: true,
      useCategory: true,
      useType: true,
      useRooms: true,
      budgetMultiplier: 1.1,
    }).getMany();

    if (items.length > 0) {
      return { items, notes };
    }

    // Stage 2: Relax subLocation if set (broaden to entire district)
    if (criteria.subLocation) {
      items = await buildQuery({
        useSubLoc: false,
        useDistrict: true,
        useCategory: true,
        useType: true,
        useRooms: true,
        budgetMultiplier: 1.15,
      }).getMany();

      if (items.length > 0) {
        notes.push(`Яг **${criteria.subLocationLabel}** дээр тохирох зар хараахан гараагүй тул **${criteria.district}** дүүрэг дэх хамгийн ойр төстэй хувилбаруудыг харуулж байна.`);
        return { items, notes };
      }
    }

    // Stage 3: Relax budget (+30%)
    if (criteria.budgetMax) {
      items = await buildQuery({
        useSubLoc: false,
        useDistrict: true,
        useCategory: true,
        useType: true,
        useRooms: true,
        budgetMultiplier: 1.35,
      }).getMany();

      if (items.length > 0) {
        notes.push(`Заасан төсөвтэй хамгийн ойр үнийн саналуудыг шүүж гаргалаа.`);
        return { items, notes };
      }
    }

    // Stage 4: Relax district to citywide if specified room and category
    if (criteria.roomsCount || criteria.category) {
      items = await buildQuery({
        useSubLoc: false,
        useDistrict: false,
        useCategory: true,
        useType: true,
        useRooms: !!criteria.roomsCount,
        budgetMultiplier: 1.5,
      }).getMany();

      if (items.length > 0) {
        notes.push(`Энэ бүсэд одоогоор зар цөөн байгаа тул нийслэл хот даяарх хамгийн тохиромжтой хувилбаруудыг үзүүлж байна.`);
        return { items, notes };
      }
    }

    // Stage 5: Ultimate fallback: Top active listings in category or active
    const fallbackQb = this.listingRepo.createQueryBuilder('listing')
      .where('listing.status = :status', { status: ListingStatus.ACTIVE });
    if (criteria.category) {
      fallbackQb.andWhere('listing.category = :category', { category: criteria.category });
    }
    fallbackQb.orderBy('listing.isPromoted', 'DESC');
    fallbackQb.addOrderBy('listing.createdAt', 'DESC');
    fallbackQb.take(4);
    items = await fallbackQb.getMany();

    return { items, notes };
  }

  private async searchProjects(criteria: ExtractedCriteria): Promise<Project[]> {
    const pqb = this.projectRepo.createQueryBuilder('project');

    if (criteria.district) {
      pqb.andWhere('project.district ILIKE :district', { district: `%${criteria.district}%` });
    }

    if (criteria.subLocation) {
      pqb.andWhere(
        '(project.name ILIKE :subLoc OR project.addressDetail ILIKE :subLoc OR project.description ILIKE :subLoc)',
        { subLoc: `%${criteria.subLocation}%` },
      );
    }

    if (criteria.isMortgage6) {
      pqb.andWhere("project.paymentTerms::text ILIKE '%6%'");
    }

    if (criteria.budgetMax) {
      pqb.andWhere('project.startingPrice <= :budgetMax', { budgetMax: criteria.budgetMax * 1.3 });
    }

    pqb.orderBy('project.isFeatured', 'DESC');
    pqb.addOrderBy('project.createdAt', 'DESC');
    pqb.take(3);

    let projects = await pqb.getMany();

    if (projects.length === 0) {
      projects = await this.projectRepo.find({
        take: 2,
        order: { isFeatured: 'DESC', createdAt: 'DESC' },
      });
    }

    return projects;
  }

  /**
   * 2. AI Description Generator for CreateListing
   */
  async generateDescription(dto: GenerateDescriptionDto) {
    const geminiKey = process.env.GEMINI_API_KEY;

    if (geminiKey) {
      try {
        const prompt = `Чи бол үл хөдлөх хөрөнгийн мэргэжлийн маркетер. Дараах үл хөдлөх хөрөнгийн зард зориулж худалдан авагч эсвэл түрээслэгчийг татах сэтгэл татам, цэгцтэй, монгол хэлээрх 3-4 догол мөр тайлбар бичиж өг.
Мэдээлэл:
- Төрөл: ${dto.type === 'RENT' ? 'Түрээс' : 'Худалдаа'}
- Байршил: ${dto.district || ''} дүүрэг, ${dto.khoroo || ''}-р хороо ${dto.location ? `(${dto.location})` : ''}
- Талбай: ${dto.areaSqm} м.кв
- Өрөөний тоо: ${dto.rooms || 'тодорхойгүй'}
- Давхар: ${dto.floor || ''}/${dto.totalFloors || ''}
- Үнэ: ${dto.price ? `${Number(dto.price).toLocaleString()} ₮` : 'Тохиролцоно'}
- Давуу талууд: ${dto.highlights?.join(', ') || 'Цэвэрхэн, тохилог'}

Тайлбарт дараах бүтцийг баримтал:
1. Байршлын онцлог & гол давуу тал
2. Өрөөний зохион байгуулалт, цонхны харууц, ашигласан материал
3. Хөрш орчин (сургууль, цэцэрлэг, худалдааны төв, нийтийн тээвэрт ойр байдал)
4. Холбогдох дуудлага (Call to action)`;

        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
          }),
        });

        const data = await res.json();
        const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          return { description: text.trim() };
        }
      } catch (err) {
        this.logger.warn(`Gemini description gen failed, falling back: ${err.message}`);
      }
    }

    // High quality template generator (Zero Cost)
    const isRent = dto.type === 'RENT';
    const districtText = dto.district ? `${dto.district} дүүрэгт` : 'Хотын үнэ цэнтэй бүсэд';
    const locDetail = dto.location ? ` (${dto.location})` : '';
    const roomText = dto.rooms ? `${dto.rooms} өрөө ` : '';
    const floorText = dto.floor && dto.totalFloors ? `${dto.totalFloors} давхар байрны ${dto.floor}-р давхарт байрлалтай.` : '';
    const highlightsText = dto.highlights && dto.highlights.length > 0
      ? `\n\nОнцлох давуу талууд:\n• ` + dto.highlights.join('\n• ')
      : '';

    const priceText = dto.price
      ? `Үнэ: ${Number(dto.price).toLocaleString()} ₮ ${isRent ? '/сард/' : ''}`
      : 'Үнэ: Тохиролцоно';

    const areaNum = Number(dto.areaSqm) || 50;
    const generated = `Тав тух, амар тайван орчныг бүрдүүлсэн ${districtText}${locDetail} байрлалтай ${areaNum} м.кв ${roomText}орон сууцыг ${isRent ? 'түрээслүүлнэ' : 'худалдана'}.

${floorText} Нарны тусгал маш сайн, уужим цэлгэр саруулхан цонхтой, цэвэрхэн ашигласан өрөөний зөв зохион байгуулалттай.${highlightsText}

Байршлын хувьд төв зам, нийтийн тээврийн буудал, улсын болон хувийн сургууль, цэцэрлэг, худалдаа үйлчилгээний төвүүдтэй ойр тул гэр бүлээрээ ая тухтай амьдрахад нэн тохиромжтой.

💰 ${priceText}
📞 Дэлгэрэнгүй мэдээлэл авах болон байрыг үзэх бол яг одоо холбогдоно уу.`;

    return { description: generated };
  }

  /**
   * 3. AI Market Price Estimation
   */
  async estimatePrice(dto: EstimatePriceDto) {
    const area = Number(dto.areaSqm) || 50;
    const isRent = dto.type === 'RENT';
    const districtKey = Object.keys(this.districtBenchmarks).find(
      (k) => dto.district && (dto.district.includes(k) || k.includes(dto.district)),
    ) || 'Хан-Уул';

    const benchmark = this.districtBenchmarks[districtKey] || {
      saleMin: 2500000,
      saleAvg: 3500000,
      saleMax: 5500000,
      rentMonthlyAvg: 1600000,
    };

    if (isRent) {
      const estimatedMonthlyRent = Math.round((benchmark.rentMonthlyAvg * (area / 55)) / 50000) * 50000;
      const minRent = Math.round((estimatedMonthlyRent * 0.85) / 50000) * 50000;
      const maxRent = Math.round((estimatedMonthlyRent * 1.2) / 50000) * 50000;

      let assessment = 'NORMAL';
      let message = 'Зах зээлийн дундаж үнэтэй нийцэж байна.';

      if (dto.price) {
        if (dto.price < minRent) {
          assessment = 'CHEAP';
          message = 'Зах зээлийн дунджаас маш боломжийн хямд үнэ байна (Түргэн түрээслэгдэх магадлал өндөр).';
        } else if (dto.price > maxRent) {
          assessment = 'EXPENSIVE';
          message = 'Зах зээлийн дунджаас арай өндөр үнэтэй байна (Бүрэн тохижилт, тавилгатай бол боломжтой).';
        }
      }

      return {
        unit: 'сард',
        recommendedPrice: estimatedMonthlyRent,
        priceRange: { min: minRent, max: maxRent },
        avgPerSqm: Math.round(estimatedMonthlyRent / area),
        assessment,
        message,
        district: dto.district,
      };
    }

    // Sale
    const avgPerSqm = benchmark.saleAvg;
    const minPerSqm = benchmark.saleMin;
    const maxPerSqm = benchmark.saleMax;

    const recommendedTotal = Math.round(avgPerSqm * area);
    const minTotal = Math.round(minPerSqm * area);
    const maxTotal = Math.round(maxPerSqm * area);

    let assessment = 'NORMAL';
    let message = 'Тухайн дүүргийн бодит зах зээлийн үнэлгээтэй дүйцэж байна.';

    if (dto.price) {
      const inputPerSqm = dto.price / area;
      if (inputPerSqm < minPerSqm) {
        assessment = 'CHEAP';
        message = '🔥 Зах зээлийн үнээс хямд санал болгосон байна (Яаралтай борлуулагдах өндөр магадлалтай).';
      } else if (inputPerSqm > maxPerSqm) {
        assessment = 'EXPENSIVE';
        message = 'Зах зээлийн дээд үнээс өндөр байна (Тансаг зэрэглэлийн байр биш бол үнээ бага зэрэг бууруулахыг зөвлөж байна).';
      }
    }

    return {
      unit: 'төгрөг',
      recommendedPrice: recommendedTotal,
      priceRange: { min: minTotal, max: maxTotal },
      avgPerSqm,
      pricePerSqmRange: { min: minPerSqm, max: maxPerSqm },
      assessment,
      message,
      district: dto.district,
    };
  }

  // --- Helpers ---
  private generateSmartChatReply(
    query: string,
    criteria: ExtractedCriteria,
    listings: Listing[],
    projects: Project[],
    notes: string[],
  ): string {
    const greetings = [
      'Сайн байна уу! Vmax AI үл хөдлөх хөрөнгийн ухаалаг туслах байна. 🏡',
      'Тавтай морилно уу! Таны хүсэлтийн дагуу хамгийн тохиромжтой үл хөдлөх хөрөнгүүдийг шүүж гаргалаа. ✨',
    ];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    const parts: string[] = [greeting];

    // Criteria recognition summary
    const filterBullets: string[] = [];
    if (criteria.subLocationLabel) {
      filterBullets.push(`📍 **Байршил:** ${criteria.district} (${criteria.subLocationLabel})`);
    } else if (criteria.district) {
      filterBullets.push(`📍 **Дүүрэг:** ${criteria.district}`);
    }

    if (criteria.categoryLabel) {
      filterBullets.push(`🏢 **Төрөл:** ${criteria.categoryLabel}${criteria.type === ListingType.RENT ? ' (Түрээс)' : ' (Худалдаа)'}`);
    } else if (criteria.type) {
      filterBullets.push(`🏷️ **Гүйлгээний төрөл:** ${criteria.type === ListingType.RENT ? 'Түрээс' : 'Худалдаа'}`);
    }

    if (criteria.roomsCount) {
      filterBullets.push(`🚪 **Өрөөний тоо:** ${criteria.roomsCount} өрөө`);
    }

    if (criteria.budgetMax) {
      const budgetMil = (criteria.budgetMax / 1000000).toLocaleString();
      filterBullets.push(`💰 **Төсөв:** ~${budgetMil} сая төгрөг хүртэл`);
    }

    if (criteria.isMortgage6) {
      filterBullets.push(`🏦 **Зээл:** Ипотекийн 6% хөнгөлөлттэй нөхцөл`);
    }

    if (filterBullets.length > 0) {
      parts.push(`🔍 **Таны хайлтын үзүүлэлтүүд:**\n` + filterBullets.map((b) => `• ${b}`).join('\n'));
    }

    // Notes if relaxed
    if (notes.length > 0) {
      parts.push(`💡 ${notes.join('\n')}`);
    }

    // Listings highlight summary
    if (listings.length > 0) {
      const listingLines = listings.slice(0, 3).map((l, idx) => {
        const priceStr = l.price ? `${Number(l.price).toLocaleString()} ₮` : 'Тохиролцоно';
        const areaStr = l.areaSqm ? ` • ${l.areaSqm} м.кв` : '';
        return `${idx + 1}. **${l.title}**\n   Үнэ: **${priceStr}**${areaStr} | Байршил: ${l.district || 'УБ'}`;
      });
      parts.push(`🏆 **Шилдэг сонголтууд:**\n\n` + listingLines.join('\n\n'));
      parts.push(`Дэлгэрэнгүй зураг, байршлын газрын зураг болон эзэмшигчийн дугаарыг үзэхийн тулд доорх картууд дээр шууд дарж үзнэ үү!`);
    } else {
      parts.push(`Одоогоор яг энэ шалгуурт тохирох зар хараахан нийтлэгдээгүй байна. Та шалгуураа бага зэрэг өргөжүүлэн (жишээ нь дүүрэг эсвэл үнийн хязгаарыг өөрчлөх) хайж үзээрэй.`);
    }

    return parts.join('\n\n');
  }

  private async callGemini(query: string, listings: Listing[], projects: Project[]): Promise<string> {
    const geminiKey = process.env.GEMINI_API_KEY;
    const prompt = `Чи бол Vmax.mn платформын үл хөдлөх хөрөнгийн ухаалаг зөвлөх туслах AI.
Хэрэглэгчийн асуулт: "${query}"

Одоогоор платформ дээрх бодит өгөгдөл:
Зарууд:
${listings.map((l) => `- ${l.title}: ${l.district}, ${l.price} ₮, ${l.areaSqm} м.кв, ${String(l.type)}`).join('\n')}

Төслүүд:
${projects.map((p) => `- ${p.name}: ${p.district}, эхлэх үнэ: ${p.startingPrice} ₮, нөхцөл: ${p.paymentTerms?.join(', ') || 'Бэлэн/Зээл'}`).join('\n')}

Даалгавар: Хэрэглэгчийн асуултад эелдэг, товч бөгөөд тодорхой, монгол хэлээр хариулж, тохирох зөвлөмж өгнө үү.`;

    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
      }),
    });

    const data = await res.json();
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Танд тохирох үл хөдлөх хөрөнгийн саналуудыг доор жагсаалаа:';
  }
}
