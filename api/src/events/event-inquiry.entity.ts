import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EventVenue } from './event-venue.entity';
import { User } from '../users/user.entity';

@Entity('event_inquiries')
export class EventInquiry {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventVenue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue?: EventVenue;

  @Column()
  venueId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column({ nullable: true })
  userId?: string;

  @Column()
  contactName: string;

  @Column()
  contactPhone: string;

  @Column({ default: 'NEW_YEAR' })
  eventType: string;

  @Column()
  eventDate: string;

  @Column({ type: 'int', default: 50 })
  guestCount: number;

  @Column('text', { nullable: true })
  message?: string;

  @Column({ nullable: true })
  packageName?: string;

  @Column({ type: 'int', nullable: true })
  quotedPrice?: number;

  @Column('text', { nullable: true })
  quoteMessage?: string;

  @Column({ type: 'timestamp', nullable: true })
  respondedAt?: Date;

  @Column({ default: 'PENDING' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}
