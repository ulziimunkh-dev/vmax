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
  { name: 'Шарга морьт / Хандгайт', aliases: ['шарга морьт', 'хандгайт', 'шаргаморьт', 'шарга морьтод'], district: 'Сүхбаатар' },
  { name: 'Гачуурт', aliases: ['гачуурт', 'гачууртад', 'гачууртын'], district: 'Баянзүрх' },
  { name: 'Улиастай', aliases: ['улиастай', 'улиастайд'], district: 'Баянзүрх' },
  { name: 'Налайх', aliases: ['налайх', 'налайхад'], district: 'Налайх' },
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
   * Answers system/FAQ questions, or parses real estate search intent to query database.
   */
  async chat(dto: AiChatDto) {
    const rawMsg = (dto.message || '').trim();
    const queryLower = rawMsg.toLowerCase();

    // 1. Check if the query is a System / Platform Information FAQ question
    const systemFaq = this.matchSystemKnowledge(queryLower);
    if (systemFaq) {
      return {
        reply: systemFaq.reply,
        quickLinks: systemFaq.quickLinks,
        recommendations: {
          listings: [],
          projects: [],
        },
      };
    }

    // 2. Extract criteria from user query
    const criteria = this.extractCriteria(rawMsg, queryLower);

    // 3. Perform intelligent SQL search across active database listings
    const { items: matchingListings, notes } = await this.searchListings(criteria);

    // 4. Perform intelligent SQL search across projects
    const matchingProjects = await this.searchProjects(criteria);

    // 5. Try Gemini LLM if configured
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

    // 6. Smart Built-in NLP Response Generation (100% Free, Zero Cost)
    const replyText = this.generateSmartChatReply(rawMsg, criteria, matchingListings, matchingProjects, notes);

    return {
      reply: replyText,
      recommendations: {
        listings: matchingListings,
        projects: matchingProjects,
      },
    };
  }

  /**
   * System & Platform Knowledge Base FAQ Matcher
   */
  private matchSystemKnowledge(queryLower: string): { reply: string; quickLinks: Array<{ label: string; url: string; external?: boolean }> } | null {
    // 1. Зар хэрхэн оруулах заавар
    if (/зар\s*(?:яаж|хэрхэн)?\s*(?:оруулах|тавих|нийтлэх|нэмэх|өгөх|үүсгэх)|байр\s*(?:зарах|түрээслүүлэх)\s*(?:гэсэн|хүсэж|болох|яах)|хэрхэн\s*(?:зарах|түрээслүүлэх)|шинэ\s*зар\s*(?:оруулах|нийтлэх)|зарын\s*заавар/i.test(queryLower)) {
      return {
        reply: `📝 **Vmax платформ дээр зар нийтлэх алхамчилсан заавар:**\n\n1. Дэлгэцийн баруун дээд буланд байрлах **"Зар оруулах"** товч дээр дарна (эсвэл [Зар оруулах](/create-listing) хуудсаар орно).\n2. **Төрөл & Ангилал:** Үл хөдлөх хөрөнгөө Зарах эсвэл Түрээслэх төрөл, Орон сууц, Хаус, Газар гэх мэт ангиллаа сонгоно.\n3. **Утасны дугаараа баталгаажуулах:** Холбоо барих 8 оронтой дугаараа оруулаад **"Мессеж илгээх (SMS нээх)"** товчийг дарж 144773 тусгай дугаарт код илгээн 2 секундэд автоматаар баталгаажуулна.\n4. **Үнэ, Талбай & Байршил:** Үнэ (₮), талбай (м.кв), өрөөний тоо, дүүрэг хороогоо оруулан интерактив газрын зураг дээр барилгынхаа яг байршлыг тэмдэглэнэ.\n5. **Медиа оруулах:**\n   • **15s Walkthrough Reels бичлэг:** Утсаараа авсан 15 секунд хүртэлх босоо бичлэг оруулбал зарын хандалт 3-5 дахин ихэсдэг.\n   • **Зураг & Photo Editor:** Оруулсан зургийнхаа '✏️ Засах' товчийг даран вэб дээрээсээ 90° эргүүлэх, гэрэлтүүлэг тохируулах, тайрах бүрэн боломжтой.\n6. **Нийтлэх:** 'Нийтлэх' товчийг дармагц таны зар Vmax платформ дээр шууд нийтлэгдэж худалдан авагчдад хүрнэ!`,
        quickLinks: [
          { label: '📝 Шинэ зар нийтлэх', url: '/create-listing' },
          { label: '💎 Үнийн багц харах', url: '/pricing' },
        ],
      };
    }

    // 2. Үнийн тариф, багц (Pricing, Plans, Subscriptions)
    if (/багц|үнэ\s*тариф|үнэ\s*хэд|төлбөр|үнэтэй\s*юу|үнэгүй\s*юу|үнэ\s*хөлс|эрх\s*авах|гишүүнчлэл|pro\s*agent|agency|багцын\s*үнэ|зар\s*үнэгүй\s*юу/i.test(queryLower)) {
      return {
        reply: `💎 **Vmax платформын гишүүнчлэл & үнийн багцууд:**\n\n1. **Энгийн (Free)** — **0 ₮ (Үнэгүй)**\n   • 3 хүртэлх идэвхтэй зарын лимит\n   • Стандарт хайлтын илэрц\n   • Утасны дугаар болон шууд чат\n\n2. **Pro Agent** — **49,000 ₮ / сард** *(Риэлторуудын сонголт)*\n   • 30 хүртэлх идэвхтэй зарын лимит\n   • **Баталгаажсан Риэлтор (Verified Agent)** цэнхэр тэмдэг\n   • Агентын бие даасан хувийн профайл хуудас\n   • Зарын үзэлт, хандалтын дэлгэрэнгүй аналитик\n   • Тэргүүн дараалалд эрэмбэлэгдэх онцгой давуу тал\n\n3. **Agency (Агентлаг)** — **199,000 ₮ / сард**\n   • Хязгааргүй идэвхтэй зарын лимит\n   • Агентлагийн нэгдсэн лого & танилцуулга\n   • Олон агентын дэд хаягийн төвлөрсөн удирдлага\n   • VIP зарын тусгай хөнгөлөлт & 24/7 тэргүүлэх тусламж\n\n💡 Энгийн хэрэглэгчдэд 3 хүртэлх зарыг 100% ҮНЭ ТӨЛБӨРГҮЙ байршуулах боломж олгодог!`,
        quickLinks: [
          { label: '💎 Багц ахиулах / Үнийн тариф', url: '/pricing' },
          { label: '📝 Үнэгүй зар оруулах', url: '/create-listing' },
        ],
      };
    }

    // 3. Утасны дугаар баталгаажуулах (Verify.mn, MO SMS 144773)
    if (/утас\s*(?:яаж|хэрхэн)?\s*баталгаажуулах|sms|144773|verify|мессеж|код\s*ирэхгүй|баталгаажсангүй|дугаар\s*баталгаажуулах/i.test(queryLower)) {
      return {
        reply: `📱 **Утасны дугаар баталгаажуулах заавар (Verify.mn):**\n\nVmax платформ нь хуурамч зар, зуучлагчийн давхардлаас сэргийлэхийн тулд **Verify.mn** системийн MO SMS технологиор жинхэнэ эзэмшигчийг баталгаажуулдаг:\n\n1. Зар оруулах эсвэл нэвтрэх үедээ өөрийн 8 оронтой дугаараа оруулна.\n2. **'Мессеж илгээх (SMS нээх)'** товчийг дарна.\n3. Таны утасны мессежний апп нээгдэж \`144773\` дугаарт тусгай баталгаажуулах код автоматаар бэлтгэгдэнэ.\n4. Та ердөө 'Илгээх' (Send) товчийг дарахад 1-2 секундэд систем автоматаар ногоон болж баталгаажна.\n\n⚠️ Хэрэв та компьютерээс хандаж байгаа бол гар утсаараа \`144773\` дугаарт дэлгэц дээр харагдаж буй кодыг бичин мессеж илгээнэ үү.`,
        quickLinks: [
          { label: '📱 Утасны дугаараар нэвтрэх', url: '/login' },
          { label: '📝 Зар оруулах', url: '/create-listing' },
        ],
      };
    }

    // 4. 15-секундийн Walkthrough Reels бичлэг
    if (/reel|reels|босоо\s*бичлэг|видео\s*зар|15\s*секунд|walkthrough|бичлэгтэй\s*зар/i.test(queryLower)) {
      return {
        reply: `🎬 **15-Секундийн Walkthrough Reels-ийн тухай:**\n\nVmax платформ нь Монголд анх удаа үл хөдлөх хөрөнгийг TikTok/Instagram Reels шиг босоо (9:16) богино бичлэгээр бүтэн дэлгэцээр үзэх боломжийг олгосон:\n\n• **Хэрэглэгчдэд:** Олон зураг гүйлгэж цаг алдалгүй, байран дундуур нь алхаж байгаа мэт бодит мэдрэмж авч, 1 товшилтоор борлуулагчтай шууд холбогдоно.\n• **Зар оруулагчдад:** 15 секунд хүртэлх босоо бичлэг хавсаргасан зарын борлуулалт болон үзэлт 3-5 дахин их байдаг.\n• **Үзэх:** Нүүр хуудасны баруун талд байрлах **'🎬 Reels'** товч дээр дарж үзнэ үү!`,
        quickLinks: [
          { label: '🎬 Reels үзэх (Нүүр хуудас)', url: '/' },
          { label: '📹 Реел бичлэгтэй зар нийтлэх', url: '/create-listing' },
        ],
      };
    }

    // 5. Зар харьцуулах (Compare Mode)
    if (/харьцуулах|харьцуулалт|зэрэгцүүл|compare|ялгаа/i.test(queryLower)) {
      return {
        reply: `⚖️ **Үл хөдлөх хөрөнгө зэрэгцүүлэн харьцуулах боломж:**\n\nТа олон байр дундаас шийдвэр гаргахад эргэлзэж байвал:\n1. Зарын картууд дээрх **'Харьцуулах'** (⚖️) товчийг дарж харьцуулалтад нэмнэ.\n2. Дээд цэсний **'Харьцуулах'** товч дээр дарах эсвэл [Харьцуулалт хуудас](/compare) руу орно.\n3. Сонгосон үл хөдлөхүүдийн үнэ, м.кв, ашиглалтад орсон он, байршил, давхар, төлбөрийн нөхцөлийг нэг дэлгэц дээр зэрэгцүүлэн харьцуулж хамгийн зөв сонголтоо хийгээрэй!`,
        quickLinks: [
          { label: '⚖️ Зар харьцуулалт руу очих', url: '/compare' },
          { label: '🏠 Бүх заруудыг үзэх', url: '/' },
        ],
      };
    }

    // 6. Вэб Photo Editor
    if (/зураг\s*(?:засах|янзлах|эргүүлэх|тайрах)|photo\s*editor|гэрэлтүүлэг|зураг\s*янзал/i.test(queryLower)) {
      return {
        reply: `✏️ **Вэб дээрээс шууд зураг засварлах (In-Browser Photo Editor):**\n\nЗар оруулах явцдаа нэмсэн зургийнхаа дээр байрлах **'✏️ Засах'** товчийг даран:\n• **🔄 90° Эргүүлэх:** Буруу харуулж авсан зургийг 1 товшилтоор тэгшлэнэ.\n• **☀️ Гэрэлтүүлэг & Тодрол:** Харанхуй өрөөний зургийг -50%-аас +60% хүртэл тодруулна.\n• **📐 Тайралт (Crop):** 4:3 (Үл хөдлөхийн стандарт), 16:9 (Өргөн дэлгэц), 1:1 (Дөрвөлжин) харьцаагаар тайрна.\n• **🪞 Тольдох:** Зургийг хэвтээ чиглэлд тольдож болно.\n\nЭдгээр бүх засвар нь таны хөтөч дээр ямар ч сервер рүү илгээлгүйгээр хурдан хийгддэг.`,
        quickLinks: [
          { label: '📝 Зар оруулах хуудас', url: '/create-listing' },
        ],
      };
    }

    // 7. Интерактив Газрын Зураг & Хороо (Map Search)
    if (/газрын\s*зураг|map|байршлаар\s*харах|радар|хороо\s*сонгох|байршил/i.test(queryLower)) {
      return {
        reply: `🗺️ **Интерактив Газрын Зураг & Хорооны хайлт:**\n\n• **Газрын зургаар харах:** Нүүр хуудасны **'Газрын зураг'** товчийг дарснаар бүх зарыг Улаанбаатар хотын газрын зураг дээр тээглүүр (pin) хэлбэрээр харж болно.\n• **9 Дүүрэг & 200+ Хороо:** Хан-Уул, Баянзүрх, Сүхбаатар зэрэг дүүрэг бүрийн хороог сонгон нарийвчлан хайна.\n• **Алдартай байршлууд:** Зайсан, Яармаг, River Garden, Хүннү 2222, Сансар, Их Монгол, 3-4-р хороолол гэх мэт эрэлттэй бүсүүдээр 1 товшилтоор шүүх боломжтой.`,
        quickLinks: [
          { label: '🗺️ Газрын зураг нээх (Нүүр)', url: '/' },
        ],
      };
    }

    // 8. Холбоо барих, Дэмжлэг & Оффис
    if (/холбоо\s*барих|утас\s*(?:хэд|ямар|дугаар)|оффис\s*(?:хаана|байршил)|имэйл\s*хаяг|тусламж|support|contact|лавлах|хэнд\s*хандах/i.test(queryLower)) {
      return {
        reply: `📞 **Vmax тусламж, дэмжлэгийн багтай холбоо барих:**\n\n• 📞 **Лавлах утас:** [+976 8976-7700](tel:+97689767700)\n• ✉️ **Имэйл хаяг:** [contact@vmax.mn](mailto:contact@vmax.mn), [info@vmax.mn](mailto:info@vmax.mn)\n• 📍 **Хаяг:** Улаанбаатар хот, Сүхбаатар дүүрэг, 1-р хороо\n• 🕒 **Ажиллах цаг:** Даваа - Баасан, 09:00 - 18:00\n\nСистемийн ашиглалт, зарын үнийн багц эсвэл хамтран ажиллах хүсэлттэй бол дээрх утсаар бидэнтэй шууд холбогдоорой!`,
        quickLinks: [
          { label: '📞 8976-7700 руу шууд залгах', url: 'tel:+97689767700', external: true },
          { label: '✉️ contact@vmax.mn имэйл бичих', url: 'mailto:contact@vmax.mn', external: true },
        ],
      };
    }

    // 9. Vmax сайтын давуу талууд (Site Advantages & Benefits)
    if (/давуу\s*тал|давуу\s*талууд|яагаад\s*vmax|бусад\s*сайтаас|юугаараа\s*илүү|онцлог\s*давуу|онцлогууд|advantage|benefit|ялгарах\s*онцлог|сайтын\s*давуу/i.test(queryLower)) {
      return {
        reply: `🌟 **Vmax.mn платформын бусад сайтуудаас ялгарах ТОП 8 давуу тал:**\n\n1. 🎬 **15s Walkthrough Reels (Босоо видео):**\n   TikTok/Instagram шиг босоо (9:16) бичлэгээр байрны дотоод бодит зохион байгуулалтыг тольдоно. Зургийн цаанаас хууртахгүй, цагаа 3 дахин хэмнэнэ.\n2. 📱 **Verify.mn 144773 MO SMS Баталгаажуулалт:**\n   Хуурамч зар, зуучлагчийн давхардсан заруудыг арилгаж, зөвхөн утасны дугаараа баталгаажуулсан жинхэнэ эздийн зарыг хүргэнэ.\n3. 🤖 **Vmax AI Ухаалаг Хайлт & Зөвлөх:**\n   "Хан-Уулд 150 саяын 2 өрөө" гэж энгийн яриагаар хайх боломжтойгоос гадна зарын тайлбар автоматаар бичигч, зах зээлийн үнийн таамаглагчтай.\n4. 🏨 **Daily Rent (Хоногоор түрээслэх нэгдсэн систем):**\n   Амралтын болон зочны байрыг хуанлиар (Check-in/Check-out) шууд тооцоолон хоногоор захиалах шийдэлтэй.\n5. ✏️ **Вэб Зураг Засварлагч (In-browser Photo Editor):**\n   Зар оруулах явцдаа хөтөч дээрээсээ зургийг 90° эргүүлэх, гэрэлтүүлэг тохируулах, 4:3 стандартын тайралт хийх боломжтой.\n6. ⚖️ **Compare Mode (Зэрэгцүүлэн харьцуулалт):**\n   4 хүртэлх байрны үнэ, м.кв, ашиглалтад орсон он, нөхцөлүүдийг нэг дэлгэц дээр зэрэгцүүлж харьцуулна.\n7. 📲 **PWA Дэвшилтэт Апп:**\n   App Store, Play Store-оос таталгүйгээр гар утсандаа суулган, интернет муутай үед ч дээд зэргийн хурдаар ажиллана.\n8. ⚡ **Шимтгэлгүй, Шууд харилцаа:**\n   Хэрэглэгч болон эзэмшигч хооронд ямар нэг нэмэлт шимтгэлгүйгээр 1 товшилтоор шууд утсаар холбогдоно.`,
        quickLinks: [
          { label: '🏠 Нүүр хуудас үзэх', url: '/' },
          { label: '📝 Үнэгүй зар оруулах', url: '/create-listing' },
          { label: '💎 Үнийн багц харах', url: '/pricing' },
        ],
      };
    }

    // 10. Хоногоор түрээслэх (Daily Rent / Daily Stay)
    if (/хоногоор|өдрөөр|daily\s*rent|daily\s*stay|хоногийн|хоногоор\s*байр|богино\s*хугацаа|түрээслэх\s*хоногоор|зочид\s*буудал|stay|хоногоор\s*түрээс|daily/i.test(queryLower)) {
      return {
        reply: `🏨 **Vmax Daily Rent (Хоногоор түрээслэх) үйлчилгээний тухай:**\n\nVmax платформ нь богино хугацааны түрээс, зочны байр, амралтын орон сууцыг **хоногоор түрээслэх (Daily Rent / Stay)** тусгай системийг санал болгодог:\n\n1. **Түрээслэгч / Хэрэглэгчдэд:**\n   • **Шүүлтүүрээр хайх:** Төрөл хэсгээс 'Хоногоор' (Daily Rent) сонгон хоногоор түрээслэгдэх бүх байрыг үнэ, байршил, тавилгын бүрдлээр шүүнэ.\n   • **Хуанлийн тооцоолуур (Stay Booking):** Зарын хуудас дээр Check-in (Орох), Check-out (Гарах) огноо, зочдын тоогоо оруулахад нийт хоногийн төлбөр автоматаар бодогдож, эзэнд шууд захиалгын хүсэлт илгээнэ.\n   • **Шууд холбогдох:** 1 товшилтоор эзэмшигчийн дугаарыг нээн шууд ярих эсвэл зурвас бичих боломжтой.\n\n2. **Үл хөдлөх хөрөнгийн эздэд (Хоногоор түрээслүүлэгчдэд):**\n   • Зар оруулахдаа 'Түрээслэх' ➔ 'Хоногоор' (Daily Rent) сонгоно.\n   • 1 хоногийн суурь үнэ (₮), байрлах дүрэм (Check-in/Check-out цаг, тамхи татах, тэжээвэр амьтан), тавилгын бүрдлийг (Wi-Fi, ТВ, угаалгын машин, гал тогоо) оруулаад шууд нийтэлнэ.`,
        quickLinks: [
          { label: '🏨 Хоногоор түрээслэх зарууд', url: '/?type=DAILY_RENT' },
          { label: '📝 Хоногийн түрээсийн зар оруулах', url: '/create-listing' },
        ],
      };
    }

    // 11. Имэйл мэдэгдэл (Email Notifications & Alerts)
    if (/имэйл\s*мэдэгдэл|email\s*notification|мэдэгдэл|мэйл\s*(?:ирэх|авах|явах)|имэйлээр\s*мэдэгдэх|мэдэгдлийн\s*систем|хайлтын\s*мэдэгдэл|alert/i.test(queryLower)) {
      return {
        reply: `📩 **Vmax Имэйл мэдэгдлийн системийн тухай:**\n\nVmax платформ нь хэрэглэгч болон үл хөдлөх хөрөнгийн эздэд зориулсан дараах имэйл мэдэгдлүүдийг автоматаар илгээдэг:\n\n1. **Шинэ санал, хүсэлтийн мэдэгдэл (Inquiry & Booking Alert):**\n   • Таны заранд сонирхогч үйлчлүүлэгчээс зурвас, захиалгын хүсэлт (Check-in/out) эсвэл холбогдох утас илгээгдэх үед таны баталгаажсан имэйл рүү шууд мэдэгдэл очно.\n2. **Зарын хугацааны сануулга (Expiry Warning):**\n   • Зарын 7 хоногийн хугацаа дуусах дөхөх үед имэйл очих бөгөөд Хянах самбар (Dashboard)-аасаа 1 товшилтоор зарынхаа хугацааг ҮНЭ ТӨЛБӨРГҮЙ сунгаж болно.\n3. **Хадгалсан хайлтын шинэ зарын мэдээлэл (Saved Search Alert):**\n   • Сонирхож буй байршил, төсвөө '🔔 Хайлт хадгалах' товчоор тохируулснаар тухайн шалгуурт тохирох шинэ зар нэмэгдмэгц имэйлээр хамгийн түрүүнд мэдэгдэнэ.\n4. **Аюулгүй байдлын нэг удаагийн код (OTP):**\n   • Имэйл баталгаажуулах, нууц үг сэргээхэд 6 оронтой хамгаалалтын код илгээгдэнэ.\n\n💡 *Та өөрийн [Профайл хуудас](/profile)-аар орж имэйлээ баталгаажуулснаар эдгээр бүх мэдэгдлийг найдвартай авах боломжтой.*`,
        quickLinks: [
          { label: '👤 Профайл & Имэйл тохиргоо', url: '/profile' },
          { label: '🔔 Хайлт хадгалж мэдэгдэл авах', url: '/' },
          { label: '📊 Хянах самбар', url: '/dashboard' },
        ],
      };
    }

    // 12. Шинэ төсөл, хотхонууд (Projects)
    if (/төсөл|хотхон|шинэ\s*төсөл|барилгын\s*компани|project|захиалга\s*авах|6%\s*төсөл|ипотек\s*төсөл|төслүүд/i.test(queryLower)) {
      return {
        reply: `🏢 **Vmax Шинэ төсөл, хотхонуудын нэгдсэн каталог:**\n\nБарилгын компаниудын шинээр ашиглалтад орж буй болон захиалга авч буй бүх хотхон, төслүүдийг нэг дороос харах боломжтой:\n\n• **Хотхонуудын үзүүлэлт:** Ашиглалтад орох хугацаа (улирал/он), барилгын хийцлэл, нийт давхар, айлын тоо\n• **Төлбөрийн нөхцөл:** Захиалгын 1 м.кв үнэ, урьдчилгааны хувь, **Ипотекийн 6%** болон компанийн хүүгүй хувь лизинг\n• **Байршил & Борлуулалт:** Газрын зураг дээрх яг байршил, төслийн танилцуулга, борлуулалтын албаны шууд утас\n• **Төсөл нийтлэх:** Барилгын компаниуд [Төсөл нэмэх](/create-project) хуудсаар орж өөрийн шинэ төслийг бүртгэн захиалагчдад шууд хүргэх боломжтой.`,
        quickLinks: [
          { label: '🏢 Шинэ төслүүдийн жагсаалт', url: '/projects' },
          { label: '🏦 6% Ипотекийн зээлтэй төслүүд', url: '/projects?mortgage=true' },
          { label: '➕ Барилгын төсөл нийтлэх', url: '/create-project' },
        ],
      };
    }

    // 13. Тавилга & Интерьер газрууд (Furniture Stores & Profiles)
    if (/тавилга|интерьер|буйдан|ор|ширээ|furniture|гэрийн\s*тавилга|тавилгын\s*газар|тавилгын\s*дэлгүүр|тавилга\s*авах|гал\s*тогооны\s*тавилга|оффис\s*тавилга/i.test(queryLower)) {
      return {
        reply: `🛋️ **Vmax Тавилга & Интерьер шийдэл:**\n\nШинэ байрандаа тавилга худалдан авах эсвэл тавилга, интерьерийн бизнес эрхлэгчид бүтээгдэхүүнээ нийтлэх тусгай хэсэг:\n\n• **Тавилгын ангилал:** Зочны өрөө (буйдан, ТВ тавиур), Унтлагын өрөө (ор, матрас, хувцасны шүүгээ), Гал тогооны ком, Хүүхдийн өрөө, Оффис тавилга\n• **Бэлэн болон захиалгат:** Бэлэн байгаа тавилгууд болон захиалгаар хийх урлангуудын үнэ, хэмжээ, загвар\n• **Тавилгын дэлгүүрүүдэд:** Дэлгүүр, импортлогч, урлангууд [Тавилгын профайл үүсгэх](/create-furniture-profile) хуудсаар өөрийн дэлгүүрийн албан ёсны хаяг, лого, утас, бүтээгдэхүүнээ үнэ төлбөргүй нийтлэх боломжтой.`,
        quickLinks: [
          { label: '🛋️ Тавилгын нэгдсэн каталог', url: '/furniture' },
          { label: '➕ Тавилгын дэлгүүр бүртгэх', url: '/create-furniture-profile' },
        ],
      };
    }

    // 14. Газар & Зуслангийн газрууд (Land Listings & Plots)
    if (/газар|газрууд|зуслангийн\s*газар|газар\s*зарах|газар\s*авах|хашаа\s*газар|өмчлөх\s*газар|эзэмших\s*газар|газар\s*хайх|газрын\s*үнэ|зуслан/i.test(queryLower)) {
      return {
        reply: `🏞️ **Vmax Газар & Зуслангийн газрын нэгдсэн зарууд:**\n\nУлаанбаатар хот болон орон нутгийн бүх төрлийн газрын зарыг нэг дороос үзэж, нийтлэх боломжтой:\n\n• **Газрын үндсэн ангилал:**\n  1. **Зуслангийн эрүүл агаарын газар:** Бэлх, Сэлх, Шаргаморьт, Хандгайт, Гачуурт, Жигжид, Улиастай\n  2. **Хашаа байшингийн газар:** 9 дүүргийн гэр хороолол, дэд бүтэцтэй байршлууд\n  3. **Үйлдвэрлэл, үйлчилгээ, агуулахын газар:** Төв зам дагуух бизнесийн зориулалттай газрууд\n  4. **Фермер, хөдөө аж ахуй, төмс ногооны талбай**\n• **Газрын эрхийн статус:** Өмчлөх эрх (0.07 га хувийн өмч), Эзэмших эрх (15-60 жил), Ашиглах эрхийн гэрчилгээтэй эсэх болон тог, худаг, замын дэд бүтэц зарын хуудас дээр тодорхой харагдана.\n• **Газрын зар оруулах:** [Зар оруулах](/create-listing) ➔ Ангилал: **'Газар / Хашаа'** сонгоод хэмжээ (га эсвэл м.кв), гэрчилгээ, байршлаа оруулан шууд нийтэлнэ.`,
        quickLinks: [
          { label: '🏞️ Газрын бүх зарууд', url: '/?category=LAND' },
          { label: '📝 Газрын зар нийтлэх', url: '/create-listing' },
          { label: '🗺️ Газрын зургаар харах', url: '/' },
        ],
      };
    }

    // 14. Vmax системийн тухай ерөнхий танилцуулга
    if (/vmax\s*(?:гэж\s*юу|тухай|гэж\s*хэн|систем)|таны\s*тухай|чи\s*юу\s*вэ|хэн\s*үүсгэсэн|системийн\s*тухай|ямар\s*систем\s*бэ/i.test(queryLower)) {
      return {
        reply: `🏢 **Vmax.mn Үл хөдлөх хөрөнгийн ухаалаг платформын тухай:**\n\n\`Vmax.mn\` нь Монголын үл хөдлөх хөрөнгийн зах зээлд зориулсан, технологийн өндөр хурд, аюулгүй байдал, орчин үеийн хэрэглэгчийн туршлагыг хослуулсан дараа үеийн нэгдсэн систем юм.\n\n🌟 **Бидний гол онцлогууд:**\n1. 🎬 **15s Walkthrough Reels:** TikTok шиг босоо бичлэгээр байрыг бодитоор үзэх\n2. 🤖 **Vmax AI:** Үл хөдлөх хайх, зах зээлийн үнийн судалгаа & зарын тайлбар бичигч\n3. 📱 **Verify.mn 1-Click SMS:** Жинхэнэ эзэмшигчийг баталгаажуулсан найдвартай зарууд\n4. 🏨 **Daily Rent:** Хоногоор түрээслэх байрны захиалгын тусгай систем\n5. ✏️ **Вэб Зураг Засварлагч:** Зургийг хөтөч дээрээ эргүүлэх, гэрэлтүүлэх, тайрах\n6. ⚖️ **Харьцуулалт & Газрын зураг:** Олон зарыг зэрэгцүүлэн ухаалгаар харьцуулах боломж\n\nБи танд үл хөдлөх хөрөнгө хайх, зар нийтлэх болон системийн бүх боломжийг тайлбарлахад туслахад бэлэн!`,
        quickLinks: [
          { label: '🏠 Нүүр хуудас үзэх', url: '/' },
          { label: '📝 Зар оруулах', url: '/create-listing' },
          { label: '💎 Үнийн багц', url: '/pricing' },
        ],
      };
    }

    // 15. Нэвтрэх & Бүртгэл
    if (/нэвтрэх|бүртгүүлэх|аккаунт|бүртгэл|нууц\s*үг|google\s*нэвтрэх|хэрхэн\s*нэвтрэх/i.test(queryLower)) {
      return {
        reply: `🔑 **Vmax системд нэвтрэх болон бүртгүүлэх арга замууд:**\n\n1. **Google-ээр 1 товшилтоор нэвтрэх:** Нууц үг санах шаардлагагүй, өөрийн Gmail хаягаар нэг дараад шууд нэвтэрнэ.\n2. **Утасны дугаараар нэвтрэх (MO SMS):** Утасны дугаараа оруулаад 144773 тусгай дугаарт мессеж илгээн нууц үггүйгээр шуурхай нэвтрэх боломжтой.\n3. **Имэйлээр бүртгүүлэх:** Имэйл хаяг, нууц үгээ оруулан шинэ хэрэглэгчийн бүртгэл үүсгэж болно.`,
        quickLinks: [
          { label: '🔑 Нэвтрэх хуудас', url: '/login' },
          { label: '📝 Шинээр бүртгүүлэх', url: '/register' },
        ],
      };
    }

    // 16. Гар утсан дээр апп суулгах (PWA)
    if (/апп|суулгах|pwa|хэрэглүүр|программ|application/i.test(queryLower)) {
      return {
        reply: `📲 **Vmax Аппликейшн суулгах заавар (PWA):**\n\nVmax нь дэвшилтэт **Progressive Web App (PWA)** технологиор бүтээгдсэн тул App Store эсвэл Play Store-оос татах шаардлагагүйгээр утсан дээрээ суулгаж болно:\n\n• **Android (Chrome):** Дэлгэцийн баруун дээд буланд байрлах 3 цэг дээр дараад **'Апп суулгах'** (эсвэл 'Үндсэн дэлгэцэнд нэмэх') товчийг дарна.\n• **iPhone (Safari):** Доор байрлах **'Хуваалцах' (Share)** товчийг дараад **'Үндсэн дэлгэцэнд нэмэх' (Add to Home Screen)** товчийг дарна.\n\nИнгэснээр таны утсан дээр Vmax-ийн лого үүсэж, интернетгүй үед ч хурдан нээгддэг апп болно!`,
        quickLinks: [
          { label: '🏠 Нүүр хуудас руу очих', url: '/' },
        ],
      };
    }

    return null;
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
    if (/өдөр|хоног|stay|daily/i.test(queryLower)) {
      criteria.type = ListingType.DAILY_RENT;
    } else if (/түрээс|түрээсл|хөлсл|сараар|rent/i.test(queryLower)) {
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

    const typeLabel =
      criteria.type === ListingType.DAILY_RENT
        ? 'Өдрөөр түрээслэх'
        : criteria.type === ListingType.RENT
        ? 'Түрээс'
        : 'Худалдаа';

    if (criteria.categoryLabel) {
      filterBullets.push(`🏢 **Төрөл:** ${criteria.categoryLabel} (${typeLabel})`);
    } else if (criteria.type) {
      filterBullets.push(`🏷️ **Гүйлгээний төрөл:** ${typeLabel}`);
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
