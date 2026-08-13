import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
import { ListingStatus } from '../listings/enums/listing.enums';
import { SubscriptionTier, SUBSCRIPTION_LIMITS } from '../users/enums/user.enums';

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
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
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
