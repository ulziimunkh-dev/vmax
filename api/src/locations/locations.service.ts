import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LocationRef } from './location-ref.entity';

@Injectable()
export class LocationsService implements OnModuleInit {
  constructor(
    @InjectRepository(LocationRef)
    private locationRefRepository: Repository<LocationRef>,
  ) {}

  async onModuleInit() {
    await this.seedLocations();
  }

  async seedLocations() {
    const count = await this.locationRefRepository.count();
    if (count > 0) return;

    const districtKhoroosMap: Record<string, number> = {
      'Хан-Уул': 25,
      'Баянзүрх': 28,
      'Сүхбаатар': 20,
      'Баянгол': 25,
      'Сонгинохайрхан': 43,
      'Чингэлтэй': 24,
      'Багануур': 5,
      'Багахангай': 2,
      'Налайх': 8,
    };

    const locationEntities: Partial<LocationRef>[] = [];

    for (const [district, khorooCount] of Object.entries(districtKhoroosMap)) {
      for (let i = 1; i <= khorooCount; i++) {
        locationEntities.push({
          city: 'Улаанбаатар',
          district,
          khoroo: `${i}-р хороо`,
          code: `UB-${district.slice(0, 3).toUpperCase()}-${i}`,
          isActive: true,
        });
      }
    }

    await this.locationRefRepository.save(locationEntities);
    console.log(`[LocationsRef] Successfully seeded ${locationEntities.length} official Ulaanbaatar locations into reference table.`);
  }

  async getDistricts(): Promise<string[]> {
    const locations = await this.locationRefRepository
      .createQueryBuilder('loc')
      .select('DISTINCT loc.district', 'district')
      .where('loc.isActive = true')
      .getRawMany();

    return locations.map(l => l.district);
  }

  async getKhoroos(district?: string): Promise<LocationRef[]> {
    const query = this.locationRefRepository.createQueryBuilder('loc').where('loc.isActive = true');
    if (district) {
      query.andWhere('loc.district ILIKE :district', { district: `%${district}%` });
    }
    return query.orderBy('loc.district', 'ASC').addOrderBy('loc.khoroo', 'ASC').getMany();
  }

  async findAll(): Promise<LocationRef[]> {
    return this.locationRefRepository.find({ where: { isActive: true }, order: { district: 'ASC', khoroo: 'ASC' } });
  }
}
