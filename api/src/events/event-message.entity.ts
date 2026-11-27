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

@Entity('event_messages')
export class EventMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => EventVenue, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'venueId' })
  venue?: EventVenue;

  @Column()
  venueId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'customerUserId' })
  customerUser?: User;

  @Column()
  customerUserId: string;

  @Column({ default: 'CUSTOMER' })
  senderRole: 'CUSTOMER' | 'OWNER';

  @Column()
  senderName: string;

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
