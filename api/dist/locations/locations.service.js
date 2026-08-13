"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const location_ref_entity_1 = require("./location-ref.entity");
let LocationsService = class LocationsService {
    locationRefRepository;
    constructor(locationRefRepository) {
        this.locationRefRepository = locationRefRepository;
    }
    async onModuleInit() {
        await this.seedLocations();
    }
    async seedLocations() {
        const count = await this.locationRefRepository.count();
        if (count > 0)
            return;
        const districtKhoroosMap = {
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
        const locationEntities = [];
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
    async getDistricts() {
        const locations = await this.locationRefRepository
            .createQueryBuilder('loc')
            .select('DISTINCT loc.district', 'district')
            .where('loc.isActive = true')
            .getRawMany();
        return locations.map(l => l.district);
    }
    async getKhoroos(district) {
        const query = this.locationRefRepository.createQueryBuilder('loc').where('loc.isActive = true');
        if (district) {
            query.andWhere('loc.district ILIKE :district', { district: `%${district}%` });
        }
        return query.orderBy('loc.district', 'ASC').addOrderBy('loc.khoroo', 'ASC').getMany();
    }
    async findAll() {
        return this.locationRefRepository.find({ where: { isActive: true }, order: { district: 'ASC', khoroo: 'ASC' } });
    }
};
exports.LocationsService = LocationsService;
exports.LocationsService = LocationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(location_ref_entity_1.LocationRef)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], LocationsService);
//# sourceMappingURL=locations.service.js.map