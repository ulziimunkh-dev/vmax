import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FurnitureService } from './furniture.service';
import {
  CreateFurnitureMakerDto,
  UpdateFurnitureMakerDto,
  CreatePortfolioItemDto,
  QueryFurnitureDto,
} from './dto/furniture.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('furniture')
export class FurnitureController {
  constructor(private readonly furnitureService: FurnitureService) {}

  @Get()
  async findAll(@Query() query: QueryFurnitureDto) {
    return this.furnitureService.findAll(query);
  }

  @Get('tips')
  async getAllTips() {
    return this.furnitureService.getAllTips();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.furnitureService.findOne(id);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateFurnitureMakerDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.furnitureService.create(createDto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdateFurnitureMakerDto) {
    return this.furnitureService.update(id, updateDto);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/portfolio')
  async addPortfolioItem(
    @Param('id') id: string,
    @Body() itemDto: CreatePortfolioItemDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.furnitureService.addPortfolioItem(id, itemDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.furnitureService.delete(id);
    return { success: true, message: 'Furniture maker deleted' };
  }
}
