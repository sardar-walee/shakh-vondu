-- ==============================================================================
-- SHAKH (daim-post.online) - Complete Production Supabase Database Schema
-- Multi-Category Marketplace & Delivery Platform
-- Super Admin: shakh8002@gmail.com
-- ==============================================================================

-- Enable UUID Extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  avatar_url TEXT,
  city TEXT NOT NULL DEFAULT 'Erbil',
  area TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '',
  role TEXT NOT NULL CHECK (role IN (
    'customer', 'restaurant_owner', 'market_owner', 'clothes_seller',
    'fruits_vegetables_seller', 'fresh_meat_seller', 'dairy_seller',
    'electronics_seller', 'beauty_seller', 'car_seller', 'delivery_agent', 'admin'
  )),
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  is_blocked BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name_ku TEXT NOT NULL,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT NOT NULL,
  color TEXT NOT NULL,
  sort_order INT DEFAULT 0
);

-- Seed Default Categories
INSERT INTO public.categories (id, name_ku, name_en, name_ar, icon, color, sort_order)
VALUES
  ('food', 'چێشتخانە و خواردن', 'Restaurants & Food', 'المطاعم والمأكولات', 'Utensils', '#F97316', 1),
  ('market', 'مارکێت و سوپەرمارکێت', 'Supermarket & Groceries', 'سوبرماركت ومواد غذائية', 'ShoppingBag', '#2563EB', 2),
  ('clothes', 'جلوبەرگ و مۆدە', 'Fashion & Clothes', 'الملابس والأزياء', 'Shirt', '#8B5CF6', 3),
  ('fruits_vegetables', 'سەوزە و میوە', 'Fresh Fruits & Vegetables', 'خضار وفواكه طازجة', 'Apple', '#10B981', 4),
  ('fresh_meat', 'گۆشتی تازە', 'Fresh Meat & Poultry', 'اللحوم الطازجة والدواجن', 'Beef', '#EF4444', 5),
  ('dairy', 'شیرەمەنی و ماست', 'Dairy & Milk Products', 'الألبان والأجبان', 'Milk', '#06B6D4', 6),
  ('electronics', 'ئەلیکترۆنیات', 'Electronics & Mobiles', 'الإلكترونيات والموبايل', 'Smartphone', '#3B82F6', 7),
  ('beauty', 'جوانی و مکیاژ', 'Beauty & Cosmetics', 'العناية والجمال', 'Sparkles', '#EC4899', 8),
  ('cars', 'ئۆتۆمبێل و گواستنەوە', 'Cars & Vehicles', 'السيارات والمركبات', 'Car', '#F59E0B', 9)
ON CONFLICT (id) DO UPDATE 
SET name_ku = EXCLUDED.name_ku, name_en = EXCLUDED.name_en, name_ar = EXCLUDED.name_ar;

-- 3. SELLERS TABLE
CREATE TABLE IF NOT EXISTS public.sellers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  store_name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL REFERENCES public.categories(id),
  description TEXT DEFAULT '',
  logo_url TEXT,
  cover_url TEXT,
  city TEXT NOT NULL DEFAULT 'Erbil',
  address TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00, -- e.g. 10%
  is_open BOOLEAN NOT NULL DEFAULT TRUE,
  opening_hours TEXT DEFAULT '09:00 AM - 11:00 PM',
  rating NUMERIC(3,2) NOT NULL DEFAULT 5.0,
  total_reviews INT NOT NULL DEFAULT 0,
  total_sales INT NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PRODUCTS TABLE
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  seller_id UUID NOT NULL REFERENCES public.sellers(id) ON DELETE CASCADE,
  category TEXT NOT NULL REFERENCES public.categories(id),
  subcategory TEXT,
  title TEXT NOT NULL,
  description TEXT DEFAULT '',
  price NUMERIC(12,2) NOT NULL CHECK (price >= 0),
  discount_price NUMERIC(12,2),
  images TEXT[] NOT NULL DEFAULT '{}',
  stock INT NOT NULL DEFAULT 10 CHECK (stock >= 0),
  is_available BOOLEAN NOT NULL DEFAULT TRUE,
  unit TEXT DEFAULT 'دانە',
  rating NUMERIC(3,2) DEFAULT 5.0,
  review_count INT DEFAULT 0,
  -- Dynamic attributes stored as JSONB for category flexibility
  attributes JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ORDERS TABLE
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_number TEXT NOT NULL UNIQUE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  seller_id UUID NOT NULL REFERENCES public.sellers(id),
  category TEXT NOT NULL REFERENCES public.categories(id),
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_city TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  customer_notes TEXT,
  subtotal NUMERIC(12,2) NOT NULL CHECK (subtotal >= 0),
  delivery_fee NUMERIC(12,2) NOT NULL DEFAULT 3000 CHECK (delivery_fee >= 0),
  total NUMERIC(12,2) NOT NULL CHECK (total >= 0),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (
    status IN ('pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered', 'cancelled')
  ),
  payment_method TEXT NOT NULL DEFAULT 'cash_on_delivery' CHECK (
    payment_method IN ('cash_on_delivery', 'fib', 'fastpay', 'zaincash', 'asiapay')
  ),
  is_paid BOOLEAN NOT NULL DEFAULT FALSE,
  delivery_agent_id UUID REFERENCES public.profiles(id),
  commission_calculated BOOLEAN NOT NULL DEFAULT FALSE,
  commission_rate NUMERIC(5,2) NOT NULL DEFAULT 10.00,
  commission_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  seller_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delivered_at TIMESTAMPTZ
);

-- 6. ORDER ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.order_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id),
  product_title TEXT NOT NULL,
  product_image TEXT,
  price NUMERIC(12,2) NOT NULL,
  quantity INT NOT NULL CHECK (quantity > 0),
  selected_size TEXT,
  selected_color TEXT,
  special_instructions TEXT,
  total NUMERIC(12,2) NOT NULL
);

-- 7. COMMISSION TRANSACTIONS (Financial Ledger)
CREATE TABLE IF NOT EXISTS public.commission_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  order_number TEXT NOT NULL,
  seller_id UUID NOT NULL REFERENCES public.sellers(id),
  order_total NUMERIC(12,2) NOT NULL,
  commission_rate NUMERIC(5,2) NOT NULL,
  commission_amount NUMERIC(12,2) NOT NULL,
  seller_amount NUMERIC(12,2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'finalized' CHECK (status IN ('finalized', 'pending', 'refunded')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. SELLER WALLETS TABLE
CREATE TABLE IF NOT EXISTS public.seller_wallets (
  seller_id UUID PRIMARY KEY REFERENCES public.sellers(id) ON DELETE CASCADE,
  total_gross_sales NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_commission_paid NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_net_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  available_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  pending_balance NUMERIC(14,2) NOT NULL DEFAULT 0,
  last_payout_date TIMESTAMPTZ,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. CAR PACKAGES TABLE
CREATE TABLE IF NOT EXISTS public.car_packages (
  id TEXT PRIMARY KEY,
  name_ku TEXT NOT NULL,
  duration_days INT NOT NULL,
  price_iqd NUMERIC(10,2) NOT NULL
);

INSERT INTO public.car_packages (id, name_ku, duration_days, price_iqd)
VALUES
  ('1_week', 'پاکێجی یەک هەفتە (٧ ڕۆژ)', 7, 5000),
  ('15_days', 'پاکێجی ١٥ ڕۆژ', 15, 7000),
  ('1_month', 'پاکێجی یەک مانگ (٣٠ ڕۆژ)', 30, 10000)
ON CONFLICT (id) DO NOTHING;

-- 10. CAR ADS TABLE
CREATE TABLE IF NOT EXISTS public.car_ads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_phone TEXT NOT NULL,
  user_name TEXT NOT NULL,
  title TEXT NOT NULL,
  brand TEXT NOT NULL,
  model TEXT NOT NULL,
  year INT NOT NULL,
  mileage_km INT NOT NULL DEFAULT 0,
  price_iqd NUMERIC(14,2) NOT NULL,
  price_usd NUMERIC(10,2),
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel', 'hybrid', 'electric')),
  transmission TEXT NOT NULL CHECK (transmission IN ('automatic', 'manual')),
  color TEXT NOT NULL,
  city TEXT NOT NULL,
  description TEXT DEFAULT '',
  images TEXT[] NOT NULL DEFAULT '{}',
  package_type TEXT NOT NULL REFERENCES public.car_packages(id),
  package_price NUMERIC(10,2) NOT NULL,
  payment_status TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_ref TEXT,
  ad_status TEXT NOT NULL DEFAULT 'pending_payment' CHECK (ad_status IN ('pending_payment', 'active', 'expired', 'rejected', 'sold')),
  start_date TIMESTAMPTZ,
  expiration_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. CAR PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS public.car_payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  car_ad_id UUID NOT NULL REFERENCES public.car_ads(id) ON DELETE CASCADE,
  car_title TEXT NOT NULL,
  package_type TEXT NOT NULL,
  amount_iqd NUMERIC(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'IQD',
  status TEXT NOT NULL DEFAULT 'paid' CHECK (status IN ('pending', 'paid', 'failed', 'refunded')),
  payment_method TEXT NOT NULL,
  transaction_reference TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'order',
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  link_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. REVIEWS TABLE
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  target_id UUID NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('product', 'seller')),
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. FAVORITES TABLE
CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id) ON DELETE CASCADE,
  seller_id UUID REFERENCES public.sellers(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, product_id),
  UNIQUE(user_id, seller_id)
);

-- ==============================================================================
-- AUTOMATED COMMISSION CALCULATION TRIGGER (CRITICAL BUSINESS RULE)
-- Triggered when order status becomes 'delivered'
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.process_order_commission()
RETURNS TRIGGER AS $$
DECLARE
  v_seller_commission_rate NUMERIC(5,2);
  v_commission_amount NUMERIC(12,2);
  v_seller_amount NUMERIC(12,2);
BEGIN
  -- Only execute when status transitions to 'delivered' and commission hasn't been calculated yet
  IF NEW.status = 'delivered' AND (OLD.status IS DISTINCT FROM 'delivered') AND NEW.commission_calculated = FALSE THEN
    -- Fetch seller commission rate
    SELECT commission_rate INTO v_seller_commission_rate
    FROM public.sellers
    WHERE id = NEW.seller_id;

    IF v_seller_commission_rate IS NULL THEN
      v_seller_commission_rate := 10.00;
    END IF;

    -- Calculate amounts based on subtotal (or total excluding delivery fee)
    v_commission_amount := ROUND((NEW.subtotal * (v_seller_commission_rate / 100.0)), 2);
    v_seller_amount := NEW.subtotal - v_commission_amount;

    -- Update the order row
    NEW.commission_calculated := TRUE;
    NEW.commission_rate := v_seller_commission_rate;
    NEW.commission_amount := v_commission_amount;
    NEW.seller_amount := v_seller_amount;
    NEW.delivered_at := NOW();

    -- Record Commission Transaction
    INSERT INTO public.commission_transactions (
      order_id, order_number, seller_id, order_total, commission_rate, commission_amount, seller_amount, status
    ) VALUES (
      NEW.id, NEW.order_number, NEW.seller_id, NEW.subtotal, v_seller_commission_rate, v_commission_amount, v_seller_amount, 'finalized'
    );

    -- Upsert Seller Wallet
    INSERT INTO public.seller_wallets (
      seller_id, total_gross_sales, total_commission_paid, total_net_earnings, available_balance, pending_balance, updated_at
    ) VALUES (
      NEW.seller_id, NEW.subtotal, v_commission_amount, v_seller_amount, v_seller_amount, 0, NOW()
    )
    ON CONFLICT (seller_id) DO UPDATE SET
      total_gross_sales = public.seller_wallets.total_gross_sales + NEW.subtotal,
      total_commission_paid = public.seller_wallets.total_commission_paid + v_commission_amount,
      total_net_earnings = public.seller_wallets.total_net_earnings + v_seller_amount,
      available_balance = public.seller_wallets.available_balance + v_seller_amount,
      updated_at = NOW();

    -- Notify Seller
    INSERT INTO public.notifications (user_id, title, message, type, link_url)
    SELECT user_id, 'داواکاری گەیەندرا و قازانج خرایە سەر هەژمارت', 
           'داواکاری ژمارە ' || NEW.order_number || ' گەیەندرا. بڕی ' || v_seller_amount || ' دینار خرایە سەر باڵانسی فرۆشگا.', 
           'commission', '/seller/earnings'
    FROM public.sellers WHERE id = NEW.seller_id;

    -- Notify Customer
    INSERT INTO public.notifications (user_id, title, message, type, link_url)
    VALUES (
      NEW.customer_id, 'داواکارییەکەت بە سەرکەوتوویی گەیەندرا', 
      'داواکاری ژمارە ' || NEW.order_number || ' گەیشتە دەستت. سوپاس بۆ کڕینەکەت لە پلاتفۆرمی شاخی!', 
      'order', '/orders'
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_order_delivered_trigger
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.process_order_commission();

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sellers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.commission_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.seller_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.car_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.favorites ENABLE ROW LEVEL SECURITY;

-- Helper function: Is Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND (role = 'admin' OR email = 'shakh8002@gmail.com')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles: Public read, self update, admin full access
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Admin full profile access" ON public.profiles FOR ALL USING (public.is_admin());

-- Sellers: Public read, seller updates own, admin all
CREATE POLICY "Sellers viewable by everyone" ON public.sellers FOR SELECT USING (true);
CREATE POLICY "Sellers can update own store" ON public.sellers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Admin full sellers access" ON public.sellers FOR ALL USING (public.is_admin());

-- Products: Public read, seller manages own products in permitted category, admin all
CREATE POLICY "Products viewable by everyone" ON public.products FOR SELECT USING (true);
CREATE POLICY "Sellers insert own category products" ON public.products FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.sellers 
    WHERE id = seller_id AND user_id = auth.uid() AND category = products.category
  ) OR public.is_admin()
);
CREATE POLICY "Sellers update own products" ON public.products FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Sellers delete own products" ON public.products FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()) OR public.is_admin()
);

-- Orders: Customer, Seller, Delivery Agent and Admin access
CREATE POLICY "Orders viewable by parties" ON public.orders FOR SELECT USING (
  auth.uid() = customer_id 
  OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  OR auth.uid() = delivery_agent_id
  OR public.is_admin()
);
CREATE POLICY "Customers can create orders" ON public.orders FOR INSERT WITH CHECK (auth.uid() = customer_id);
CREATE POLICY "Authorized parties can update orders" ON public.orders FOR UPDATE USING (
  auth.uid() = customer_id 
  OR EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid())
  OR auth.uid() = delivery_agent_id
  OR public.is_admin()
);

-- Car Ads: Active ads viewable by everyone, owners manage own, admin all
CREATE POLICY "Active car ads viewable by everyone" ON public.car_ads FOR SELECT USING (ad_status = 'active' OR auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can create car ads" ON public.car_ads FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own car ads" ON public.car_ads FOR UPDATE USING (auth.uid() = user_id OR public.is_admin());
CREATE POLICY "Users can delete own car ads" ON public.car_ads FOR DELETE USING (auth.uid() = user_id OR public.is_admin());

-- Commission & Wallets: Only Seller & Admin
CREATE POLICY "Seller can view own commission transactions" ON public.commission_transactions FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()) OR public.is_admin()
);
CREATE POLICY "Seller can view own wallet" ON public.seller_wallets FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.sellers WHERE id = seller_id AND user_id = auth.uid()) OR public.is_admin()
);

-- Notifications: Only target user
CREATE POLICY "Users can view and update own notifications" ON public.notifications FOR ALL USING (auth.uid() = user_id);

-- Storage Buckets Configuration (Run in Supabase Dashboard / SQL Editor)
-- 1. avatars (Public: true)
-- 2. product-images (Public: true)
-- 3. car-images (Public: true)
-- 4. seller-covers (Public: true)
