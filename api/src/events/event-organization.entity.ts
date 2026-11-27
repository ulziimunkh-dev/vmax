import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../users/user.entity';

@Entity('event_organizations')
export class EventOrganization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  tagline?: string;

  @Column('text', { nullable: true })
  description?: string;

  @Column({ nullable: true })
  logoUrl?: string;

  @Column()
  phone: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: 'Улаанбаатар' })
  city: string;

  @Column({ default: 'Сүхбаатар' })
  district: string;

  @Column({ nullable: true })
  addressDetail?: string;

  @Column({ nullable: true })
  websiteUrl?: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  userId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
