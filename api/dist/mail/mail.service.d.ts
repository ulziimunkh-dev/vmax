import { MailerService } from '@nestjs-modules/mailer';
import { User } from '../users/user.entity';
import { Listing } from '../listings/listing.entity';
export declare class MailService {
    private mailerService;
    constructor(mailerService: MailerService);
    sendListingExpiredEmail(user: User, listing: Listing): Promise<void>;
}
