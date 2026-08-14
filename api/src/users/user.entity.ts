import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany } from 'typeorm';
import { AuthProvider } from '../common/enums/auth-provider.enum';
import { SubscriptionTier } from './enums/user.enums';
import { Listing } from '../listings/listing.entity';


@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ nullable: true })
  password?: string;

  @Column({ nullable: true })
  phone?: string;

  @Column({ nullable: true })
  avatarUrl?: string;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    default: AuthProvider.LOCAL,
  })
  authProvider: AuthProvider;

  @Column({ nullable: true })
  providerId?: string;

  @OneToMany(() => Listing, listing => listing.user)
  listings: Listing[];

  @Column({
    type: 'enum',
    enum: SubscriptionTier,
    default: SubscriptionTier.FREE,
  })
  subscriptionTier: SubscriptionTier;

  @Column({ nullable: true })
  subscriptionExpiresAt?: Date;

  @Column({ default: false })
  isEmailVerified: boolean;

  @Column({ default: false })
  isPhoneVerified: boolean;

  @Column({ default: false })
  isVerifiedAgent: boolean;

  @Column({ nullable: true })
  agencyName?: string;

  @Column({ nullable: true })
  agentLicenseNo?: string;

  @Column({ default: 'NONE' })
  agentVerificationStatus: string;

  @CreateDateColumn()
  createdAt: Date;
}

