import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendListingExpiredEmail(user: User, listing: Listing) {
    await this.mailerService.sendMail({
      to: user.email,
      subject: `Your listing "${listing.title}" has expired`,
      html: `
        <h3>Hello ${user.name},</h3>
        <p>Your listing <strong>${listing.title}</strong> has expired.</p>
        <p>Please log in to Vmax.mn to renew your listing.</p>
        <br/>
        <p>Best regards,<br/>Vmax Team</p>
      `,
    });
  }
}
