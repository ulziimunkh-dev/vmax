import { LocationsService } from './locations.service';
export declare class LocationsController {
    private readonly locationsService;
    constructor(locationsService: LocationsService);
    getDistricts(): Promise<string[]>;
    getKhoroos(district?: string): Promise<import("./location-ref.entity").LocationRef[]>;
    findAll(): Promise<import("./location-ref.entity").LocationRef[]>;
}
