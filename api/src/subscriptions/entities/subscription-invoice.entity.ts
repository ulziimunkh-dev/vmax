import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from '../../users/user.entity';
import { SubscriptionTier } from '../../users/enums/user.enums';

export enum InvoiceStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  EXPIRED = 'EXPIRED',
  FAILED = 'FAILED',
}

@Entity('subscription_invoices')
export class SubscriptionInvoice {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  userId: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Index({ unique: true })
  @Column()
  invoiceId: string;

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
  })
  tier: SubscriptionTier;

  @Column({ default: 1 })
  durationMonths: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  amount: number;

  @Column({
    type: 'enum',
    enum: InvoiceStatus,
    default: InvoiceStatus.PENDING,
  })
  status: InvoiceStatus;

  @Column({ nullable: true })
  qpayPaymentId?: string;

  @Column({ type: 'text', nullable: true })
  qrText?: string;

  @Column({ type: 'text', nullable: true })
  qrImage?: string;

  @Column({ type: 'jsonb', nullable: true })
  bankUrls?: Array<{
    name: string;
    description: string;
    logo: string;
    link: string;
  }>;

  @Column({ nullable: true })
  paidAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
