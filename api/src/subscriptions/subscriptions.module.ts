import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SubscriptionsController } from './subscriptions.controller';
import { SubscriptionsService } from './subscriptions.service';
import { QPayService } from './qpay.service';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { SubscriptionInvoice } from './entities/subscription-invoice.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Listing, SubscriptionInvoice])],
  controllers: [SubscriptionsController],
  providers: [SubscriptionsService, QPayService],
  exports: [SubscriptionsService, QPayService],
})
export class SubscriptionsModule {}
