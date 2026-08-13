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
exports.SavedSearch = void 0;
const typeorm_1 = require("typeorm");
let SavedSearch = class SavedSearch {
    id;
    userId;
    email;
    title;
    filters;
    isEmailAlert;
    isTriggered;
    isActive;
    expiresAt;
    createdAt;
};
exports.SavedSearch = SavedSearch;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], SavedSearch.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SavedSearch.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ nullable: true }),
    __metadata("design:type", String)
], SavedSearch.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: 'Хайлтын мэдэгдэл' }),
    __metadata("design:type", String)
], SavedSearch.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)('jsonb'),
    __metadata("design:type", Object)
], SavedSearch.prototype, "filters", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SavedSearch.prototype, "isEmailAlert", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: false }),
    __metadata("design:type", Boolean)
], SavedSearch.prototype, "isTriggered", void 0);
__decorate([
    (0, typeorm_1.Column)({ default: true }),
    __metadata("design:type", Boolean)
], SavedSearch.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SavedSearch.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SavedSearch.prototype, "createdAt", void 0);
exports.SavedSearch = SavedSearch = __decorate([
    (0, typeorm_1.Entity)('saved_searches')
], SavedSearch);
//# sourceMappingURL=saved-search.entity.js.map