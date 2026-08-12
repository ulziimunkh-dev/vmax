import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { ListingType, ListingCategory, ListingStatus } from './enums/listing.enums';

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

  @Column('float')
  areaSqm: number;

  @Column('jsonb', { nullable: true })
  attributes: Record<string, any>;

  @Column('simple-array', { nullable: true })
  images: string[];

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

  @CreateDateColumn()
  createdAt: Date;

  @Column()
  expiresAt: Date;
}
