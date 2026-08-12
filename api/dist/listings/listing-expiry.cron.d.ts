import { Repository } from 'typeorm';
import { Listing } from './listing.entity';
import { MailService } from '../mail/mail.service';
export declare class ListingExpiryCron {
    private listingsRepository;
    private mailService;
    private readonly logger;
    constructor(listingsRepository: Repository<Listing>, mailService: MailService);
    handleCron(): Promise<void>;
}
