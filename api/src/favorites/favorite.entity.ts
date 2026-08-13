import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, Unique } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Entity('favorites')
@Unique(['userId', 'listingId'])
export class Favorite {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column()
  listingId: string;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  listing: Listing;

  @CreateDateColumn()
  createdAt: Date;
}
