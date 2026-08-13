import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { ListingsService } from './listings/listings.service';
import { AuthProvider } from './common/enums/auth-provider.enum';
import { ListingType, ListingCategory, PromotionTier } from './listings/enums/listing.enums';
import * as bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { Listing } from './listings/listing.entity';
import { Favorite } from './favorites/favorite.entity';
import { Inquiry } from './inquiries/inquiry.entity';

async function bootstrap() {
  console.log('🌱 Starting Vmax database seed script...');

  const app = await NestFactory.createApplicationContext(AppModule);
  const usersService = app.get(UsersService);
  const listingsService = app.get(ListingsService);
  const dataSource = app.get(DataSource);

  const hashedPassword = await bcrypt.hash('password123', 10);

  // 1. Create or Find Demo Users
  console.log('👤 Seeding demo users...');
  let admin = await usersService.findByEmail('admin@vmax.mn');
  if (!admin) {
    admin = await usersService.create({
      name: 'Vmax Администратор',
      email: 'admin@vmax.mn',
      password: hashedPassword,
      phone: '88112233',
      authProvider: AuthProvider.LOCAL,
    });
    console.log('  ✅ Created admin@vmax.mn');
  }

  let agent = await usersService.findByEmail('agent@vmax.mn');
  if (!agent) {
    agent = await usersService.create({
      name: 'Баатар (Реалтор Агент)',
      email: 'agent@vmax.mn',
      password: hashedPassword,
      phone: '99887766',
      authProvider: AuthProvider.LOCAL,
    });
    console.log('  ✅ Created agent@vmax.mn');
  }

  // 2. Clear Existing Listings (Optional safety)
  const listingRepo = dataSource.getRepository(Listing);

  const SEED_LISTINGS = [
    {
      title: 'Хан-Уул дүүрэг, Зайсан, 4 өрөө пентхаус орон сууц',
      description: 'Зайсанд байрлах хотыг бүтнээр нь харах боломжтой, иж бүрэн тавилгатай, супер засвартай 4 өрөө пентхаус орон сууц зарна.',
      type: ListingType.SALE,
      category: ListingCategory.APARTMENT,
      price: 650000000,
      location: 'Улаанбаатар хот',
      district: 'Хан-Уул',
      latitude: 47.8864,
      longitude: 106.9056,
      areaSqm: 145,
      attributes: {
        rooms: 4,
        bedrooms: 4,
        bathrooms: 2,
        floor: 16,
        totalFloors: 16,
        yearBuilt: 2022,
        constructionType: 'Бүрэн цутгамал',
        condition: 'Шинэ (Оршин сууж байгаагүй)',
        windowDirections: 'Өмнө, Зүүн, Хоос',
        balcony: '2 тагттай',
        garage: '2 Дулаан гарааштай',
        paymentTerms: 'Бэлэн мөнгө / Банкны зээлээр',
      },
      images: ['/images/hero_penthouse.png', '/images/hero_villa.png', '/images/hero_tower.png'],
      isPromoted: true,
      promotionTier: PromotionTier.VIP,
      viewsCount: 1840,
      sharesCount: 320,
    },
    {
      title: 'Тэрэлж, 1.5 га газар бүхий Тансаг зэрэглэлийн эко хаус',
      description: 'Горхи Тэрэлжийн байгалийн үзэсгэлэнт газарт байрлах, 12 орчин үеийн гэр болон модон хаустай, рестораны барилгатай хаус зарна.',
      type: ListingType.SALE,
      category: ListingCategory.HOUSE,
      price: 1850000000,
      location: 'Горхи Тэрэлж',
      district: 'Налайх',
      latitude: 47.9850,
      longitude: 107.4500,
      areaSqm: 15000,
      attributes: {
        capacity: 80,
        condition: 'Иж бүрэн ашиглалтад орсон',
        paymentTerms: 'Бэлэн / Бартер оролцуулна',
      },
      images: ['/images/hero_villa.png', '/images/hero_penthouse.png', '/images/hero_tower.png'],
      isPromoted: true,
      promotionTier: PromotionTier.TOP_URGENT,
      viewsCount: 3290,
      sharesCount: 540,
    },

    {
      title: 'Сүхбаатар дүүрэг, Төв талбайн дэргэд А зэрэглэлийн оффис түрээслүүлнэ',
      description: 'Сүхбаатар дүүрэг, Төв талбайгаас 200 метрийн зайд байрлах бизнесийн төвд иж бүрэн тохижуулсан оффисын талбай түрээслүүлнэ.',
      type: ListingType.RENT,
      category: ListingCategory.COMMERCIAL,
      price: 7500000,
      location: 'Улаанбаатар хот',
      district: 'Сүхбаатар',
      latitude: 47.9250,
      longitude: 106.9200,
      areaSqm: 160,
      attributes: {
        rooms: 5,
        floor: 6,
        totalFloors: 14,
        yearBuilt: 2020,
        condition: 'Бүрэн засварласан',
        paymentTerms: 'Сар бүр төлнө',
      },
      images: ['/images/hero_tower.png', '/images/hero_penthouse.png', '/images/hero_villa.png'],
      isPromoted: true,
      promotionTier: PromotionTier.VIP,
      viewsCount: 2150,
      sharesCount: 190,
    },

    {
      title: 'Баянзүрх дүүрэг, Гачуурт, 2 давхар супер тансаг хаус',
      description: 'Гачууртын аманд байрлах цэвэр агаартай, бие даасан дэд бүтэцтэй, 5 унтлагын өрөөтэй 2 давхар хаус зарна.',
      type: ListingType.SALE,
      category: ListingCategory.HOUSE,
      price: 890000000,
      location: 'Улаанбаатар хот',
      district: 'Баянзүрх',
      latitude: 47.9150,
      longitude: 106.9600,
      areaSqm: 280,
      attributes: {
        rooms: 5,
        bedrooms: 5,
        bathrooms: 3,
        floor: 2,
        totalFloors: 2,
        yearBuilt: 2021,
        constructionType: 'Модон & Канад хийц',
        condition: 'Бүрэн засварласан',
        garage: '2 авто дулаан гарааштай',
        paymentTerms: 'Бэлэн мөнгө / Банкны зээл',
      },
      images: ['/images/hero_villa.png', '/images/hero_penthouse.png'],
      isPromoted: false,
      viewsCount: 920,
      sharesCount: 110,
    },
    {
      title: 'Баянгол дүүрэг, 3-р хороолол, 2 өрөө тохилог орон сууц',
      description: 'Баянгол дүүргийн 3-р хороололд бүх үйлчилгээндээ ойрхон, тохилог 2 өрөө орон сууц хямд зарна.',
      type: ListingType.SALE,
      category: ListingCategory.APARTMENT,
      price: 220000000,
      location: 'Улаанбаатар хот',
      district: 'Баянгол',
      latitude: 47.9120,
      longitude: 106.8700,
      areaSqm: 58,
      attributes: {
        rooms: 2,
        bedrooms: 2,
        bathrooms: 1,
        floor: 6,
        totalFloors: 9,
        yearBuilt: 2014,
        constructionType: 'Тоосгон барилга',
        condition: 'Дунд зэрэг',
        windowDirections: 'Өмнө харсан 2 цонхтой',
        balcony: '1 тагттай',
        paymentTerms: 'Бэлэн / Ипотек зээл',
      },
      images: ['/images/hero_penthouse.png', '/images/hero_tower.png'],
      isPromoted: false,
      viewsCount: 640,
      sharesCount: 45,
    },
    {
      title: 'Сонгинохайрхан дүүрэг, 2 давхар зуслангийн тохилог хаус',
      description: 'Сонгинохайрхан дүүргийн Найрамдалын аманд байрлах тэгшхэн, хашаалсан 0.07 га газартай 2 давхар зуслангийн хаус зарна.',
      type: ListingType.SALE,
      category: ListingCategory.HOUSE,
      price: 138000000,
      location: 'Улаанбаатар хот',
      district: 'Сонгинохайрхан',
      latitude: 47.9100,
      longitude: 106.7800,
      areaSqm: 120,
      attributes: {
        rooms: 4,
        bedrooms: 3,
        condition: 'Шинэ засвартай',
        paymentTerms: 'Бэлэн мөнгөөр',
      },
      images: ['/images/hero_villa.png', '/images/hero_penthouse.png', '/images/hero_tower.png'],
      isPromoted: false,
      viewsCount: 410,
      sharesCount: 22,
    },
    {
      title: 'Горхи Тэрэлж, Модон хаус түрээслүүлнэ',
      description: 'Амралт чөлөөт цагаа өнгөрүүлэхэд тохиромжтой, байгалийн үзэсгэлэнт Тэрэлжид байрлах 4 ортой тохилог модон хаус түрээслүүлнэ.',
      type: ListingType.RENT,
      category: ListingCategory.HOUSE,
      price: 350000,
      location: 'Горхи Тэрэлж',
      district: 'Налайх',
      latitude: 47.9750,
      longitude: 107.4200,
      areaSqm: 65,
      attributes: {
        capacity: 4,
        paymentTerms: 'Өдрийн түрээс',
      },
      images: ['/images/hero_villa.png', '/images/hero_penthouse.png'],
      isPromoted: false,
      viewsCount: 1450,
      sharesCount: 210,
    },


  ];


  console.log('🏠 Seeding real estate property listings...');
  for (const item of SEED_LISTINGS) {
    const existing = await listingRepo.findOne({ where: { title: item.title } });
    if (!existing) {
      const listing = listingRepo.create({
        ...item,
        user: agent,
        userId: agent.id,
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
        promotedUntil: item.isPromoted ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : undefined,
      });
      await listingRepo.save(listing);
      console.log(`  ✅ Seeded: ${item.title}`);
    }
  }

  console.log('⭐ Seeding favorites & buyer inquiries...');
  const favRepo = dataSource.getRepository(Favorite);
  const inqRepo = dataSource.getRepository(Inquiry);

  const seededListings = await listingRepo.find();
  if (seededListings.length > 0 && admin) {
    const firstListing = seededListings[0];
    const existingFav = await favRepo.findOne({ where: { userId: admin.id, listingId: firstListing.id } });
    if (!existingFav) {
      await favRepo.save(favRepo.create({ userId: admin.id, listingId: firstListing.id }));
      console.log('  ✅ Seeded favorite listing for admin user');
    }

    const existingInquiry = await inqRepo.findOne({ where: { listingId: firstListing.id } });
    if (!existingInquiry) {
      await inqRepo.save(inqRepo.create({
        name: 'Болдбаатар',
        email: 'bold@gmail.com',
        phone: '99118822',
        message: 'Сайн байна уу, энэ пентхаус орон сууцтай очоод танилцаж болох уу?',
        listingId: firstListing.id,
        userId: admin.id,
      }));
      console.log('  ✅ Seeded property inquiry message');
    }
  }

  console.log('🎉 Database seeding completed successfully!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed:', err);
  process.exit(1);
});
