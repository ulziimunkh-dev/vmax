import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';

export interface FurniturePortfolioItem {
  id: string;
  title: string;              // e.g. "Ривер Гарден хотхоны орчин үеийн гал тогоо"
  category: string;           // "KITCHEN" | "WARDROBE" | "LIVING_ROOM" | "KIDS" | "OFFICE" | "SOLID_WOOD" | "CUSTOM"
  description?: string;
  images: string[];           // Photos of completed work
  videoUrl?: string;          // Walkthrough reel video
  thumbnailUrl?: string;
  materials?: string;         // e.g. "E0 Акрил хавтан, Blum тоноглол, Кварц чулуун тавцан"
  durationDays?: number;      // e.g. 14 хоногт гүйцэтгэсэн
  location?: string;          // e.g. "Хан-Уул дүүрэг, Ривер гарден"
  year?: string;              // e.g. "2026"
  createdAt?: string;
}

export interface FurnitureArticleItem {
  id: string;
  title: string;
  summary: string;
  content: string;
  category?: string;
  imageUrl?: string;
  readMinutes?: number;
  publishedAt?: string;
}

@Entity('furniture_makers')
export class FurnitureMaker {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Мөнх Мод Урлан", "Smart Wood Interior Studio"

  @Column({ nullable: true })
  tagline?: string; // "Орчин үеийн захиалгат гал тогоо, шкаф хийц"

  @Column('text')
  description: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  // Categories of specialization
  @Column('simple-array', { default: 'KITCHEN,WARDROBE,CUSTOM' })
  categories: string[];

  @Column({ default: 5 })
  experienceYears: number; // Туршлага (жилээр)

  @Column({ default: 24 })
  warrantyMonths: number; // Баталгаат хугацаа (сараар, жишээ нь 24 сар)

  // 📍 Location & Address
  @Column({ default: 'Улаанбаатар' })
  city: string;

  @Column({ default: 'Хан-Уул' })
  district: string;

  @Column({ nullable: true })
  addressDetail?: string; // "Мишээл Экспо, Тавилгын их дэлгүүр 2 давхарт"

  // 📞 Contacts & Social links (Direct contact)
  @Column()
  phone: string; // "8911-XXXX"

  @Column({ nullable: true })
  secondaryPhone?: string; // "9901-XXXX"

  @Column({ nullable: true })
  facebookUrl?: string; // "https://facebook.com/..."

  @Column({ nullable: true })
  instagramUrl?: string; // "https://instagram.com/..."

  @Column({ nullable: true })
  websiteUrl?: string;

  // Materials & Features
  @Column('simple-array', { nullable: true })
  materialsUsed?: string[]; // ["E0 Хавтан", "E1 Хавтан", "Blum тоноглол", "Акрил", "Цэвэр мод"]

  @Column('float', { default: 4.9 })
  rating: number;

  @Column({ default: 12 })
  reviewsCount: number;

  @Column({ default: true })
  isVerified: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  // 📸 Completed Works & Walkthrough Reels
  @Column('jsonb', { default: [] })
  portfolio: FurniturePortfolioItem[];

  // 💡 Advice, Guides & Tips
  @Column('jsonb', { default: [] })
  articles: FurnitureArticleItem[];

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
