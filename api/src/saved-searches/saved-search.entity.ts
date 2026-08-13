import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('saved_searches')
export class SavedSearch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ nullable: true })
  email?: string;

  @Column({ default: 'Хайлтын мэдэгдэл' })
  title: string;

  @Column('jsonb')
  filters: {
    query?: string;
    type?: string;
    category?: string;
    district?: string;
    khoroo?: string;
    priceMin?: number;
    priceMax?: number;
    areaMin?: number;
    areaMax?: number;
    bedrooms?: number;
    bathrooms?: number;
    yearBuiltMin?: number;
    constructionType?: string;
  };


  @Column({ default: true })
  isEmailAlert: boolean;

  @Column({ default: false })
  isTriggered: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}

