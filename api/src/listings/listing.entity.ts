import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { ListingType, ListingCategory, ListingStatus, PromotionTier } from './enums/listing.enums';

export const ColumnNumericTransformer = {
  to: (data: number | null): number | null => data,
  from: (data: string | null): number | null => (data ? parseFloat(data) : null),
};

@Entity('listings')
export class Listing {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: ListingType,
  })
  type: ListingType;

  @Column({
    type: 'enum',
    enum: ListingCategory,
  })
  category: ListingCategory;

  @Column('decimal', {
    transformer: ColumnNumericTransformer,
  })
  price: number;

  @Column()
  location: string;

  @Column()
  district: string;

  @Column({ nullable: true })
  khoroo: string;

  @Column('float', { nullable: true })
  latitude: number;

  @Column('float', { nullable: true })
  longitude: number;

  @Column('float')
  areaSqm: number;

  @Column('jsonb', { nullable: true })
  attributes: Record<string, any>;

  @Column('simple-array', { nullable: true })
  images: string[];

  @Column({ nullable: true })
  videoUrl?: string;

  @Column({ nullable: true })
  videoThumbnailUrl?: string;

  @Column({ default: false })
  hasVideo: boolean;

  @Column({ nullable: true })
  contactPhone?: string;

  @Column({
    type: 'enum',
    enum: ListingStatus,
    default: ListingStatus.ACTIVE,
  })
  status: ListingStatus;

  @ManyToOne(() => User, user => user.listings)
  user: User;

  @Column()
  userId: string;

  @Column({ default: 0 })
  viewsCount: number;

  @Column({ default: 0 })
  sharesCount: number;

  @Column({ default: 0 })
  phoneRevealsCount: number;

  @Column({ default: false })
  isPromoted: boolean;


  @Column({
    type: 'enum',
    enum: PromotionTier,
    default: PromotionTier.STANDARD,
  })
  promotionTier: PromotionTier;

  @Column({ nullable: true })
  promotedUntil: Date;

  @Column('decimal', {
    nullable: true,
    transformer: ColumnNumericTransformer,
  })
  originalPrice: number | null;

  @Column({ type: 'timestamptz', nullable: true })
  saleEndsAt: Date | null;

  @Column({ default: false })
  isOnSale: boolean;


  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
