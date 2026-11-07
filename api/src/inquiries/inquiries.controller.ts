import { Controller, Post, Body, Get, Param, UseGuards } from '@nestjs/common';
import { InquiriesService } from './inquiries.service';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';

@Controller('inquiries')
export class InquiriesController {
  constructor(private readonly inquiriesService: InquiriesService) {}

  @Post()
  create(@Body() createInquiryDto: CreateInquiryDto, @CurrentUser() user?: any) {
    return this.inquiriesService.create(createInquiryDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Get('listing/:listingId')
  findByListing(@Param('listingId') listingId: string) {
    return this.inquiriesService.findByListing(listingId);
  }
}
