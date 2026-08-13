import { OnModuleInit } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LocationRef } from './location-ref.entity';
export declare class LocationsService implements OnModuleInit {
    private locationRefRepository;
    constructor(locationRefRepository: Repository<LocationRef>);
    onModuleInit(): Promise<void>;
    seedLocations(): Promise<void>;
    getDistricts(): Promise<string[]>;
    getKhoroos(district?: string): Promise<LocationRef[]>;
    findAll(): Promise<LocationRef[]>;
}
