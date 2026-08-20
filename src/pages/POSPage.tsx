import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  addDoc, 
  doc, 
  updateDoc, 
  increment 
} from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import QrScannerModal from '../components/pos/QrScannerModal';
import QrGeneratorModal from '../components/pos/QrGeneratorModal';
import { 
  Search, 
  ShoppingCart, 
  Trash2, 
  Plus, 
  Minus, 
  Scan, 
  UserPlus, 
  Receipt,
  Smartphone,
  ChevronRight,
  Award,
  Gift,
  Check,
  Percent,
  MessageSquare,
  Sparkles,
  UserCheck,
  Coins,
  QrCode
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  Product, 
  Customer, 
  CartItem, 
  LoyaltyReward, 
  LoyaltyConfig 
} from '../types';
import { 
  DEFAULT_LOYALTY_CONFIG, 
  calculatePointsEarned, 
  calculateDiscountForPoints, 
  processSaleLoyalty 
} from '../lib/loyaltyService';
import { sendSMS, renderTemplate, DEFAULT_SMS_TEMPLATES } from '../lib/smsService';
import { usePermissions } from '../contexts/PermissionsContext';
import PermissionGate from '../components/auth/PermissionGate';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function POSPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { hasPermission } = usePermissions();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Customer & Loyalty State
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [pointsToRedeem, setPointsToRedeem] = useState<number>(0);
  const [pointsDiscount, setPointsDiscount] = useState<number>(0);
  const [sendSmsReceipt, setSendSmsReceipt] = useState(true);

  // Rewards redemption modal
  const [isRewardModalOpen, setIsRewardModalOpen] = useState(false);
  const [completedInvoice, setCompletedInvoice] = useState<any | null>(null);

  // Manual & Coupon Discount
  const [manualDiscount, setManualDiscount] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'debt'>('cash');
  const [isProcessing, setIsProcessing] = useState(false);

  // QR Scanner & Generator Modals
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [qrGeneratorProduct, setQrGeneratorProduct] = useState<Product | null>(null);

  const loyaltyConfig: LoyaltyConfig = store?.loyaltyConfig || DEFAULT_LOYALTY_CONFIG;

  // Load Products
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/products`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product)));
    });
    return () => unsubscribe();
  }, [store]);

  // Load Customers
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/customers`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });
    return () => unsubscribe();
  }, [store]);

  // Load Rewards Catalog
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/loyalty_rewards`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setRewards(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyReward)));
    });
    return () => unsubscribe();
  }, [store]);

  // Cart operations
  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.id === product.id && !item.rewardId);
    if (existing) {
      setCart(cart.map(item => 
        item.id === product.id && !item.rewardId ? { ...item, quantity: item.quantity + 1 } : item
      ));
    } else {
      setCart([...cart, { 
        id: product.id, 
        name: product.name, 
        price: product.sellingPrice,
        purchasePrice: product.purchasePrice || Math.round(product.sellingPrice * 0.8),
        brand: product.brand,
        category: product.category,
        quantity: 1 
      }]);
    }
  };

  const addRewardToCart = (reward: LoyaltyReward) => {
    if (!selectedCustomer) {
      alert('Please select a customer first.');
      return;
    }
    const customerPoints = selectedCustomer.loyaltyPoints || 0;
    if (customerPoints < reward.pointsRequired) {
      alert(`Customer has ${customerPoints} points, but ${reward.pointsRequired} points are needed.`);
      return;
    }

    if (reward.type === 'discount' && reward.discountAmount) {
      setPointsDiscount(prev => prev + reward.discountAmount!);
      setPointsToRedeem(prev => prev + reward.pointsRequired);
    } else {
      // Free item reward
      setCart([...cart, {
        id: `reward_${reward.id}`,
        name: `🎁 [REWARD] ${reward.name}`,
        price: 0,
        purchasePrice: 0,
        quantity: 1,
        rewardId: reward.id
      }]);
      setPointsToRedeem(prev => prev + reward.pointsRequired);
    }
    setIsRewardModalOpen(false);
  };

  const removeFromCart = (id: string, rewardId?: string) => {
    const item = cart.find(i => i.id === id && i.rewardId === rewardId);
    if (item?.rewardId) {
      const rew = rewards.find(r => r.id === item.rewardId);
      if (rew) {
        setPointsToRedeem(prev => Math.max(0, prev - rew.pointsRequired));
      }
    }
    setCart(cart.filter(item => !(item.id === id && item.rewardId === rewardId)));
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(cart.map(item => {
      if (item.id === id && !item.rewardId) {
        const newQty = Math.max(1, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }));
  };

  // Calculations
  const subtotal = cart.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  const totalDiscount = manualDiscount + pointsDiscount;
  const total = Math.max(0, subtotal - totalDiscount);

  // Projected Loyalty Points for this sale
  const projectedPointsEarned = calculatePointsEarned(
    total, 
    selectedCustomer?.tier || 'bronze', 
    loyaltyConfig
  );

  // Handle Points Redemption Slider/Input
  const handlePointsRedeemChange = (pts: number) => {
    const maxPts = selectedCustomer?.loyaltyPoints || 0;
    const clamped = Math.min(maxPts, Math.max(0, pts));
    setPointsToRedeem(clamped);
    const disc = calculateDiscountForPoints(clamped, loyaltyConfig);
    setPointsDiscount(disc);
  };

  // Checkout Handler
  const handleCheckout = async () => {
    if (!store?.id || cart.length === 0) return;
    setIsProcessing(true);

    try {
      // 1. Create Sale Record
      const saleRef = await addDoc(collection(db, `stores/${store.id}/sales`), {
        customerId: selectedCustomer?.id || '',
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        items: cart,
        subtotal,
        discount: totalDiscount,
        total,
        cost: cart.reduce((c, i) => c + ((i.purchasePrice || 0) * i.quantity), 0),
        profit: total - cart.reduce((c, i) => c + ((i.purchasePrice || 0) * i.quantity), 0),
        paid: paymentMethod === 'debt' ? 0 : total,
        remaining: paymentMethod === 'debt' ? total : 0,
        paymentMethod,
        employeeName: 'Ahmed K.',
        branchName: 'Erbil Main HQ',
        loyaltyPointsEarned: selectedCustomer ? projectedPointsEarned : 0,
        loyaltyPointsRedeemed: pointsToRedeem,
        smsSent: sendSmsReceipt && !!selectedCustomer?.phone,
        createdAt: new Date().toISOString()
      });

      // 2. Process Customer Loyalty Points if customer selected
      if (selectedCustomer) {
        await processSaleLoyalty(
          store.id,
          selectedCustomer.id,
          selectedCustomer.name,
          saleRef.id,
          total,
          pointsToRedeem,
          loyaltyConfig
        );

        // If debt payment, update customer's debt balance
        if (paymentMethod === 'debt') {
          await updateDoc(doc(db, `stores/${store.id}/customers`, selectedCustomer.id), {
            debt: increment(total)
          });
        }

        // 3. Dispatch SMS Receipt if enabled
        if (sendSmsReceipt && selectedCustomer.phone) {
          const smsText = renderTemplate(DEFAULT_SMS_TEMPLATES.sale_receipt.body, {
            store_name: store.name,
            customer_name: selectedCustomer.name,
            total,
            points_earned: projectedPointsEarned,
            new_balance: (selectedCustomer.loyaltyPoints || 0) - pointsToRedeem + projectedPointsEarned,
            invoice_id: saleRef.id.slice(0, 8).toUpperCase()
          });

          await sendSMS(
            store.id,
            selectedCustomer.phone,
            smsText,
            'sale_receipt',
            selectedCustomer.name,
            store.smsConfig
          );
        }
      }

      // 4. Update Product Stock for regular products
      for (const item of cart) {
        if (!item.rewardId && item.id && !item.id.startsWith('reward_')) {
          try {
            await updateDoc(doc(db, `stores/${store.id}/products`, item.id), {
              stock: increment(-item.quantity)
            });
          } catch (_) {}
        }
      }

      // Record completed invoice object for modal
      setCompletedInvoice({
        id: saleRef.id,
        invoiceNumber: `INV-${saleRef.id.slice(0, 8).toUpperCase()}`,
        items: [...cart],
        subtotal,
        discount: totalDiscount,
        total,
        paymentMethod,
        customerName: selectedCustomer?.name || 'Walk-in Customer',
        customerPhone: selectedCustomer?.phone || '',
        pointsEarned: selectedCustomer ? projectedPointsEarned : 0,
        createdAt: new Date().toISOString()
      });

      // Reset Cart
      setCart([]);
      setSelectedCustomer(null);
      setManualDiscount(0);
      setPointsDiscount(0);
      setPointsToRedeem(0);
    } catch (error) {
      console.error('Checkout failed:', error);
      alert('Checkout failed, please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category || 'General')))];

  const filteredProducts = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.barcode?.includes(searchTerm);
    const matchCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCategory;
  });

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.phone.includes(customerSearch)
  );

  return (
    <DashboardLayout>
      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]", isRTL && "flex-row-reverse")}>
        
        {/* Left 2 Cols: Product Catalog Grid */}
        <div className="lg:col-span-2 flex flex-col gap-4 overflow-hidden">
          {/* Search & Category Filter Bar */}
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search products by model, brand, or scan barcode..." 
                  className="w-full pl-11 pr-4 py-2.5 bg-gray-100 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none text-xs font-semibold"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <button 
                onClick={() => setIsQrScannerOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-2xl transition-all flex items-center gap-2 text-xs font-black uppercase tracking-wider shadow-md shadow-blue-500/20"
              >
                <Scan className="w-4 h-4 animate-pulse" />
                <span className="hidden sm:inline">سکێنکردنی QR</span>
              </button>
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={cn(
                    "px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all",
                    selectedCategory === cat
                      ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Product Items Grid */}
          <div className="flex-1 overflow-y-auto pr-1 custom-scrollbar">
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 pb-4">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  className="bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-blue-200 transition-all text-left flex flex-col justify-between group relative overflow-hidden"
                >
                  {/* QR Generator trigger icon */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setQrGeneratorProduct(product);
                    }}
                    className="absolute top-2 right-2 p-1.5 bg-gray-100 hover:bg-blue-50 text-gray-400 hover:text-blue-600 rounded-lg transition z-10"
                    title="بینینی QR کۆدی بەرهەم"
                  >
                    <QrCode className="w-3.5 h-3.5" />
                  </button>

                  <div 
                    onClick={() => addToCart(product)}
                    className="cursor-pointer"
                  >
                    <div className="w-full aspect-square bg-gray-50 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform mb-2">
                      <Smartphone className="w-8 h-8 text-gray-300 group-hover:text-blue-500 transition-colors" />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-800 text-xs line-clamp-1">{product.name}</h4>
                      <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">{product.brand}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <span className="text-blue-600 font-black text-sm">${product.sellingPrice}</span>
                        <span className={cn(
                          "text-[9px] px-2 py-0.5 rounded-md font-black uppercase",
                          product.stock > 0 ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"
                        )}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of Stock'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Cart, Customer Loyalty & Checkout Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xl flex flex-col overflow-hidden h-full">
          
          {/* Customer Selection Header */}
          <div className="p-4 border-b border-gray-100 bg-gray-50/50 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="bg-blue-600 p-1.5 rounded-lg text-white">
                  <ShoppingCart className="w-4 h-4" />
                </div>
                <h3 className="font-black text-gray-900 text-xs uppercase tracking-wider">POS Register</h3>
              </div>
              <span className="bg-gray-900 text-white px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                {cart.length} items
              </span>
            </div>

            {/* Selected Customer or Choose Customer Button */}
            {selectedCustomer ? (
              <div className="bg-white p-3 rounded-2xl border border-purple-200 shadow-sm space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-black text-gray-900 text-xs">{selectedCustomer.name}</span>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                        ★ {selectedCustomer.tier || 'Bronze'}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono">{selectedCustomer.phone}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedCustomer(null)}
                    className="text-[10px] font-bold text-red-500 hover:underline"
                  >
                    Change
                  </button>
                </div>

                {/* Loyalty Balance Badge & Actions */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-purple-600 font-bold">
                    <Coins className="w-4 h-4" />
                    <span>{selectedCustomer.loyaltyPoints || 0} Points</span>
                  </div>
                  <button
                    onClick={() => setIsRewardModalOpen(true)}
                    className="text-[10px] font-black uppercase tracking-wider text-purple-600 bg-purple-50 hover:bg-purple-100 px-2.5 py-1 rounded-lg transition-all"
                  >
                    Redeem Reward
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => setIsCustomerModalOpen(true)}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-white border border-gray-200 rounded-2xl hover:bg-blue-50/50 hover:border-blue-300 transition-all text-xs font-bold text-gray-700 shadow-xs"
              >
                <div className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Select Customer / Loyalty Member</span>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400" />
              </button>
            )}
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            <AnimatePresence>
              {cart.map((item) => (
                <motion.div
                  key={`${item.id}-${item.rewardId || ''}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-3 bg-gray-50/70 p-2.5 rounded-2xl border border-gray-100"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-gray-900 truncate">{item.name}</h4>
                    <p className="text-blue-600 text-[11px] font-black">${item.price}</p>
                  </div>

                  {!item.rewardId ? (
                    <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded-xl border border-gray-200 shadow-xs">
                      <button onClick={() => updateQuantity(item.id, -1)} className="p-0.5 hover:text-blue-600"><Minus className="w-3 h-3" /></button>
                      <span className="w-5 text-center font-black text-xs">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} className="p-0.5 hover:text-blue-600"><Plus className="w-3 h-3" /></button>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black text-purple-600 bg-purple-50 px-2 py-0.5 rounded-md">FREE REWARD</span>
                  )}

                  <button 
                    onClick={() => removeFromCart(item.id, item.rewardId)}
                    className="p-1.5 text-gray-300 hover:text-red-500 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>

            {cart.length === 0 && (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-30 py-16">
                <ShoppingCart className="w-10 h-10 text-gray-400 mb-2" />
                <p className="font-bold text-gray-400 uppercase tracking-widest text-[10px]">Cart is empty</p>
              </div>
            )}
          </div>

          {/* Checkout Breakdown Panel */}
          <div className="p-5 bg-gray-900 text-white space-y-4">
            
            {/* Points Earned Preview Tag */}
            {selectedCustomer && (
              <div className="bg-purple-900/40 border border-purple-500/30 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-purple-300">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  <span>Points to Earn:</span>
                </div>
                <span className="font-black text-purple-200">+{projectedPointsEarned} pts</span>
              </div>
            )}

            {/* Subtotal, Discounts & Total */}
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400 font-bold">
                <span>Subtotal</span>
                <span>${subtotal}</span>
              </div>

              {pointsDiscount > 0 && (
                <div className="flex justify-between text-purple-400 font-bold">
                  <span>Loyalty Points Discount ({pointsToRedeem} pts)</span>
                  <span>-${pointsDiscount.toFixed(2)}</span>
                </div>
              )}

              {manualDiscount > 0 && (
                <div className="flex justify-between text-red-400 font-bold">
                  <span>Manual Discount</span>
                  <span>-${manualDiscount}</span>
                </div>
              )}

              <div className="pt-2 border-t border-white/10 flex justify-between items-center">
                <span className="text-xs font-black uppercase tracking-widest">Total Due</span>
                <span className="text-2xl font-black text-white">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'cash', label: 'Cash' },
                { id: 'card', label: 'Card' },
                { id: 'debt', label: 'Debt / Later' },
              ].map(m => (
                <button
                  key={m.id}
                  onClick={() => setPaymentMethod(m.id as any)}
                  className={cn(
                    "py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border",
                    paymentMethod === m.id 
                      ? "bg-white text-gray-900 border-white shadow-md" 
                      : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                  )}
                >
                  {m.label}
                </button>
              ))}
            </div>

            {/* SMS Receipt Checkbox */}
            {selectedCustomer && (
              <label className="flex items-center gap-2 cursor-pointer text-[10px] text-gray-300 font-bold">
                <input 
                  type="checkbox" 
                  checked={sendSmsReceipt}
                  onChange={(e) => setSendSmsReceipt(e.target.checked)}
                  className="rounded text-blue-600"
                />
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                <span>Send SMS Receipt & Loyalty Update to {selectedCustomer.phone}</span>
              </label>
            )}

            {/* Complete Checkout Button */}
            <button
              onClick={handleCheckout}
              disabled={cart.length === 0 || isProcessing}
              className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95 disabled:opacity-30 flex items-center justify-center gap-2"
            >
              <Receipt className="w-4 h-4" />
              <span>{isProcessing ? 'Processing Transaction...' : 'Complete Transaction'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Customer Selector */}
      {isCustomerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <h3 className="text-base font-black text-gray-900">Select Customer</h3>
              <button onClick={() => setIsCustomerModalOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
            </div>

            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search name or phone..." 
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold outline-none"
              />
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {filteredCustomers.map(cust => (
                <button
                  key={cust.id}
                  onClick={() => {
                    setSelectedCustomer(cust);
                    setIsCustomerModalOpen(false);
                  }}
                  className="w-full p-3 rounded-2xl border border-gray-100 hover:border-purple-300 hover:bg-purple-50/50 transition-all flex items-center justify-between text-left group"
                >
                  <div>
                    <p className="font-bold text-gray-900 text-xs">{cust.name}</p>
                    <p className="text-[10px] text-gray-400 font-mono">{cust.phone}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-black text-purple-600">{cust.loyaltyPoints || 0} pts</span>
                    <span className="block text-[9px] font-bold text-gray-400 uppercase">Tier: {cust.tier || 'Bronze'}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Redeem Loyalty Reward Catalog */}
      {isRewardModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Redeem Loyalty Rewards</span>
                <h3 className="text-base font-black text-gray-900">{selectedCustomer.name} (Balance: {selectedCustomer.loyaltyPoints || 0} pts)</h3>
              </div>
              <button onClick={() => setIsRewardModalOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
            </div>

            {/* Custom Points Slider for Cash Discount */}
            <div className="bg-purple-50 p-4 rounded-2xl space-y-2">
              <div className="flex justify-between text-xs font-bold text-purple-900">
                <span>Custom Points for Cart Discount:</span>
                <span>{pointsToRedeem} pts = ${pointsDiscount.toFixed(2)}</span>
              </div>
              <input 
                type="range"
                min="0"
                max={selectedCustomer.loyaltyPoints || 0}
                step="10"
                value={pointsToRedeem}
                onChange={(e) => handlePointsRedeemChange(parseInt(e.target.value))}
                className="w-full accent-purple-600 cursor-pointer"
              />
            </div>

            <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest">Or Pick a Catalog Reward</h4>
            
            <div className="max-h-60 overflow-y-auto space-y-2 custom-scrollbar">
              {rewards.map(reward => {
                const canAfford = (selectedCustomer.loyaltyPoints || 0) >= reward.pointsRequired;
                return (
                  <div 
                    key={reward.id}
                    className={cn(
                      "p-3 rounded-2xl border flex items-center justify-between transition-all",
                      canAfford ? "border-gray-200 bg-white hover:border-purple-300" : "border-gray-100 bg-gray-50 opacity-50"
                    )}
                  >
                    <div>
                      <p className="font-bold text-xs text-gray-900">{reward.name}</p>
                      <p className="text-[10px] text-gray-400">{reward.description}</p>
                    </div>
                    <button
                      onClick={() => addRewardToCart(reward)}
                      disabled={!canAfford}
                      className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold disabled:opacity-40"
                    >
                      Redeem ({reward.pointsRequired} pts)
                    </button>
                  </div>
                );
              })}
            </div>

            <button 
              onClick={() => setIsRewardModalOpen(false)}
              className="w-full bg-gray-100 text-gray-700 py-2.5 rounded-xl text-xs font-bold hover:bg-gray-200"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* ----------------- Completed Sale Invoice Modal ----------------- */}
      <AnimatePresence>
        {completedInvoice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-gradient-to-r from-emerald-600 to-teal-700 text-white text-center">
                <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
                  <Check className="w-8 h-8 text-white stroke-[3]" />
                </div>
                <h3 className="text-xl font-black">Sale Completed!</h3>
                <p className="text-xs text-emerald-100 mt-1">Invoice #{completedInvoice.invoiceNumber}</p>
              </div>

              <div className="p-6 space-y-4 text-xs text-gray-700">
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-2">
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-500">Customer:</span>
                    <span className="text-gray-900">{completedInvoice.customerName}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-500">Payment:</span>
                    <span className="uppercase text-slate-900">{completedInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between font-bold">
                    <span className="text-gray-500">Items Sold:</span>
                    <span className="text-gray-900">{completedInvoice.items?.length} items</span>
                  </div>
                  {completedInvoice.pointsEarned > 0 && (
                    <div className="flex justify-between font-bold text-purple-700">
                      <span>Points Rewarded:</span>
                      <span>+{completedInvoice.pointsEarned} pts</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-2 flex justify-between text-base font-black text-slate-900">
                    <span>Total Paid:</span>
                    <span className="text-emerald-600">${completedInvoice.total}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => window.print()}
                    className="flex items-center justify-center gap-2 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-800 rounded-xl font-bold transition-all shadow-2xs cursor-pointer"
                  >
                    <Receipt className="w-4 h-4 text-blue-600" />
                    <span>Print Receipt</span>
                  </button>
                  <button
                    onClick={() => setCompletedInvoice(null)}
                    className="flex items-center justify-center gap-2 py-3 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
                  >
                    <span>New Sale</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Live Camera QR/Barcode Scanner Modal */}
      <QrScannerModal
        isOpen={isQrScannerOpen}
        onClose={() => setIsQrScannerOpen(false)}
        products={products}
        onScanSuccess={(scannedProduct) => addToCart(scannedProduct)}
        isRTL={isRTL}
      />

      {/* QR Code Generator Badge Modal */}
      <QrGeneratorModal
        product={qrGeneratorProduct}
        onClose={() => setQrGeneratorProduct(null)}
        isRTL={isRTL}
      />

    </DashboardLayout>
  );
}
