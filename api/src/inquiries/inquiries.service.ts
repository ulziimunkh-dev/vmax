import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Inquiry } from './inquiry.entity';
import { CreateInquiryDto } from './dto/create-inquiry.dto';
import { Listing } from '../listings/listing.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class InquiriesService {
  private readonly logger = new Logger(InquiriesService.name);

  constructor(
    @InjectRepository(Inquiry)
    private inquiriesRepository: Repository<Inquiry>,
    @InjectRepository(Listing)
    private listingsRepository: Repository<Listing>,
    private mailService: MailService,
  ) {}

  async create(dto: CreateInquiryDto, currentUser?: any) {
    const listing = await this.listingsRepository.findOne({
      where: { id: dto.listingId },
      relations: { user: true },
    });

    if (!listing) {
      throw new NotFoundException('Зар олдсонгүй.');
    }

    const inquiry = this.inquiriesRepository.create({
      listingId: dto.listingId,
      email: dto.email,
      name: dto.name || dto.email.split('@')[0],
      phone: dto.phone,
      message: dto.message,
      userId: currentUser?.id,
    });

    const savedInquiry = await this.inquiriesRepository.save(inquiry);

    // Check if the property owner has a verified email to receive notifications
    let emailNotified = false;
    const owner = listing.user;
    if (owner && owner.email && owner.isEmailVerified) {
      emailNotified = await this.mailService.sendInquiryNotification(owner, listing, {
        name: dto.name,
        email: dto.email,
        phone: dto.phone,
        message: dto.message,
      });
    } else {
      this.logger.log(
        `Owner of listing "${listing.title}" (user #${owner?.id}) has not verified email or has no email. Email notification skipped.`
      );
    }

    return {
      success: true,
      inquiry: savedInquiry,
      emailNotified,
      message: emailNotified
        ? 'Таны хүсэлт зарын эзэнд амжилттай илгээгдлээ.'
        : 'Таны хүсэлт системд бүртгэгдлээ.',
    };
  }

  async findByListing(listingId: string) {
    return this.inquiriesRepository.find({
      where: { listingId },
      order: { createdAt: 'DESC' },
    });
  }
}
