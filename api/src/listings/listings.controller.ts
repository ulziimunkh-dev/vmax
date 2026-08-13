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

  @Post(':id/share')
  share(@Param('id') id: string) {
    return this.listingsService.incrementShares(id);
  }

  @Post(':id/reveal-contact')
  revealContact(@Param('id') id: string, @Body() body: any) {
    return this.listingsService.revealPhoneContact(id, body?.user, body?.ip, body?.userAgent);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/contact-audit-logs')
  getContactAuditLogs(@Param('id') id: string, @CurrentUser() user: User) {
    return this.listingsService.getContactAuditLogs(id, user);
  }


  @UseGuards(JwtAuthGuard)
  @Post()
  create(@Body() dto: any, @CurrentUser() user: User) {
    if (typeof dto.images === 'string') {
      try {
        dto.images = JSON.parse(dto.images);
      } catch {
        dto.images = [dto.images];
      }
    }
    if (typeof dto.attributes === 'string') {
      try {
        dto.attributes = JSON.parse(dto.attributes);
      } catch {}
    }
    if (dto.price) dto.price = Number(dto.price);
    if (dto.areaSqm) dto.areaSqm = Number(dto.areaSqm);
    if (dto.latitude) dto.latitude = Number(dto.latitude);
    if (dto.longitude) dto.longitude = Number(dto.longitude);

    return this.listingsService.create(dto as CreateListingDto, user);
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

  @UseGuards(JwtAuthGuard)
  @Patch(':id/promote')
  promote(
    @Param('id') id: string,
    @Body() body: { tier?: any; durationDays?: number },
    @CurrentUser() user: User
  ) {
    return this.listingsService.promote(id, user, body?.tier, body?.durationDays);
  }
}

