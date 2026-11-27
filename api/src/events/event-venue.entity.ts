import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';
import { EventOrganization } from './event-organization.entity';

export interface EventPackageItem {
  id: string;
  title: string;           // e.g. "Шинэ жилийн Алтан багц"
  eventType: string;       // "NEW_YEAR" | "WEDDING" | "BIRTHDAY" | "CORPORATE" | "ANNIVERSARY" | "GRADUATION" | "CONFERENCE"
  pricePerPerson?: number; // e.g. 165000
  minGuests?: number;
  maxGuests?: number;
  description?: string;
  includes: string[];      // e.g. ["3 төрлийн хоол", "Угталтын оргилуун дарс", "LED дэлгэц & Тайз", "Хөтлөгч & DJ"]
  imageUrl?: string;
}

@Entity('event_venues')
export class EventVenue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tagline?: string;

  @Column('text')
  description: string;

  // "EVENT_HALL" | "RESTAURANT" | "HOTEL_BALLROOM" | "LOUNGE_BAR" | "OUTDOOR_RESORT" | "CONFERENCE_HALL"
  @Column({ default: 'EVENT_HALL' })
  venueType: string;

  // Supported occasions: NEW_YEAR, WEDDING, BIRTHDAY, CORPORATE, ANNIVERSARY, GRADUATION, CONFERENCE
  @Column('simple-array', { default: 'NEW_YEAR,WEDDING,BIRTHDAY,CORPORATE' })
  eventTypes: string[];

  @Column({ nullable: true })
  logoUrl?: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column('simple-array', { nullable: true })
  images?: string[];

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ default: 20 })
  minCapacity: number;

  @Column({ default: 250 })
  maxCapacity: number;

  @Column({ type: 'int', nullable: true })
  pricePerPerson?: number;

  @Column({ type: 'int', nullable: true })
  rentalPrice?: number;

  @Column('simple-array', { nullable: true })
  amenities?: string[];

  @Column('simple-array', { nullable: true })
  bookedDates?: string[];

  @Column({ default: 'Улаанбаатар' })
  city: string;

  @Column({ default: 'Сүхбаатар' })
  district: string;

  @Column({ nullable: true })
  addressDetail?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  secondaryPhone?: string;

  @Column({ nullable: true })
  facebookUrl?: string;

  @Column({ nullable: true })
  instagramUrl?: string;

  @Column({ nullable: true })
  websiteUrl?: string;

  @Column('float', { default: 4.9 })
  rating: number;

  @Column({ default: 0 })
  reviewsCount: number;

  @Column({ default: 0 })
  views: number;

  @Column({ default: 0 })
  phoneRevealsCount: number;

  @Column({ default: true })
  isVerified: boolean;

  @Column({ default: false })
  isFeatured: boolean;

  @Column('jsonb', { default: [] })
  packages: EventPackageItem[];

  @ManyToOne(() => EventOrganization, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'organizationId' })
  organization?: EventOrganization;

  @Column({ nullable: true })
  organizationId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
