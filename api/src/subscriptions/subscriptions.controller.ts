import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
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

  /**
   * QPay: Generate an invoice for subscription upgrade
   */
  @UseGuards(JwtAuthGuard)
  @Post('qpay/create-invoice')
  createQPayInvoice(
    @Body() body: { tier: SubscriptionTier; durationMonths?: number },
    @CurrentUser() user: User,
  ) {
    return this.subscriptionsService.createQPayInvoice(
      user,
      body.tier,
      body.durationMonths || 1,
    );
  }

  /**
   * QPay: Check if invoice has been paid
   */
  @UseGuards(JwtAuthGuard)
  @Get('qpay/check/:invoiceId')
  checkQPayPayment(
    @Param('invoiceId') invoiceId: string,
    @CurrentUser() user: User,
  ) {
    return this.subscriptionsService.checkQPayPayment(invoiceId, user);
  }

  /**
   * QPay: Sandbox / Test mode simulated payment approval
   */
  @UseGuards(JwtAuthGuard)
  @Post('qpay/simulate/:invoiceId')
  simulateQPayPayment(
    @Param('invoiceId') invoiceId: string,
    @CurrentUser() user: User,
  ) {
    return this.subscriptionsService.simulateQPayPayment(invoiceId, user);
  }

  /**
   * QPay Webhook Callback endpoint
   */
  @Post('qpay/callback')
  async handleQPayCallback(@Body() body: any) {
    const invoiceId = body?.invoice_id || body?.object_id;
    if (invoiceId) {
      await this.subscriptionsService.checkQPayPayment(invoiceId);
    }
    return { success: true };
  }
}
