import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export enum ProjectStatus {
  PLANNING = 'PLANNING',
  CONSTRUCTING = 'CONSTRUCTING',
  READY_TO_MOVE = 'READY_TO_MOVE',
  COMPLETED = 'COMPLETED',
}

export interface FloorPlanItem {
  id?: string;
  title: string;                 // e.g. "2 өрөө - А загвар"
  rooms: number;                 // 1, 2, 3, 4, 5+
  areaSqm: number;               // 56.4
  pricePerSqm?: number;          // 3,800,000
  startingPrice: number;         // 214,320,000
  image2dUrl: string;            // План зураг
  image3dUrl?: string;           // 3D төлөвлөлтийн зураг
  availableCount?: number;       // Сул байгаа тоо
  description?: string;
}

export interface ProjectReelItem {
  id?: string;
  title: string;                 // e.g. "Байрны тойм", "Хотхоны танилцуулга"
  videoUrl: string;              // Uploaded MP4 or Instagram/TikTok/Shorts URL
  thumbnailUrl?: string;
  durationSeconds?: number;
}

@Entity('projects')
export class Project {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Sky Garden Residence", "Мандала Хотхон"

  @Column()
  developerName: string; // Барилгын компани / Захиалагч

  @Column({ nullable: true })
  developerLogo?: string;

  @Column({ nullable: true })
  tagline?: string; // "Хотын төвийн хамгийн ногоон төсөл"

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ProjectStatus,
    default: ProjectStatus.CONSTRUCTING,
  })
  status: ProjectStatus;

  @Column({ nullable: true })
  completionYearQuarter?: string; // "2026 Q3", "Ашиглалтад орсон"

  // 📍 Location & Address
  @Column({ default: 'Улаанбаатар' })
  city: string;

  @Column()
  district: string; // "Хан-Уул", "Баянзүрх"

  @Column({ nullable: true })
  khoroo?: string; // "11-р хороо"

  @Column({ nullable: true })
  addressDetail?: string; // "Зайсан толгойн зүүн талд"

  @Column('float', { nullable: true })
  latitude?: number;

  @Column('float', { nullable: true })
  longitude?: number;

  // 📞 Contacts & Socials
  @Column()
  salesPhone: string; // "7711-XXXX, 9911-XXXX"

  @Column({ nullable: true })
  salesEmail?: string;

  @Column({ nullable: true })
  websiteUrl?: string;

  @Column({ nullable: true })
  facebookPageUrl?: string; // https://facebook.com/skygardenresidence

  @Column({ nullable: true })
  instagramHandle?: string; // https://instagram.com/skygarden_mn

  @Column({ nullable: true })
  viberOrTelegramUrl?: string;

  // 💰 Pricing overview
  @Column('decimal', { nullable: true })
  minPricePerSqm?: number;

  @Column('decimal', { nullable: true })
  maxPricePerSqm?: number;

  @Column('decimal', { nullable: true })
  startingPrice?: number;

  // 🎁 Offers & Payment Terms
  @Column('simple-array', { nullable: true })
  paymentTerms: string[]; // ["Банкны 6% зээл", "Хувь лизинг", "Урьдчилгаа 20%", "Бартер сонсоно"]

  @Column('simple-array', { nullable: true })
  specialOffers: string[]; // ["Гал тогооны тавилга бэлгэнд", "Бэлэн төлөлтөд 10% хөнгөлөлт"]

  @Column('simple-array', { nullable: true })
  amenities: string[]; // ["24/7 харуул", "Хүүхдийн тоглоомын талбай", "Усан бассейн", "Сургууль, цэцэрлэгт ойр"]

  // 👓 3D Tour & Media
  @Column({ nullable: true })
  tour3dUrl?: string; // Matterport / Kuula / 360 viewer iframe URL

  @Column({ nullable: true })
  videoUrl?: string; // Youtube / Vimeo / Drone video / Uploaded MP4

  @Column({ nullable: true })
  videoThumbnailUrl?: string;

  @Column('jsonb', { nullable: true, default: [] })
  reels: ProjectReelItem[];

  @Column()
  coverImage: string;

  @Column('simple-array', { nullable: true })
  galleryImages: string[];

  @Column({ nullable: true })
  brochurePdfUrl?: string;

  // 🏢 Floor plans / Apartment units
  @Column('jsonb', { nullable: true, default: [] })
  floorPlans: FloorPlanItem[];

  // 📈 Stats
  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  inquiriesCount: number;

  @Column({ default: false })
  isFeatured: boolean;

  @ManyToOne(() => User, { nullable: true })
  user: User;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
