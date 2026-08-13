import { Entity, PrimaryGeneratedColumn, Column, Index } from 'typeorm';

@Entity('locations_ref')
@Index(['district', 'khoroo'], { unique: true })
export class LocationRef {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ default: 'Улаанбаатар' })
  city: string;

  @Column()
  district: string;

  @Column()
  khoroo: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ default: true })
  isActive: boolean;
}
