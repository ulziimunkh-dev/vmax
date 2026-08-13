import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Entity('inquiries')
export class Inquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column('text')
  message: string;

  @Column()
  listingId: string;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  listing: Listing;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  user?: User;

  @CreateDateColumn()
  createdAt: Date;
}
