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
  | 'store_driver'
  | 'admin'
  | 'super_admin';

export type DeliveryMode = 'shakh_delivery' | 'store_delivery' | 'hybrid';

export interface StoreDriver {
  id: string;
  sellerId: string;
  name: string;
  phone: string;
  vehicleType: 'motorcycle' | 'car' | 'bicycle' | 'van';
  plateNumber?: string;
  isActive: boolean;
  totalDeliveries?: number;
  rating?: number;
  createdAt?: string;
}

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

export type CarAdStatus = 'pending_payment' | 'active' | 'expired' | 'rejected' | 'sold' | 'hidden';

export type PaymentMethod = 'cash_on_delivery' | 'fib' | 'fastpay' | 'zaincash' | 'asiapay';

export interface GeoLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  city?: string;
  area?: string;
  address?: string;
  mapUrl?: string;
}

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
  geoLocation?: GeoLocation;
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
  deliveryMode?: DeliveryMode;
  ownDrivers?: StoreDriver[];
  storeDeliveryFee?: number;
  storeFreeDeliveryOver?: number;
  storeDeliveryTimeMin?: number;
  geoLocation?: GeoLocation;
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

  // Additional comprehensive category fields
  rewardPoints?: number;
  productStatus?: 'draft' | 'pending_review' | 'active' | 'out_of_stock' | 'hidden' | 'rejected' | 'sold' | 'expired';
  rejectionReason?: string;
  condition?: 'new' | 'used' | 'refurbished';
  clothingStyle?: string;
  fit?: string;
  pattern?: string;
  season?: string;
  sleeveType?: string;
  neckType?: string;
  careInstructions?: string;
  countryOfOrigin?: string;
  packageSize?: string;
  productionDate?: string;
  expiryDate?: string;
  barcode?: string;
  calories?: number;
  portionSize?: string;
  allergens?: string[];
  isVegan?: boolean;
  spicyLevel?: 'none' | 'mild' | 'medium' | 'extra_spicy';
  addOns?: { name: string; price: number }[];
  meatOrigin?: string;
  animalType?: string;
  isHalal?: boolean;
  boneStatus?: 'bone_in' | 'boneless';
  isFreshOrFrozen?: 'fresh' | 'frozen';
  packagingType?: string;
  produceType?: string;
  produceVariety?: string;
  produceGrade?: string;
  storageTemperature?: string;
  storageCapacity?: string;
  ramSize?: string;
  processor?: string;
  screenSize?: string;
  batteryCapacity?: string;
  operatingSystem?: string;
  connectivity?: string;
  paoMonths?: number;
  isAuthenticVerified?: boolean;
  hairType?: string;
  usageInstructions?: string;
  deliveryOptions?: {
    isDeliveryAvailable?: boolean;
    isPickupAvailable?: boolean;
    deliveryFee?: number;
    freeDeliveryThreshold?: number;
  };
  draftSavedAt?: string;

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
  isHidden?: boolean;
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
  deliveryGeoLocation?: GeoLocation;
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
  deliveryMode?: DeliveryMode;
  isStoreDelivery?: boolean;
  storeDriverId?: string;
  storeDriverName?: string;
  storeDriverPhone?: string;
  storeDriverVehicle?: string;
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
  isNegotiable?: boolean;
  fuelType: 'gasoline' | 'diesel' | 'hybrid' | 'electric' | 'plug_in_hybrid' | 'lpg' | 'other';
  transmission: 'automatic' | 'manual' | 'cvt' | 'dct' | 'other';
  color: string;
  city: string;
  area?: string;
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
  isHidden?: boolean;
  createdAt: string;

  // Extended Professional Vehicle Specifications
  trim?: string;
  bodyType?: string;
  sellerType?: 'private' | 'showroom' | 'dealer';
  carCondition?: 'new' | 'used';
  usedConditionGrade?: 'excellent' | 'very_good' | 'good' | 'needs_repair';
  engineType?: string;
  engineSize?: string;
  cylinders?: number;
  hasTurbo?: boolean;
  hasSupercharger?: boolean;
  horsepower?: number;
  torque?: number;
  drivetrain?: 'FWD' | 'RWD' | 'AWD' | '4WD';
  interiorColor?: string;
  doorsCount?: number;
  seatsCount?: number;
  wheelSizeInch?: number;
  tireCondition?: string;
  sunroofType?: 'none' | 'sunroof' | 'panoramic';
  lightingType?: string;
  seatMaterial?: 'leather' | 'fabric' | 'alcantara' | 'mixed';
  interiorFeatures?: string[];
  technologyFeatures?: string[];
  safetyFeatures?: string[];
  exteriorFeatures?: string[];
  accidentStatus?: 'none' | 'minor' | 'major';
  paintStatus?: 'original_paint' | 'partial_paint' | 'full_paint';
  paintDetails?: string;
  chassisCondition?: 'clean' | 'repaired';
  airbagStatus?: 'intact_original' | 'deployed_fixed';
  floodDamage?: boolean;
  fireDamage?: boolean;
  importStatus?: string;
  previousOwnersCount?: number;
  serviceHistory?: boolean;
  warrantyInfo?: string;
  modificationStatus?: 'original' | 'light_mod' | 'cosmetic' | 'performance';
  modificationsDescription?: string;
  plateCity?: string;
  registrationStatus?: 'new' | 'annual_valid' | 'expired';
  vinNumber?: string;
  showVinPublicly?: boolean;
  saleOption?: 'for_sale' | 'for_trade' | 'sale_or_trade';
  tradeNotes?: string;
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

export type NotificationType = 'order' | 'commission' | 'car' | 'payment' | 'system' | 'seller' | 'delivery' | 'points' | 'store_approval' | 'system_alert' | 'request' | 'admin';
export type NotificationStatus = 'info' | 'success' | 'warning' | 'error';
export type RequestCategory = 'request' | 'update' | 'message';
export type RequestActionType = 
  | 'store_accept'
  | 'store_prepare'
  | 'store_ready'
  | 'store_reject'
  | 'captain_accept'
  | 'captain_pickup'
  | 'captain_deliver'
  | 'customer_track'
  | 'admin_approve_store'
  | 'none';

export interface NotificationItem {
  id: string;
  userId: string;
  recipientId?: string;
  recipientRole?: UserRole | 'all_shakh_captains' | 'all_admins' | 'all';
  senderId?: string;
  senderName?: string;
  orderId?: string;
  orderNumber?: string;
  title: string;
  message: string;
  type: NotificationType;
  category?: RequestCategory;
  status?: NotificationStatus;
  actionRequired?: boolean;
  actionType?: RequestActionType;
  isRead: boolean;
  linkUrl?: string;
  actionLabel?: string;
  metadata?: {
    orderId?: string;
    orderNumber?: string;
    carAdId?: string;
    amount?: number;
    itemsCount?: number;
    customerName?: string;
    customerPhone?: string;
    storeName?: string;
    storeAddress?: string;
    storePhone?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryFee?: number;
    captainType?: 'shakh' | 'store';
    captainName?: string;
    captainPhone?: string;
    paymentMethod?: string;
    reason?: string;
    sellerId?: string;
    daysLeft?: number;
    pointsEarned?: number;
  };
  createdAt: string;
  updatedAt?: string;
}

export type AgreementTier = 'Standard' | 'Silver' | 'Gold' | 'VIP_Custom';

export interface PointsSettings {
  pointsPerIQD: number; // 150 points = 1 IQD
  minRedemptionPoints?: number;
  lastUpdated?: string;
}

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
export type FeedbackStatus = 'pending' | 'reviewed' | 'implemented' | 'hidden';

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
  isHidden?: boolean;
  createdAt: string;
}

export type OccasionType =
  | 'mawlid'           // مەولودی پێغەمبەر ﷺ
  | 'ramadan'          // مانگی پیرۆزی ڕەمەزان
  | 'eid_fitr'         // جەژنی ڕەمەزان
  | 'eid_adha'         // جەژنی قوربان
  | 'hijri_new_year'   // سەری ساڵی کۆچی
  | 'isra_miraj'       // ئیسرا و میعراج
  | 'newroz'           // جەژنی نەورۆز
  | 'custom';          // بۆنەی تایبەت

export type OccasionThemeStyle =
  | 'emerald_gold'     // زمردی ئیسلامی و ئاڵتوونی
  | 'royal_midnight'   // شینی شاهانە و زێڕین
  | 'rose_amber'       // گوڵاوی و کەشفی ئارام
  | 'warm_sunset'      // گەرمی پاییز و ئاڵتوونی
  | 'pure_green';      // سەوزی پاک و گوڵی مەولود

export interface OccasionBanner {
  id: string;
  isActive: boolean;
  type: OccasionType;
  badge: string;
  title: string;
  subtitle: string;
  description?: string; // Poetic praise or Mawlid message (مەدحی پێغەمبەر ﷺ)
  praisePoem?: string;  // Kurdish or Arabic verses / poem
  imageUrl?: string;
  themeStyle: OccasionThemeStyle;
  showSalawatCounter: boolean;
  salawatCount: number;
  actionButtonText?: string;
  actionButtonUrl?: string;
  startDate?: string; // ISO date or YYYY-MM-DDTHH:mm for scheduling start
  endDate?: string;   // ISO date or YYYY-MM-DDTHH:mm for scheduling end
  updatedAt?: string;
}

