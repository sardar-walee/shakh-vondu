export type UserRole =
  | 'customer'
  | 'seller'
  | 'restaurant_owner'
  | 'market_owner'
  | 'clothes_seller'
  | 'fruits_vegetables_seller'
  | 'fresh_meat_seller'
  | 'dairy_seller'
  | 'electronics_seller'
  | 'beauty_seller'
  | 'car_seller'
  | 'delivery_agent'
  | 'admin'
  | 'super_admin';

export type ProductCategory =
  | 'food'
  | 'market'
  | 'clothes'
  | 'fruits_vegetables'
  | 'fresh_meat'
  | 'dairy'
  | 'electronics'
  | 'beauty'
  | 'cars';

export type OrderStatus =
  | 'pending'
  | 'accepted'
  | 'preparing'
  | 'ready'
  | 'picked_up'
  | 'on_the_way'
  | 'delivered'
  | 'cancelled';

export type CarPackageType = '1_week' | '15_days' | '1_month';

export type CarPaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';

export type CarAdStatus = 'pending_payment' | 'active' | 'expired' | 'rejected' | 'sold';

export type PaymentMethod = 'cash_on_delivery' | 'fib' | 'fastpay' | 'zaincash' | 'asiapay';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  storeName?: string;
  phone: string;
  avatarUrl?: string;
  city: string;
  area: string;
  address: string;
  role: UserRole;
  category?: ProductCategory;
  isVerified?: boolean;
  isBlocked?: boolean;
  driverPoints?: number;
  acceptedShakhRules?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DriverStats {
  driverId: string;
  totalDeliveries: number;
  totalDeliveryFees: number;
  totalShakhCommission: number; // 20% cut for Shakh platform
  totalNetEarnings: number;      // 80% net for courier
  points: number;                // Captain points earned
  rating?: number;               // Average star rating (1-5)
  totalReviews?: number;         // Total customer ratings received
  lastUpdated?: string;
}

export interface DeliveryZoneSettings {
  minDistanceKm: number;
  maxDistanceKm: number;
  baseFee: number;
  baseDistanceThresholdKm: number;
  perKmExtraFee: number;
  freeDeliveryThreshold?: number;
  isStrictRadius: boolean;
  estimatedMinutesBase: number;
  estimatedMinutesPerKm: number;
  coveredNeighborhoods: string[];
  deliveryAvailabilityNote?: string;
}

export interface SellerProfile {
  id: string;
  userId: string;
  storeName: string;
  slug: string;
  category: ProductCategory;
  description: string;
  logoUrl?: string;
  coverUrl?: string;
  city: string;
  address: string;
  phone: string;
  commissionRate: number;
  isOpen: boolean;
  openingHours?: string;
  rating: number;
  totalReviews: number;
  totalSales: number;
  isVerified: boolean;
  deliveryZone?: DeliveryZoneSettings;
  createdAt: string;
}

export interface Product {
  id: string;
  sellerId: string;
  sellerName?: string;
  category: ProductCategory;
  subcategory?: string;
  title: string;
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];
  stock: number;
  isAvailable: boolean;
  unit?: string;
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;

  // Category specific dynamic fields
  sizes?: string[];
  colors?: string[];
  brand?: string;
  gender?: 'men' | 'women' | 'kids' | 'unisex';
  material?: string;
  ingredients?: string[];
  prepTimeMinutes?: number;
  isSpicy?: boolean;
  isVegetarian?: boolean;
  weight?: string;
  origin?: string;
  expiryInfo?: string;
  model?: string;
  specs?: Record<string, string>;
  warrantyMonths?: number;
  skinType?: string;
  volume?: string;

  // Cars / Vehicles Category specific fields
  year?: number;
  mileageKm?: number;
  fuelType?: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission?: 'automatic' | 'manual';

  // Meat / Fresh Foods specific fields
  meatType?: string;
  cutType?: string;
  isOrganic?: boolean;
  fatPercentage?: string;

  // Analytics, Best Sellers & Social
  viewsCount?: number;
  likesCount?: number;
  salesCount?: number;
  isBestSeller?: boolean;
  isFeatured?: boolean;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  specialInstructions?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productTitle: string;
  productImage: string;
  price: number;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  specialInstructions?: string;
  total: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  customerCity: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  customerNotes?: string;
  sellerId: string;
  sellerName: string;
  sellerPhone?: string;
  sellerAddress?: string;
  category: ProductCategory;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  deliveryDistanceKm?: number;
  deliveryZoneStatus?: 'within_radius' | 'custom_distance' | 'out_of_range';
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  isPaid: boolean;
  driverId?: string;
  driverName?: string;
  driverPhone?: string;
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  commissionCalculated: boolean;
  commissionRate: number;
  commissionAmount: number;
  sellerAmount: number;
  sellerEarnings?: number;
  isReviewedSeller?: boolean;
  isReviewedDriver?: boolean;
  sellerRating?: number;
  driverRating?: number;
  sellerReviewComment?: string;
  driverReviewComment?: string;
  createdAt: string;
  updatedAt: string;
  deliveredAt?: string;
  statusTimeline: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
}

export interface CommissionTransaction {
  id: string;
  orderId: string;
  orderNumber: string;
  sellerId: string;
  sellerName: string;
  orderTotal: number;
  commissionRate: number;
  commissionAmount: number;
  sellerAmount: number;
  status: 'finalized' | 'pending' | 'refunded';
  createdAt: string;
}

export interface SellerWallet {
  sellerId: string;
  totalGrossSales: number;
  totalCommissionPaid: number;
  totalNetEarnings: number;
  availableBalance: number;
  pendingBalance: number;
  lastPayoutDate?: string;
}

export interface CarPackage {
  id: CarPackageType;
  name: string;
  durationDays: number;
  priceIqd: number;
  features: string[];
}

export interface CarAd {
  id: string;
  userId: string;
  userPhone: string;
  userName: string;
  title: string;
  brand: string;
  model: string;
  year: number;
  mileageKm: number;
  priceIqd: number;
  priceUsd?: number;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric';
  transmission: 'automatic' | 'manual';
  color: string;
  city: string;
  locationDetails?: string;
  damageStatus?: string;
  licensePlateStatus?: string;
  description: string;
  images: string[];
  packageType: CarPackageType;
  packagePrice: number;
  paymentStatus: CarPaymentStatus;
  paymentRef?: string;
  adStatus: CarAdStatus;
  startDate?: string;
  expirationDate?: string;
  viewsCount?: number;
  likesCount?: number;
  sharesCount?: number;
  createdAt: string;
}

export interface CarPayment {
  id: string;
  userId: string;
  carAdId: string;
  carTitle: string;
  packageType: CarPackageType;
  amountIqd: number;
  currency: 'IQD';
  status: CarPaymentStatus;
  paymentMethod: PaymentMethod;
  transactionReference: string;
  createdAt: string;
}

export type ReviewTargetType = 'seller' | 'driver' | 'delivery_partner' | 'product';

export interface Review {
  id: string;
  orderId?: string;
  orderNumber?: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string;
  targetType: ReviewTargetType;
  targetName?: string;
  rating: number; // 1 to 5
  comment: string;
  tags?: string[];
  sellerReply?: {
    comment: string;
    createdAt: string;
  };
  driverReply?: {
    comment: string;
    createdAt: string;
  };
  createdAt: string;
}

export type NotificationType = 'order' | 'commission' | 'car' | 'payment' | 'system' | 'seller' | 'delivery' | 'points';
export type NotificationStatus = 'info' | 'success' | 'warning' | 'error';

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
  status?: NotificationStatus;
  isRead: boolean;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    carAdId?: string;
    amount?: number;
    paymentMethod?: string;
    reason?: string;
    sellerId?: string;
    daysLeft?: number;
    pointsEarned?: number;
  };
  createdAt: string;
}

export type AgreementTier = 'Standard' | 'Silver' | 'Gold' | 'VIP_Custom';

export interface ShakhPointsAgreement {
  id: string;
  sellerId: string;
  sellerName: string;
  tier: AgreementTier;
  customerRewardPercent: number; // e.g. 2% customer reward in points
  sellerRewardPercent: number;   // e.g. 1.5% merchant growth points
  driverBonusPoints: number;     // e.g. 10 extra points per delivery
  shakhCommissionDiscount: number; // e.g. 0.5% discount on commission when redeeming points
  agreementDate: string;
  status: 'active' | 'pending_approval' | 'suspended';
  agreementNotes?: string;
  updatedAt?: string;
}

export interface UserPointsWallet {
  userId: string;
  role: UserRole;
  totalPoints: number;
  lifetimeEarnedPoints: number;
  lifetimeRedeemedPoints: number;
  lastUpdated?: string;
}

export interface PointsTransaction {
  id: string;
  userId: string;
  userName?: string;
  role: UserRole;
  points: number;
  type: 'order_reward' | 'seller_agreement_bonus' | 'driver_delivery' | 'redemption' | 'admin_adjustment';
  orderId?: string;
  orderNumber?: string;
  sellerId?: string;
  sellerName?: string;
  description: string;
  createdAt: string;
}

export type FeedbackType = 'feature_request' | 'bug_report' | 'general_review' | 'category_suggestion';
export type FeedbackStatus = 'pending' | 'reviewed' | 'implemented';

export interface UserFeedback {
  id: string;
  userId: string;
  userName: string;
  userPhone?: string;
  userRole: UserRole;
  feedbackType: FeedbackType;
  title: string;
  message: string;
  rating: number; // 1 to 5
  status: FeedbackStatus;
  adminResponse?: string;
  createdAt: string;
}

