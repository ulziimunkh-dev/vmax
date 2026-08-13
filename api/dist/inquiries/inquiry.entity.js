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
exports.Inquiry = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const listing_entity_1 = require("../listings/listing.entity");
let Inquiry = class Inquiry {
    id;
    name;
    email;
    phone;
    message;
    listingId;
    listing;
    userId;
    user;
    createdAt;
};
exports.Inquiry = Inquiry;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Inquiry.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inquiry.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inquiry.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inquiry.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)('text'),
    __metadata("design:type", String)
], Inquiry.prototype, "message", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Inquiry.prototype, "listingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => listing_entity_1.Listing, { onDelete: 'CASCADE' }),
    __metadata("design:type", listing_entity_1.Listing)
], Inquiry.prototype, "listing", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], Inquiry.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { nullable: true, onDelete: 'SET NULL' }),
    __metadata("design:type", user_entity_1.User)
], Inquiry.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Inquiry.prototype, "createdAt", void 0);
exports.Inquiry = Inquiry = __decorate([
    (0, typeorm_1.Entity)('inquiries')
], Inquiry);
//# sourceMappingURL=inquiry.entity.js.map