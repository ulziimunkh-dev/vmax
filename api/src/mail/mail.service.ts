import { Injectable, Logger } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private mailerService: MailerService) {}

  async sendListingExpiredEmail(user: User, listing: Listing) {
    if (!user?.email || !user?.isEmailVerified) {
      this.logger.log(`Skipping expiry email for listing ${listing.id}: user email not verified.`);
      return;
    }
    try {
      await this.mailerService.sendMail({
        to: user.email,
        subject: `Таны "${listing.title}" зарын хугацаа дууслаа - Vmax.mn`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; rounded: 12px;">
            <h2 style="color: #863bff;">Сайн байна уу, ${user.name || 'Хэрэглэгч'}!</h2>
            <p>Таны <strong>"${listing.title}"</strong> зарын 7 хоногийн хугацаа дууссан тул идэвхгүй боллоо.</p>
            <p>Хэрэв та зарын хугацаагаа сунгахыг хүсвэл Vmax.mn-д нэвтрэн Хянах самбараасаа үнэ төлбөргүй сунгах боломжтой.</p>
            <br/>
            <p style="color: #666; font-size: 13px;">Хүндэтгэсэн,<br/>Vmax.mn Баг</p>
          </div>
        `,
      });
      this.logger.log(`Expiry email sent to ${user.email} for listing ${listing.id}`);
    } catch (err: any) {
      this.logger.error(`Failed to send expiry email to ${user.email}: ${err.message}`);
    }
  }

  async sendInquiryNotification(owner: User, listing: Listing, inquiry: { name?: string; email?: string; phone?: string; message: string }) {
    if (!owner?.email || !owner?.isEmailVerified) {
      this.logger.log(`Skipping inquiry notification email: owner ${owner?.id} email is not verified.`);
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: owner.email,
        subject: `[Шинэ санал/зурвас] "${listing.title}" заранд хүсэлт ирлээ - Vmax.mn`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 12px;">
            <h2 style="color: #863bff;">Сайн байна уу, ${owner.name || 'Үл хөдлөх хөрөнгийн эзэн'}!</h2>
            <p>Таны <strong>"${listing.title}"</strong> заранд сонирхогч хэрэглэгчээс дараах зурвас/санал ирлээ:</p>
            
            <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #863bff;">
              <p style="margin: 4px 0;"><strong>Илгээгч:</strong> ${inquiry.name || inquiry.email || 'Хэрэглэгч'}</p>
              <p style="margin: 4px 0;"><strong>Холбогдох имэйл:</strong> <a href="mailto:${inquiry.email}">${inquiry.email}</a></p>
              <p style="margin: 4px 0;"><strong>Холбогдох утас:</strong> ${inquiry.phone || 'Оруулаагүй'}</p>
              <p style="margin: 8px 0 4px 0;"><strong>Зурвас:</strong></p>
              <p style="white-space: pre-wrap; color: #333; background: #fff; padding: 10px; border-radius: 6px;">${inquiry.message}</p>
            </div>

            <p style="font-size: 13px; color: #555;">Та дээрх холбоо барих мэдээллээр үйлчлүүлэгчтэйгээ шууд эргэн холбогдох боломжтой.</p>
            <br/>
            <p style="color: #888; font-size: 12px;">Хүндэтгэсэн,<br/>Vmax.mn Баг</p>
          </div>
        `,
      });
      this.logger.log(`Inquiry notification email sent to owner ${owner.email} for listing ${listing.id}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send inquiry notification email to ${owner.email}: ${err.message}`);
      return false;
    }
  }

  async sendNewChatMessageNotification(
    recipient: User,
    sender: User,
    listing: Listing,
    messageContent: string,
  ) {
    if (!recipient?.email || !recipient?.isEmailVerified) {
      return false;
    }

    try {
      await this.mailerService.sendMail({
        to: recipient.email,
        subject: `[Шинэ чат зурвас] "${listing.title}" зарын талаар зурвас ирлээ - Vmax.mn`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px;">
            <h2 style="color: #863bff; margin-top: 0;">Vmax.mn Чат мэдэгдэл</h2>
            <p>Сайн байна уу, <strong>${recipient.name || 'Хэрэглэгч'}</strong>!</p>
            <p><strong>${sender.name || 'Хэрэглэгч'}</strong> таны <strong>"${listing.title}"</strong> зарын талаар шинэ чат зурвас илгээлээ:</p>
            
            <div style="background: #f8fafc; border-left: 4px solid #863bff; padding: 14px 18px; border-radius: 8px; margin: 20px 0;">
              <p style="margin: 0; font-size: 15px; color: #1e293b; font-style: italic;">"${messageContent}"</p>
            </div>

            <div style="text-align: center; margin: 24px 0;">
              <a href="https://vmax.mn/dashboard?tab=messages" style="display: inline-block; background: #863bff; color: #ffffff; text-decoration: none; padding: 12px 28px; border-radius: 12px; font-weight: bold; font-size: 14px;">
                Чат руу очиж хариулах
              </a>
            </div>

            <p style="color: #94a3b8; font-size: 12px; margin-top: 24px;">Энэхүү мэдэгдэл нь таны Vmax.mn бүртгэлд ирсэн шинэ зурвасыг мэдээлэх зорилгоор илгээгдэв.</p>
          </div>
        `,
      });
      this.logger.log(`Chat notification email sent to ${recipient.email}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send chat email to ${recipient.email}: ${err.message}`);
      return false;
    }
  }

  async sendVerificationEmail(toEmail: string, code: string) {
    try {
      await this.mailerService.sendMail({
        to: toEmail,
        subject: `[Vmax.mn] Имэйл баталгаажуулах код: ${code}`,
        html: `
          <div style="font-family: sans-serif; max-width: 500px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 16px; text-align: center;">
            <h2 style="color: #863bff; margin-bottom: 8px;">Vmax.mn</h2>
            <h3 style="color: #1e293b; margin-top: 0;">Имэйл хаяг баталгаажуулалт</h3>
            <p style="color: #64748b; font-size: 14px;">Таны имэйл мэдэгдэл хүлээн авах баталгаажуулах 6 оронтой код:</p>
            <div style="background: #f1f5f9; padding: 16px; border-radius: 12px; margin: 20px 0;">
              <span style="font-size: 32px; font-weight: 800; letter-spacing: 8px; color: #863bff;">${code}</span>
            </div>
            <p style="color: #94a3b8; font-size: 12px;">Энэхүү код нь 10 минутын турш хүчинтэй байна. Хэрэв та уг хүсэлтийг гаргаагүй бол энэхүү имэйлийг үл тооно уу.</p>
          </div>
        `,
      });
      this.logger.log(`Verification email sent to ${toEmail}`);
      return true;
    } catch (err: any) {
      this.logger.error(`Failed to send verification email to ${toEmail}: ${err.message}`);
      return false;
    }
  }
}
