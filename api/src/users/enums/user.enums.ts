export enum SubscriptionTier {
  FREE = 'FREE',
  PRO_AGENT = 'PRO_AGENT',
  AGENCY = 'AGENCY',
}

export const SUBSCRIPTION_LIMITS = {
  [SubscriptionTier.FREE]: 3,
  [SubscriptionTier.PRO_AGENT]: 30,
  [SubscriptionTier.AGENCY]: 999999,
};
