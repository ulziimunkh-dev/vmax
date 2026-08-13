"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const listings_service_1 = require("./listings.service");
const listings_controller_1 = require("./listings.controller");
const listing_entity_1 = require("./listing.entity");
const user_entity_1 = require("../users/user.entity");
const listing_expiry_cron_1 = require("./listing-expiry.cron");
const mail_module_1 = require("../mail/mail.module");
const saved_searches_module_1 = require("../saved-searches/saved-searches.module");
const listing_contact_log_entity_1 = require("./listing-contact-log.entity");
let ListingsModule = class ListingsModule {
};
exports.ListingsModule = ListingsModule;
exports.ListingsModule = ListingsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([listing_entity_1.Listing, user_entity_1.User, listing_contact_log_entity_1.ListingContactLog]),
            mail_module_1.MailModule,
            saved_searches_module_1.SavedSearchesModule,
        ],
        providers: [listings_service_1.ListingsService, listing_expiry_cron_1.ListingExpiryCron],
        controllers: [listings_controller_1.ListingsController],
    })
], ListingsModule);
//# sourceMappingURL=listings.module.js.map