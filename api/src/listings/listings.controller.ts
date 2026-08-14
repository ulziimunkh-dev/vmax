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
    const payload = dto || {};
    if (typeof payload.images === 'string') {
      try { payload.images = JSON.parse(payload.images); } catch { payload.images = [payload.images]; }
    }
    if (typeof payload.attributes === 'string') {
      try { payload.attributes = JSON.parse(payload.attributes); } catch {}
    }
    if (payload.price !== undefined) payload.price = Number(payload.price);
    if (payload.areaSqm !== undefined) payload.areaSqm = Number(payload.areaSqm);
    if (payload.latitude !== undefined) payload.latitude = Number(payload.latitude);
    if (payload.longitude !== undefined) payload.longitude = Number(payload.longitude);
    return this.listingsService.create(payload as CreateListingDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: any, @CurrentUser() user: User) {
    const payload = dto || {};
    if (typeof payload.images === 'string') {
      try { payload.images = JSON.parse(payload.images); } catch { payload.images = [payload.images]; }
    }
    if (typeof payload.attributes === 'string') {
      try { payload.attributes = JSON.parse(payload.attributes); } catch {}
    }
    return this.listingsService.update(id, payload as UpdateListingDto, user);
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

