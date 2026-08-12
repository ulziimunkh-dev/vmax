"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ListingStatus = exports.ListingCategory = exports.ListingType = void 0;
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
})(ListingCategory || (exports.ListingCategory = ListingCategory = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["EXPIRED"] = "EXPIRED";
    ListingStatus["CLOSED"] = "CLOSED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
//# sourceMappingURL=listing.enums.js.map