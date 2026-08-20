import { db } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  updateDoc, 
  addDoc, 
  increment 
} from 'firebase/firestore';
import { 
  LoyaltyConfig, 
  LoyaltyTier, 
  LoyaltyReward, 
  Customer 
} from '../types';

export const DEFAULT_LOYALTY_CONFIG: LoyaltyConfig = {
  isEnabled: true,
  pointsPerSpend: 0.1, // 1 point for every $10 spent
  pointValueInCurrency: 0.05, // 1 point = $0.05 discount
  minPointsToRedeem: 50,
  tierRules: {
    silverMinPoints: 500,
    goldMinPoints: 1000,
    platinumMinPoints: 2500,
    silverBonusMultiplier: 1.05,
    goldBonusMultiplier: 1.10,
    platinumBonusMultiplier: 1.20,
  }
};

export function determineCustomerTier(
  totalPoints: number,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): LoyaltyTier {
  const rules = config.tierRules || DEFAULT_LOYALTY_CONFIG.tierRules;
  if (totalPoints >= rules.platinumMinPoints) return 'platinum';
  if (totalPoints >= rules.goldMinPoints) return 'gold';
  if (totalPoints >= rules.silverMinPoints) return 'silver';
  return 'bronze';
}

export function getTierMultiplier(
  tier: LoyaltyTier,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): number {
  const rules = config.tierRules || DEFAULT_LOYALTY_CONFIG.tierRules;
  switch (tier) {
    case 'platinum': return rules.platinumBonusMultiplier || 1.20;
    case 'gold': return rules.goldBonusMultiplier || 1.10;
    case 'silver': return rules.silverBonusMultiplier || 1.05;
    default: return 1.0;
  }
}

export function calculatePointsEarned(
  amount: number,
  tier: LoyaltyTier = 'bronze',
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): number {
  if (!config.isEnabled || amount <= 0) return 0;
  const basePoints = Math.floor(amount * config.pointsPerSpend);
  const multiplier = getTierMultiplier(tier, config);
  return Math.round(basePoints * multiplier);
}

export function calculateDiscountForPoints(
  points: number,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): number {
  if (!config.isEnabled || points <= 0) return 0;
  return Number((points * config.pointValueInCurrency).toFixed(2));
}

export async function processSaleLoyalty(
  storeId: string,
  customerId: string,
  customerName: string,
  saleId: string,
  totalAmount: number,
  pointsRedeemed: number = 0,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
): Promise<{ pointsEarned: number; newTotalPoints: number; currentTier: LoyaltyTier }> {
  const customerRef = doc(db, `stores/${storeId}/customers`, customerId);
  const customerDoc = await getDoc(customerRef);
  
  let currentPoints = 0;
  let totalSpent = 0;
  let tier: LoyaltyTier = 'bronze';

  if (customerDoc.exists()) {
    const data = customerDoc.data() as Customer;
    currentPoints = data.loyaltyPoints || 0;
    totalSpent = (data.totalSpent || 0) + totalAmount;
    tier = data.tier || determineCustomerTier(currentPoints, config);
  }

  // 1. Process redemption if any
  if (pointsRedeemed > 0) {
    currentPoints = Math.max(0, currentPoints - pointsRedeemed);
    await addDoc(collection(db, `stores/${storeId}/loyalty_history`), {
      customerId,
      customerName,
      saleId,
      points: -pointsRedeemed,
      action: 'redeemed',
      reason: `Points redeemed for checkout discount`,
      createdAt: new Date().toISOString()
    });
  }

  // 2. Process points earned for this sale
  const pointsEarned = calculatePointsEarned(totalAmount, tier, config);
  if (pointsEarned > 0) {
    currentPoints += pointsEarned;
    await addDoc(collection(db, `stores/${storeId}/loyalty_history`), {
      customerId,
      customerName,
      saleId,
      points: pointsEarned,
      action: 'earned',
      reason: `Points earned from invoice #${saleId.slice(0, 8).toUpperCase()}`,
      createdAt: new Date().toISOString()
    });
  }

  // 3. Update tier
  const newTier = determineCustomerTier(currentPoints, config);

  // 4. Update customer doc
  await updateDoc(customerRef, {
    loyaltyPoints: currentPoints,
    totalSpent,
    tier: newTier
  });

  return {
    pointsEarned,
    newTotalPoints: currentPoints,
    currentTier: newTier
  };
}

export async function adjustCustomerPointsManual(
  storeId: string,
  customerId: string,
  customerName: string,
  pointsDelta: number,
  reason: string,
  config: LoyaltyConfig = DEFAULT_LOYALTY_CONFIG
) {
  const customerRef = doc(db, `stores/${storeId}/customers`, customerId);
  const customerDoc = await getDoc(customerRef);
  if (!customerDoc.exists()) return;

  const currentPoints = Math.max(0, (customerDoc.data().loyaltyPoints || 0) + pointsDelta);
  const newTier = determineCustomerTier(currentPoints, config);

  await updateDoc(customerRef, {
    loyaltyPoints: currentPoints,
    tier: newTier
  });

  await addDoc(collection(db, `stores/${storeId}/loyalty_history`), {
    customerId,
    customerName,
    points: pointsDelta,
    action: pointsDelta > 0 ? 'bonus' : 'adjusted',
    reason,
    createdAt: new Date().toISOString()
  });
}
