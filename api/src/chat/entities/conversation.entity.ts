import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { Listing } from '../../listings/listing.entity';
import { ChatMessage } from './chat-message.entity';

@Entity('conversations')
export class Conversation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  listingId: string;

  @ManyToOne(() => Listing, { onDelete: 'CASCADE' })
  listing: Listing;

  @Column()
  renterId: string; // The user initiating the chat / stay booking inquiry

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  renter: User;

  @Column()
  hostId: string; // The property owner / host

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  host: User;

  @Column({ nullable: true })
  lastMessage?: string;

  @Column({ nullable: true })
  lastMessageSenderId?: string;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  lastMessageAt: Date;

  @Column({ default: 0 })
  renterUnreadCount: number;

  @Column({ default: 0 })
  hostUnreadCount: number;

  @OneToMany(() => ChatMessage, (msg) => msg.conversation)
  messages: ChatMessage[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
