import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { ListingStatus } from '../listings/enums/listing.enums';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '../users/enums/user.enums';
import { SubscriptionInvoice, InvoiceStatus } from './entities/subscription-invoice.entity';
import { QPayService } from './qpay.service';

export interface SubscriptionPlan {
  id: SubscriptionTier;
  name: string;
  priceMnt: number;
  period: string;
  listingLimit: number;
  features: string[];
  recommended?: boolean;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    @InjectRepository(SubscriptionInvoice)
    private invoicesRepository: Repository<SubscriptionInvoice>,
    private readonly qpayService: QPayService,
  ) {}

  getPlans(): SubscriptionPlan[] {
    return [
      {
        id: SubscriptionTier.FREE,
        name: 'Энгийн (Free)',
        priceMnt: 0,
        period: 'Төлбөргүй',
        listingLimit: SUBSCRIPTION_LIMITS[SubscriptionTier.FREE],
        features: [
          '3 хүртэлх идэвхтэй зарын лимит',
          'Стандарт хайлтын илэрц',
          'Шууд чат & утасны холбоос',
        ],
      },
      {
        id: SubscriptionTier.PRO_AGENT,
        name: 'Pro Agent',
        priceMnt: 49000,
        period: 'сар бүр',
        listingLimit: SUBSCRIPTION_LIMITS[SubscriptionTier.PRO_AGENT],
        recommended: true,
        features: [
          '30 хүртэлх идэвхтэй зарын лимит',
          'Баталгаажсан Риэлтор (Verified Agent) тэмдэг',
          'Агентын бие даасан профайл хуудас',
          'Зарын үзэлт & хандалтын аналитик',
          'Тэргүүн дараалалд эрэмбэлэгдэх боломж',
        ],
      },
      {
        id: SubscriptionTier.AGENCY,
        name: 'Agency (Үл хөдлөхийн агентлаг)',
        priceMnt: 199000,
        period: 'сар бүр',
        listingLimit: SUBSCRIPTION_LIMITS[SubscriptionTier.AGENCY],
        features: [
          'Хязгааргүй идэвхтэй зарын лимит',
          'Агентлагийн нэгдсэн лого & профайл',
          'Олон агентын дэд хаяг удирдлага',
          'Шууд VIP зарын хөнгөлөлт',
          '24/7 Тэргүүлэх дэмжлэг & зөвлөгөө',
        ],
      },
    ];
  }

  async getStatus(user: User) {
    const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!freshUser) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    const activeListingsCount = await this.listingsRepository.count({
      where: { userId: user.id, status: ListingStatus.ACTIVE },
    });

    const currentTier = freshUser.subscriptionTier || SubscriptionTier.FREE;
    const limit = SUBSCRIPTION_LIMITS[currentTier] || 3;

    return {
      tier: currentTier,
      activeListingsCount,
      listingLimit: limit,
      subscriptionExpiresAt: freshUser.subscriptionExpiresAt,
      isVerifiedAgent: freshUser.isVerifiedAgent,
    };
  }

  calculateAmount(tier: SubscriptionTier, durationMonths: number = 1): number {
    const plans = this.getPlans();
    const plan = plans.find((p) => p.id === tier);
    if (!plan || plan.priceMnt === 0) return 0;

    let discount = 0;
    if (durationMonths >= 12) {
      discount = 0.15; // 15% discount for 1 year
    } else if (durationMonths >= 6) {
      discount = 0.10; // 10% discount for 6 months
    } else if (durationMonths >= 3) {
      discount = 0.05; // 5% discount for 3 months
    }

    const totalBeforeDiscount = plan.priceMnt * durationMonths;
    return Math.round(totalBeforeDiscount * (1 - discount));
  }

  /**
   * Create QPay invoice for subscription upgrade
   */
  async createQPayInvoice(
    user: User,
    tier: SubscriptionTier,
    durationMonths: number = 1,
  ) {
    if (tier === SubscriptionTier.FREE) {
      return this.upgrade(user, SubscriptionTier.FREE, durationMonths);
    }

    const amount = this.calculateAmount(tier, durationMonths);
    if (amount <= 0) {
      throw new BadRequestException('Буруу төлбөрийн дүн.');
    }

    // Generate local DB invoice record
    const invoiceRecord = this.invoicesRepository.create({
      userId: user.id,
      invoiceId: `TEMP-${Date.now()}`,
      tier,
      durationMonths,
      amount,
      status: InvoiceStatus.PENDING,
    });
    await this.invoicesRepository.save(invoiceRecord);

    const description = `VMAX Real Estate: ${tier} эрх (${durationMonths} сар)`;

    // Call QPay service
    const qpayResult = await this.qpayService.createInvoice({
      senderInvoiceNo: invoiceRecord.id,
      receiverCode: user.id,
      description,
      amount,
    });

    // Update invoice record with official or sandbox QPay values
    invoiceRecord.invoiceId = qpayResult.invoiceId;
    invoiceRecord.qrText = qpayResult.qrText;
    invoiceRecord.qrImage = qpayResult.qrImage;
    invoiceRecord.bankUrls = qpayResult.urls;
    await this.invoicesRepository.save(invoiceRecord);

    return {
      success: true,
      invoiceId: invoiceRecord.invoiceId,
      amount: invoiceRecord.amount,
      tier: invoiceRecord.tier,
      durationMonths: invoiceRecord.durationMonths,
      qrText: invoiceRecord.qrText,
      qrImage: invoiceRecord.qrImage,
      urls: invoiceRecord.bankUrls,
      isMock: qpayResult.isMock,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
    };
  }

  /**
   * Check QPay payment status and apply subscription when paid
   */
  async checkQPayPayment(invoiceId: string, user?: User) {
    const invoice = await this.invoicesRepository.findOne({
      where: { invoiceId },
      relations: { user: true },
    });

    if (!invoice) {
      throw new NotFoundException('Нэхэмжлэх олдсонгүй.');
    }

    // If already marked as paid
    if (invoice.status === InvoiceStatus.PAID) {
      return {
        success: true,
        isPaid: true,
        message: 'Төлбөр төлөгдсөн байна.',
        tier: invoice.tier,
        paidAt: invoice.paidAt,
      };
    }

    // Check with QPay API
    const checkResult = await this.qpayService.checkPayment(invoice.invoiceId);
    if (checkResult.isPaid) {
      await this.applyPaymentSuccess(invoice, checkResult.paymentId);
      return {
        success: true,
        isPaid: true,
        message: 'Төлбөр амжилттай баталгаажиж, эрх нээгдлээ!',
        tier: invoice.tier,
        paidAt: invoice.paidAt,
      };
    }

    return {
      success: true,
      isPaid: false,
      message: 'Төлбөр хараахан хийгдээгүй байна.',
    };
  }

  /**
   * Test / Sandbox payment simulation (allows testing QPay in dev/demo)
   */
  async simulateQPayPayment(invoiceId: string, user: User) {
    const invoice = await this.invoicesRepository.findOne({
      where: { invoiceId },
      relations: { user: true },
    });

    if (!invoice) {
      throw new NotFoundException('Нэхэмжлэх олдсонгүй.');
    }

    if (invoice.status === InvoiceStatus.PAID) {
      return {
        success: true,
        isPaid: true,
        message: 'Төлбөр өмнө нь төлөгдсөн байна.',
      };
    }

    await this.applyPaymentSuccess(invoice, `SIM-${Date.now()}`);

    return {
      success: true,
      isPaid: true,
      message: 'Тест горим: Төлбөр амжилттай батлагдаж эрх шинэчлэгдлээ!',
      tier: invoice.tier,
      paidAt: invoice.paidAt,
    };
  }

  private async applyPaymentSuccess(invoice: SubscriptionInvoice, paymentId?: string) {
    invoice.status = InvoiceStatus.PAID;
    invoice.paidAt = new Date();
    if (paymentId) {
      invoice.qpayPaymentId = paymentId;
    }
    await this.invoicesRepository.save(invoice);

    // Apply upgrade to user
    const targetUser = await this.usersRepository.findOne({ where: { id: invoice.userId } });
    if (targetUser) {
      targetUser.subscriptionTier = invoice.tier;
      const currentExpiry = targetUser.subscriptionExpiresAt && new Date(targetUser.subscriptionExpiresAt) > new Date()
        ? new Date(targetUser.subscriptionExpiresAt)
        : new Date();
      
      currentExpiry.setMonth(currentExpiry.getMonth() + invoice.durationMonths);
      targetUser.subscriptionExpiresAt = currentExpiry;

      if (invoice.tier === SubscriptionTier.PRO_AGENT || invoice.tier === SubscriptionTier.AGENCY) {
        targetUser.isVerifiedAgent = true;
      }

      await this.usersRepository.save(targetUser);
    }
  }

  async upgrade(user: User, tier: SubscriptionTier, durationMonths: number = 1) {
    const freshUser = await this.usersRepository.findOne({ where: { id: user.id } });
    if (!freshUser) {
      throw new NotFoundException('Хэрэглэгч олдсонгүй');
    }

    freshUser.subscriptionTier = tier;
    const expires = new Date();
    expires.setMonth(expires.getMonth() + durationMonths);
    freshUser.subscriptionExpiresAt = expires;

    if (tier === SubscriptionTier.PRO_AGENT || tier === SubscriptionTier.AGENCY) {
      freshUser.isVerifiedAgent = true;
    }

    await this.usersRepository.save(freshUser);

    return {
      success: true,
      message: `Таны эрх амжилттай ${tier} багц болж шинэчлэгдлээ.`,
      user: {
        id: freshUser.id,
        subscriptionTier: freshUser.subscriptionTier,
        subscriptionExpiresAt: freshUser.subscriptionExpiresAt,
        isVerifiedAgent: freshUser.isVerifiedAgent,
      },
    };
  }
}
