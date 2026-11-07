import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FurnitureMaker } from './furniture.entity';
import { FurnitureService } from './furniture.service';
import { FurnitureController } from './furniture.controller';

@Module({
  imports: [TypeOrmModule.forFeature([FurnitureMaker])],
  controllers: [FurnitureController],
  providers: [FurnitureService],
  exports: [FurnitureService],
})
export class FurnitureModule implements OnModuleInit {
  constructor(private readonly furnitureService: FurnitureService) {}

  async onModuleInit() {
    try {
      await this.furnitureService.seedDemoFurnitureIfEmpty();
    } catch (e) {
      console.warn('Furniture demo seed error:', e);
    }
  }
}
