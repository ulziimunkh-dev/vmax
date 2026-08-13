import { Controller, Get, Query } from '@nestjs/common';
import { LocationsService } from './locations.service';

@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('districts')
  getDistricts() {
    return this.locationsService.getDistricts();
  }

  @Get('khoroos')
  getKhoroos(@Query('district') district?: string) {
    return this.locationsService.getKhoroos(district);
  }

  @Get()
  findAll() {
    return this.locationsService.findAll();
  }
}
