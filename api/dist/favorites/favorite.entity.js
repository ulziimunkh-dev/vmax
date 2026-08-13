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
exports.Favorite = void 0;
const typeorm_1 = require("typeorm");
const user_entity_1 = require("../users/user.entity");
const listing_entity_1 = require("../listings/listing.entity");
let Favorite = class Favorite {
    id;
    userId;
    user;
    listingId;
    listing;
    createdAt;
};
exports.Favorite = Favorite;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], Favorite.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Favorite.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => user_entity_1.User, { onDelete: 'CASCADE' }),
    __metadata("design:type", user_entity_1.User)
], Favorite.prototype, "user", void 0);
__decorate([
    (0, typeorm_1.Column)(),
    __metadata("design:type", String)
], Favorite.prototype, "listingId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => listing_entity_1.Listing, { onDelete: 'CASCADE' }),
    __metadata("design:type", listing_entity_1.Listing)
], Favorite.prototype, "listing", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], Favorite.prototype, "createdAt", void 0);
exports.Favorite = Favorite = __decorate([
    (0, typeorm_1.Entity)('favorites'),
    (0, typeorm_1.Unique)(['userId', 'listingId'])
], Favorite);
//# sourceMappingURL=favorite.entity.js.map