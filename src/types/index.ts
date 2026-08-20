export type UserRole =
  | 'customer'
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
  | 'admin';

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
  phone: string;
  avatarUrl?: string;
  city: string;
  area: string;
  address: string;
  role: UserRole;
  isVerified?: boolean;
  isBlocked?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface DeliveryZoneSettings {
  minDistanceKm: number; // e.g. 0 (لە 0 کم)
  maxDistanceKm: number; // e.g. 15 (تا 15 کم)
  baseFee: number; // e.g. 2500 IQD
  baseDistanceThresholdKm: number; // e.g. 3km included in baseFee
  perKmExtraFee: number; // e.g. 250 IQD per km above base threshold
  freeDeliveryThreshold?: number; // e.g. 50000 IQD (0 if disabled)
  isStrictRadius: boolean; // if true, rejects orders beyond maxDistanceKm
  estimatedMinutesBase: number; // e.g. 20 mins
  estimatedMinutesPerKm: number; // e.g. 2 min/km
  coveredNeighborhoods: string[]; // e.g. ['بەختیاری', 'ئاشتی', 'عەنکاوە']
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
  commissionRate: number; // e.g. 10 for 10%
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
  price: number; // in IQD
  discountPrice?: number;
  images: string[];
  stock: number;
  isAvailable: boolean;
  unit?: string; // kg, piece, portion, etc.
  rating?: number;
  reviewCount?: number;
  createdAt: string;
  updatedAt?: string;

  // Category specific fields
  // Clothes
  sizes?: string[];
  colors?: string[];
  brand?: string;
  gender?: 'men' | 'women' | 'kids' | 'unisex';
  material?: string;

  // Food / Restaurant
  ingredients?: string[];
  prepTimeMinutes?: number;
  isSpicy?: boolean;
  isVegetarian?: boolean;

  // Meat / Dairy / Fruits
  weight?: string;
  origin?: string;
  expiryInfo?: string;

  // Electronics
  model?: string;
  specs?: Record<string, string>;
  warrantyMonths?: number;

  // Beauty
  skinType?: string;
  volume?: string;
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
  deliveryAgentId?: string;
  deliveryAgentName?: string;
  deliveryAgentPhone?: string;
  commissionCalculated: boolean;
  commissionRate: number;
  commissionAmount: number;
  sellerAmount: number;
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
  commissionRate: number; // percentage
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
  description: string;
  images: string[];
  packageType: CarPackageType;
  packagePrice: number;
  paymentStatus: CarPaymentStatus;
  paymentRef?: string;
  adStatus: CarAdStatus;
  startDate?: string;
  expirationDate?: string;
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

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetId: string; // product ID or seller ID
  targetType: 'product' | 'seller';
  rating: number; // 1 to 5
  comment: string;
  createdAt: string;
}

export type NotificationType = 'order' | 'commission' | 'car' | 'payment' | 'system' | 'seller';
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
  };
  createdAt: string;
}
