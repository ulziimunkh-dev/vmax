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

@Entity('event_phone_reveals')
export class EventPhoneReveal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventVenue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue?: EventVenue;

  @Column()
  venueId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'viewerUserId' })
  viewerUser?: User;

  @Column({ nullable: true })
  viewerUserId?: string;

  @Column({ nullable: true })
  viewerIp?: string;

  @Column({ nullable: true })
  userAgent?: string;

  @CreateDateColumn()
  createdAt: Date;
}
