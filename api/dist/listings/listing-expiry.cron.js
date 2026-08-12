"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var ListingExpiryCron_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingExpiryCron = void 0;
const common_1 = require("@nestjs/common");
const schedule_1 = require("@nestjs/schedule");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const listing_entity_1 = require("./listing.entity");
const listing_enums_1 = require("./enums/listing.enums");
const mail_service_1 = require("../mail/mail.service");
let ListingExpiryCron = ListingExpiryCron_1 = class ListingExpiryCron {
    listingsRepository;
    mailService;
    logger = new common_1.Logger(ListingExpiryCron_1.name);
    constructor(listingsRepository, mailService) {
        this.listingsRepository = listingsRepository;
        this.mailService = mailService;
    }
    async handleCron() {
        this.logger.debug('Running listing expiry check...');
        const now = new Date();
        const expiredListings = await this.listingsRepository.find({
            where: {
                status: listing_enums_1.ListingStatus.ACTIVE,
                expiresAt: (0, typeorm_2.LessThan)(now),
            },
            relations: { user: true },
        });
        if (expiredListings.length > 0) {
            this.logger.log(`Found ${expiredListings.length} expired listings.`);
            for (const listing of expiredListings) {
                listing.status = listing_enums_1.ListingStatus.EXPIRED;
                await this.listingsRepository.save(listing);
                try {
                    await this.mailService.sendListingExpiredEmail(listing.user, listing);
                    this.logger.log(`Sent expiry email to ${listing.user.email} for listing ${listing.id}`);
                }
                catch (err) {
                    const message = err instanceof Error ? err.message : 'Unknown error';
                    this.logger.error(`Failed to send email for listing ${listing.id}: ${message}`);
                }
            }
        }
        else {
            this.logger.debug('No expired listings found.');
        }
    }
};
exports.ListingExpiryCron = ListingExpiryCron;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_HOUR),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], ListingExpiryCron.prototype, "handleCron", null);
exports.ListingExpiryCron = ListingExpiryCron = ListingExpiryCron_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(listing_entity_1.Listing)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        mail_service_1.MailService])
], ListingExpiryCron);
//# sourceMappingURL=listing-expiry.cron.js.map