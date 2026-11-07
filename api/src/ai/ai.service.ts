import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Listing } from '../listings/listing.entity';
import { Project } from '../projects/project.entity';
import { ListingStatus } from '../listings/enums/listing.enums';
import { AiChatDto, GenerateDescriptionDto, EstimatePriceDto } from './dto/ai.dto';

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
   * Parses intent, finds matching listings & projects, calculates mortgage estimates.
   */
  async chat(dto: AiChatDto) {
    const rawMsg = (dto.message || '').trim();
    const queryLower = rawMsg.toLowerCase();

    // Check if an external LLM key is configured (Gemini or OpenAI)
    const geminiKey = process.env.GEMINI_API_KEY;
    const openAiKey = process.env.OPENAI_API_KEY;

    // Fetch active listings and projects from DB to supply context
    const [listings, projects] = await Promise.all([
      this.listingRepo.find({
        where: { status: ListingStatus.ACTIVE },
        take: 12,
        order: { createdAt: 'DESC' },
      }),
      this.projectRepo.find({
        take: 8,
        order: { createdAt: 'DESC' },
      }),
    ]);

    // Extract search filters from query
    const targetDistrict = Object.keys(this.districtBenchmarks).find((d) =>
      queryLower.includes(d.toLowerCase()) || queryLower.includes(d.toLowerCase().replace('-', ' ')),
    );

    const isRent = queryLower.includes('түрээс') || queryLower.includes('хөлсл');
    const isMortgage6 = queryLower.includes('6%') || queryLower.includes('ипотек') || queryLower.includes('зээл');

    // Extract numbers if budget or room mentioned (e.g., "150 сая", "2 өрөө")
    let budgetMax: number | null = null;
    const millionMatch = rawMsg.match(/(\d+(?:\.\d+)?)\s*(?:сая|say)/i);
    if (millionMatch) {
      budgetMax = parseFloat(millionMatch[1]) * 1000000;
    }

    let roomsCount: number | null = null;
    const roomMatch = rawMsg.match(/(\d+)\s*(?:өрөө|oroo)/i);
    if (roomMatch) {
      roomsCount = parseInt(roomMatch[1], 10);
    }

    // Filter relevant listings
    let matchingListings = listings.filter((l) => {
      let matches = true;
      if (targetDistrict && !l.district.includes(targetDistrict)) matches = false;
      if (isRent && String(l.type).toLowerCase() !== 'rent') matches = false;
      if (!isRent && queryLower.includes('зар') && String(l.type).toLowerCase() === 'rent') matches = false;
      if (budgetMax && l.price > budgetMax * 1.2) matches = false;
      if (roomsCount && l.attributes?.bedrooms && Number(l.attributes.bedrooms) !== roomsCount) matches = false;
      return matches;
    });

    if (matchingListings.length === 0 && listings.length > 0) {
      // Fallback to top featured or urgent listings
      matchingListings = listings.slice(0, 3);
    } else {
      matchingListings = matchingListings.slice(0, 4);
    }

    // Filter relevant projects
    let matchingProjects = projects.filter((p) => {
      let matches = true;
      if (targetDistrict && !p.district.includes(targetDistrict)) matches = false;
      const has6Mortgage = p.paymentTerms && p.paymentTerms.some((t) => t.includes('6%'));
      if (isMortgage6 && !has6Mortgage) matches = false;
      if (budgetMax && p.startingPrice && p.startingPrice > budgetMax * 1.2) matches = false;
      return matches;
    });

    if (matchingProjects.length === 0 && projects.length > 0) {
      matchingProjects = projects.slice(0, 2);
    } else {
      matchingProjects = matchingProjects.slice(0, 3);
    }

    // If Gemini API Key exists, use real Gemini LLM with RAG context
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
      } catch (err) {
        this.logger.warn(`Gemini call failed, falling back to smart built-in engine: ${err.message}`);
      }
    }

    // Smart Built-in NLP Response Generation (100% Free, Zero Cost)
    const replyText = this.generateSmartChatReply(rawMsg, {
      district: targetDistrict,
      isRent,
      isMortgage6,
      budgetMax,
      roomsCount,
      matchingCount: matchingListings.length + matchingProjects.length,
    });

    return {
      reply: replyText,
      recommendations: {
        listings: matchingListings,
        projects: matchingProjects,
      },
    };
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
    ctx: { district?: string; isRent: boolean; isMortgage6: boolean; budgetMax: number | null; roomsCount: number | null; matchingCount: number },
  ): string {
    const greetings = ['Сайн байна уу! Vmax AI үл хөдлөх хөрөнгийн ухаалаг туслах бэлэн байна. 🏡', 'Тавтай морилно уу! Би танд тохирох байрыг олоход тусалъя. ✨'];
    const greeting = greetings[Math.floor(Math.random() * greetings.length)];

    let parts: string[] = [greeting];

    if (ctx.district) {
      parts.push(`📍 Таны сонирхсон **${ctx.district} дүүрэг** дэх шилдэг сонголтуудыг шүүж гаргалаа.`);
    }

    if (ctx.budgetMax) {
      const budgetMil = (ctx.budgetMax / 1000000).toFixed(0);
      parts.push(`💰 Төсөв: **${budgetMil} сая төгрөг** доторх хамгийн үнэ цэнтэй хувилбарууд.`);
    }

    if (ctx.roomsCount) {
      parts.push(`🚪 Хүсэлт: **${ctx.roomsCount} өрөө** орон сууц.`);
    }

    if (ctx.isMortgage6) {
      parts.push(`🏦 Мөн **Ипотекийн 6%-ийн хөнгөлөлттэй зээлд** хамрагдах боломжтой шинэ орон сууц, төслүүдийг багтаасан болно.`);
    }

    if (ctx.matchingCount > 0) {
      parts.push(`Танд зориулан санал болгож буй доорх зарууд болон төслүүдийг сонирхоод үзээрэй. Аль нэг дээр нь даран шууд 3D аялал хийх эсвэл борлуулагчтай нь холбогдох боломжтой:`);
    } else {
      parts.push(`Танд ойролцоо зах зээлийн хамгийн эрэлттэй шинэ төсөл болон онцлох заруудыг санал болгож байна:`);
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
