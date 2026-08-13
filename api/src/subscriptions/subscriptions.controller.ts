import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { SubscriptionsService } from './subscriptions.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/user.entity';
import { SubscriptionTier } from '../users/enums/user.enums';

@Controller('subscriptions')
export class SubscriptionsController {
  constructor(private readonly subscriptionsService: SubscriptionsService) {}

  @Get('plans')
  getPlans() {
    return this.subscriptionsService.getPlans();
  }

  @UseGuards(JwtAuthGuard)
  @Get('status')
  getStatus(@CurrentUser() user: User) {
    return this.subscriptionsService.getStatus(user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('upgrade')
  upgrade(@Body() body: { tier: SubscriptionTier; durationMonths?: number }, @CurrentUser() user: User) {
    return this.subscriptionsService.upgrade(user, body.tier, body.durationMonths || 1);
  }
}
