import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { Listing } from './listing.entity';

@Entity('listing_contact_logs')
export class ListingContactLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  listingId: string;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  listing: Listing;

  @Column({ nullable: true })
  viewerUserId?: string;

  @Column({ nullable: true })
  viewerIp?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
