export type ReelTier = "legendary" | "epic" | "rare" | "uncommon";

export type FulfillmentType =
  | "grand"
  | "credit"
  | "case"
  | "coupon"
  | "retry"
  | "none";

export type BlindBoxPrize = {
  id?: number;
  key: string;
  name: string;
  subtitle?: string | null;
  tier?: ReelTier;
  fulfillmentType?: FulfillmentType;
  weight: number;
  displayOdds?: string | null;
  emoji: string;
  imageUrl?: string | null;
  drawable?: boolean;
  showInPool?: boolean;
  active?: boolean;
  sortOrder?: number;
};
