import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { ListingType, ListingCategory, ListingStatus, PromotionTier } from './enums/listing.enums';

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

  @Column('decimal')
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


  @CreateDateColumn({ type: 'timestamptz' })
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
