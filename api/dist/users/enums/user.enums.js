"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SUBSCRIPTION_LIMITS = exports.SubscriptionTier = void 0;
var SubscriptionTier;
(function (SubscriptionTier) {
    SubscriptionTier["FREE"] = "FREE";
    SubscriptionTier["PRO_AGENT"] = "PRO_AGENT";
    SubscriptionTier["AGENCY"] = "AGENCY";
})(SubscriptionTier || (exports.SubscriptionTier = SubscriptionTier = {}));
exports.SUBSCRIPTION_LIMITS = {
    [SubscriptionTier.FREE]: 3,
    [SubscriptionTier.PRO_AGENT]: 30,
    [SubscriptionTier.AGENCY]: 999999,
};
//# sourceMappingURL=user.enums.js.map