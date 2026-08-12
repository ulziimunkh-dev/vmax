import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Delete } from '@nestjs/common';
import { ListingsService } from './listings.service';
import { CreateListingDto } from './dto/create-listing.dto';
import { QueryListingDto } from './dto/query-listing.dto';
import { UpdateListingDto } from './dto/update-listing.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';

@Controller('listings')
export class ListingsController {
  constructor(private readonly listingsService: ListingsService) {}

  @Get()
  findAll(@Query() queryListingDto: QueryListingDto) {
    return this.listingsService.findAll(queryListingDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  findMyListings(@CurrentUser() user: User) {
    return this.listingsService.findMyListings(user);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.listingsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() createListingDto: CreateListingDto, @CurrentUser() user: User) {
    return this.listingsService.create(createListingDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateListingDto: UpdateListingDto, @CurrentUser() user: User) {
    return this.listingsService.update(id, updateListingDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.remove(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/close')
  close(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.close(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/renew')
  renew(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.renew(id, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id/publish')
  publish(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.publish(id, user);
  }
}
