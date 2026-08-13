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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Listing = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const listing_enums_1 = require("./enums/listing.enums");
let Listing = class Listing {
    id;
    title;
    description;
    type;
    category;
    price;
    location;
    district;
    khoroo;
    latitude;
    longitude;
    areaSqm;
    attributes;
    images;
    status;
    user;
    userId;
    viewsCount;
    sharesCount;
    phoneRevealsCount;
    isPromoted;
    promotionTier;
    promotedUntil;
    createdAt;
    expiresAt;
};
exports.Listing = Listing;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Listing.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Listing.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: listing_enums_1.ListingType,
    }),
    __metadata("design:type", String)
], Listing.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: listing_enums_1.ListingCategory,
    }),
    __metadata("design:type", String)
], Listing.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal'),
    __metadata("design:type", Number)
], Listing.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "location", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "district", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Listing.prototype, "khoroo", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], Listing.prototype, "latitude", void 0);
__decorate([
    (0, typeorm_1.Column)('float', { nullable: true }),
    __metadata("design:type", Number)
], Listing.prototype, "longitude", void 0);
__decorate([
    (0, typeorm_1.Column)('float'),
    __metadata("design:type", Number)
], Listing.prototype, "areaSqm", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb', { nullable: true }),
    __metadata("design:type", Object)
], Listing.prototype, "attributes", void 0);
__decorate([
    (0, typeorm_1.Column)('simple-array', { nullable: true }),
    __metadata("design:type", Array)
], Listing.prototype, "images", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: listing_enums_1.ListingStatus,
        default: listing_enums_1.ListingStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], Listing.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, user => user.listings),
    __metadata("design:type", user_entity_1.User)
], Listing.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Listing.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "viewsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "sharesCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 0 }),
    __metadata("design:type", Number)
], Listing.prototype, "phoneRevealsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], Listing.prototype, "isPromoted", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: listing_enums_1.PromotionTier,
        default: listing_enums_1.PromotionTier.STANDARD,
    }),
    __metadata("design:type", String)
], Listing.prototype, "promotionTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", Date)
], Listing.prototype, "promotedUntil", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Listing.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", Date)
], Listing.prototype, "expiresAt", void 0);
exports.Listing = Listing = __decorate([
    (0, typeorm_1.Entity)('listings')
], Listing);
//# sourceMappingURL=listing.entity.js.map