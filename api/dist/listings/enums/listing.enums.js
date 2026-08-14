"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PromotionTier = exports.ListingStatus = exports.ListingCategory = exports.ListingType = void 0;
var ListingType;
(function (ListingType) {
    ListingType["SALE"] = "SALE";
    ListingType["RENT"] = "RENT";
})(ListingType || (exports.ListingType = ListingType = {}));
var ListingCategory;
(function (ListingCategory) {
    ListingCategory["APARTMENT"] = "APARTMENT";
    ListingCategory["HOUSE"] = "HOUSE";
    ListingCategory["LAND"] = "LAND";
    ListingCategory["COMMERCIAL"] = "COMMERCIAL";
    ListingCategory["RESORT"] = "RESORT";
})(ListingCategory || (exports.ListingCategory = ListingCategory = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["EXPIRED"] = "EXPIRED";
    ListingStatus["CLOSED"] = "CLOSED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var PromotionTier;
(function (PromotionTier) {
    PromotionTier["STANDARD"] = "STANDARD";
    PromotionTier["VIP"] = "VIP";
    PromotionTier["TOP_URGENT"] = "TOP_URGENT";
})(PromotionTier || (exports.PromotionTier = PromotionTier = {}));
//# sourceMappingURL=listing.enums.js.map