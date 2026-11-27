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
import { EventsService } from './events.service';
import {
  CreateEventVenueDto,
  UpdateEventVenueDto,
  CreateEventPackageDto,
  CreateEventInquiryDto,
  BulkEventInquiryDto,
  UpdateEventInquiryDto,
  CreateEventOrganizationDto,
  UpdateEventOrganizationDto,
  QueryEventsDto,
} from './dto/events.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../common/guards/optional-jwt-auth.guard';

@Controller('events')
export class EventsController {
  constructor(private readonly eventsService: EventsService) {}

  @Get()
  async findAll(@Query() query: QueryEventsDto) {
    return this.eventsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('org/my')
  async getMyOrg(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getMyOrganization(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Post('org')
  async createOrg(@Body() dto: CreateEventOrganizationDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.createOrganization(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('org/:id')
  async updateOrg(
    @Param('id') id: string,
    @Body() dto: UpdateEventOrganizationDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.updateOrganization(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my')
  async getMy(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.findByUser(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/inquiries')
  async getMyInquiries(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getInquiriesForOwner(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/phone-reveals')
  async getMyPhoneReveals(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getMyPhoneRevealLogs(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get('my/chats')
  async getMyChats(@Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getOwnerChatThreads(userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/messages')
  async getMessages(
    @Param('id') id: string,
    @Query('customerUserId') customerUserId: string | undefined,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getVenueMessages(id, userId, customerUserId);
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/messages')
  async sendMessage(
    @Param('id') id: string,
    @Body() body: { content: string; customerUserId?: string },
    @Req() req: any,
  ) {
    return this.eventsService.sendVenueMessage(
      id,
      req.user,
      body.content,
      body.customerUserId,
    );
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/reveal-contact')
  async revealContact(@Param('id') id: string, @Req() req: any) {
    const ip =
      req?.headers?.['x-forwarded-for']?.split(',')[0] ||
      req?.ip ||
      'unknown';
    const ua = req?.headers?.['user-agent'];
    return this.eventsService.revealPhoneContact(id, req.user, String(ip), ua);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post('bulk-inquire')
  async bulkInquire(@Body() dto: BulkEventInquiryDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.createBulkInquiries(dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch('inquiries/:inquiryId')
  async updateInquiry(
    @Param('inquiryId') inquiryId: string,
    @Body() dto: UpdateEventInquiryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.updateInquiryStatus(inquiryId, dto, userId);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.eventsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(@Body() createDto: CreateEventVenueDto, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.create(createDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEventVenueDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.update(id, updateDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async delete(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    await this.eventsService.delete(id, userId);
    return { success: true, message: 'Event venue deleted' };
  }

  @UseGuards(JwtAuthGuard)
  @Post(':id/packages')
  async addPackage(
    @Param('id') id: string,
    @Body() pkgDto: CreateEventPackageDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.addPackage(id, pkgDto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id/packages/:packageId')
  async removePackage(
    @Param('id') id: string,
    @Param('packageId') packageId: string,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.removePackage(id, packageId, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/inquire')
  async inquireAlias(
    @Param('id') id: string,
    @Body() dto: CreateEventInquiryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.createInquiry(id, dto, userId);
  }

  @UseGuards(OptionalJwtAuthGuard)
  @Post(':id/inquiries')
  async createInquiry(
    @Param('id') id: string,
    @Body() dto: CreateEventInquiryDto,
    @Req() req: any,
  ) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.createInquiry(id, dto, userId);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/inquiries')
  async getInquiries(@Param('id') id: string, @Req() req: any) {
    const userId = req.user?.id || req.user?.sub;
    return this.eventsService.getInquiriesForVenue(id, userId);
  }
}
