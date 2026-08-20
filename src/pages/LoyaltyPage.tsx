import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  orderBy, 
  limit 
} from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import { 
  Award, 
  Gift, 
  Sliders, 
  Users, 
  TrendingUp, 
  Plus, 
  Sparkles, 
  Check, 
  Trash2, 
  Search, 
  ShieldCheck, 
  ArrowUpRight, 
  ArrowDownRight, 
  Coins, 
  Crown, 
  Percent, 
  Edit3 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  LoyaltyConfig, 
  LoyaltyReward, 
  LoyaltyHistoryItem, 
  Customer, 
  LoyaltyTier 
} from '../types';
import { 
  DEFAULT_LOYALTY_CONFIG, 
  adjustCustomerPointsManual, 
  determineCustomerTier 
} from '../lib/loyaltyService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function LoyaltyPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [config, setConfig] = useState<LoyaltyConfig>(DEFAULT_LOYALTY_CONFIG);
  const [rewards, setRewards] = useState<LoyaltyReward[]>([]);
  const [history, setHistory] = useState<LoyaltyHistoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'rewards' | 'customers' | 'history' | 'settings'>('rewards');

  // Modal States
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [newReward, setNewReward] = useState<Partial<LoyaltyReward>>({
    name: '',
    pointsRequired: 100,
    type: 'free_item',
    itemCategory: 'Accessories',
    discountAmount: 10,
    description: '',
    isActive: true
  });

  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [adjustPointsDelta, setAdjustPointsDelta] = useState<number>(50);
  const [adjustReason, setAdjustReason] = useState('Customer Loyalty VIP Bonus');

  const [savingSettings, setSavingSettings] = useState(false);

  // Sync Store Config
  useEffect(() => {
    if (store?.loyaltyConfig) {
      setConfig({ ...DEFAULT_LOYALTY_CONFIG, ...store.loyaltyConfig });
    }
  }, [store]);

  // Sync Rewards Catalog
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/loyalty_rewards`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyReward));
      if (docs.length === 0) {
        // Seed default rewards if empty
        const defaultRewards: LoyaltyReward[] = [
          { id: 'rew_1', name: 'Free Ceramic Screen Protector', pointsRequired: 50, type: 'free_item', itemCategory: 'Accessories', description: 'Applicable for any iPhone / Samsung model', isActive: true },
          { id: 'rew_2', name: 'Fast 65W GaN Type-C Cable', pointsRequired: 100, type: 'free_item', itemCategory: 'Accessories', description: 'Braided fast charging cable', isActive: true },
          { id: 'rew_3', name: '$15 Instant Cash Cart Discount', pointsRequired: 200, type: 'discount', discountAmount: 15, description: 'Direct deduction from POS cart', isActive: true },
          { id: 'rew_4', name: 'Free Phone Deep Cleaning & Inspection', pointsRequired: 75, type: 'service', description: 'Full speaker & port ultrasonic cleaning', isActive: true },
          { id: 'rew_5', name: 'Wireless Bluetooth Earbuds (VIP)', pointsRequired: 400, type: 'free_item', itemCategory: 'Audio', description: 'Complimentary high-fidelity earbuds', isActive: true }
        ];
        setRewards(defaultRewards);
      } else {
        setRewards(docs);
      }
    });
    return () => unsubscribe();
  }, [store]);

  // Sync Customers & Loyalty Points
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/customers`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setCustomers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer)));
    });
    return () => unsubscribe();
  }, [store]);

  // Sync History Log
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/loyalty_history`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LoyaltyHistoryItem));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setHistory(items);
    });
    return () => unsubscribe();
  }, [store]);

  // Save Settings
  const handleSaveSettings = async () => {
    if (!store?.id) return;
    setSavingSettings(true);
    try {
      await updateDoc(doc(db, 'stores', store.id), {
        loyaltyConfig: config
      });
      alert('Loyalty settings updated successfully!');
    } catch (err) {
      console.error('Failed to save loyalty settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  // Add Reward
  const handleAddReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !newReward.name) return;
    try {
      await addDoc(collection(db, `stores/${store.id}/loyalty_rewards`), {
        ...newReward,
        pointsRequired: Number(newReward.pointsRequired) || 50,
        isActive: true,
        createdAt: new Date().toISOString()
      });
      setIsAddRewardOpen(false);
      setNewReward({ name: '', pointsRequired: 100, type: 'free_item', itemCategory: 'Accessories', discountAmount: 10, description: '', isActive: true });
    } catch (err) {
      console.error('Error adding reward:', err);
    }
  };

  // Delete Reward
  const handleDeleteReward = async (id: string) => {
    if (!store?.id) return;
    if (confirm('Are you sure you want to remove this reward?')) {
      await deleteDoc(doc(db, `stores/${store.id}/loyalty_rewards`, id));
    }
  };

  // Adjust Customer Points Manual
  const handleAdjustPoints = async () => {
    if (!store?.id || !selectedCustomer) return;
    try {
      await adjustCustomerPointsManual(
        store.id,
        selectedCustomer.id,
        selectedCustomer.name,
        adjustPointsDelta,
        adjustReason,
        config
      );
      setIsAdjustModalOpen(false);
      setSelectedCustomer(null);
    } catch (err) {
      console.error('Error adjusting points:', err);
    }
  };

  // Metrics
  const totalPointsCirculating = customers.reduce((s, c) => s + (c.loyaltyPoints || 0), 0);
  const totalPointsValue = totalPointsCirculating * config.pointValueInCurrency;
  const vipCount = customers.filter(c => (c.loyaltyPoints || 0) >= (config.tierRules?.silverMinPoints || 500)).length;

  const filteredCustomers = customers.filter(c => 
    c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.phone.includes(searchTerm)
  );

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-600 p-2.5 rounded-xl shadow-lg shadow-purple-200">
              <Award className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('loyalty')}</h1>
              <p className="text-xs text-gray-500 font-medium">Customer loyalty points, membership tiers, and rewards catalog.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAddRewardOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-purple-200 transition-all active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>Create Reward</span>
            </button>
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Points In Circulation</span>
              <Coins className="w-4 h-4 text-purple-500" />
            </div>
            <p className="text-2xl font-black text-purple-600 mt-2">{totalPointsCirculating.toLocaleString()} pts</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Across all registered customers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Estimated Value</span>
              <Percent className="w-4 h-4 text-blue-500" />
            </div>
            <p className="text-2xl font-black text-blue-600 mt-2">${totalPointsValue.toFixed(2)}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">At ${config.pointValueInCurrency} / point redemption</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">VIP Tier Members</span>
              <Crown className="w-4 h-4 text-amber-500" />
            </div>
            <p className="text-2xl font-black text-amber-600 mt-2">{vipCount}</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Silver, Gold & Platinum tiers</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Rewards Catalog</span>
              <Gift className="w-4 h-4 text-green-500" />
            </div>
            <p className="text-2xl font-black text-green-600 mt-2">{rewards.length} Items</p>
            <p className="text-[10px] text-gray-400 font-bold mt-1">Ready for POS redemption</p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {[
            { id: 'rewards', label: 'Rewards Catalog', icon: Gift },
            { id: 'customers', label: 'Customer Balances & Tiers', icon: Users },
            { id: 'history', label: 'Points Transaction Log', icon: TrendingUp },
            { id: 'settings', label: 'Program Settings', icon: Sliders },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all",
                activeTab === tab.id 
                  ? "border-purple-600 text-purple-600 bg-purple-50/50 rounded-t-xl" 
                  : "border-transparent text-gray-400 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: REWARDS CATALOG */}
        {activeTab === 'rewards' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {rewards.map((reward) => (
                <div 
                  key={reward.id}
                  className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-200 transition-all flex flex-col justify-between group relative overflow-hidden"
                >
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center font-black">
                      <Gift className="w-6 h-6" />
                    </div>
                    <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-xs font-black">
                      {reward.pointsRequired} Points
                    </span>
                  </div>

                  <div className="my-4">
                    <h3 className="font-bold text-gray-900 text-base">{reward.name}</h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{reward.description || 'Special reward for loyal customers.'}</p>
                    <div className="mt-3 flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {reward.type}
                      </span>
                      {reward.discountAmount ? (
                        <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md">
                          ${reward.discountAmount} Off
                        </span>
                      ) : null}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <span className="text-[10px] font-bold text-green-600 flex items-center gap-1">
                      <Check className="w-3 h-3" /> Active in POS
                    </span>
                    <button 
                      onClick={() => handleDeleteReward(reward.id)}
                      className="p-1.5 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 2: CUSTOMER BALANCES & TIERS */}
        {activeTab === 'customers' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex flex-col sm:flex-row justify-between gap-4 items-center">
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search customer by name or phone..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <span className="text-xs font-bold text-gray-400">{filteredCustomers.length} Customers</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Phone</th>
                    <th className="px-6 py-4">Current Tier</th>
                    <th className="px-6 py-4">Loyalty Balance</th>
                    <th className="px-6 py-4">Redeemable Value</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm font-medium">
                  {filteredCustomers.map((cust) => {
                    const points = cust.loyaltyPoints || 0;
                    const tier: LoyaltyTier = cust.tier || determineCustomerTier(points, config);
                    const dollarVal = points * config.pointValueInCurrency;

                    return (
                      <tr key={cust.id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center font-black text-xs">
                              {cust.name.charAt(0)}
                            </div>
                            <span className="font-bold text-gray-900">{cust.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-bold text-gray-600">{cust.phone}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border",
                            tier === 'platinum' ? "bg-purple-100 text-purple-800 border-purple-200" :
                            tier === 'gold' ? "bg-amber-100 text-amber-800 border-amber-200" :
                            tier === 'silver' ? "bg-slate-100 text-slate-800 border-slate-200" :
                            "bg-orange-50 text-orange-700 border-orange-200"
                          )}>
                            ★ {tier}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className="font-black text-purple-600 text-base">{points.toLocaleString()} pts</span>
                        </td>
                        <td className="px-6 py-4 font-bold text-green-600 text-xs">
                          ${dollarVal.toFixed(2)} USD
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => {
                              setSelectedCustomer(cust);
                              setIsAdjustModalOpen(true);
                            }}
                            className="px-3 py-1.5 bg-gray-100 hover:bg-purple-600 hover:text-white rounded-xl text-xs font-bold text-gray-700 transition-all"
                          >
                            Adjust Points
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: TRANSACTION LOG */}
        {activeTab === 'history' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50">
              <h3 className="font-bold text-gray-900 text-sm">Points Audit Trail ({history.length} events)</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Date & Time</th>
                    <th className="px-6 py-4">Customer</th>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Description / Reason</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {history.map((h) => (
                    <tr key={h.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-xs font-bold text-gray-500">
                        {new Date(h.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-900 text-xs">{h.customerName || 'Customer'}</td>
                      <td className="px-6 py-4">
                        <span className={cn(
                          "px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider",
                          h.action === 'earned' ? "bg-green-50 text-green-700" :
                          h.action === 'redeemed' ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                        )}>
                          {h.action}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-black">
                        <span className={h.points >= 0 ? "text-green-600" : "text-red-600"}>
                          {h.points >= 0 ? `+${h.points}` : h.points} pts
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-600">{h.reason || 'Loyalty activity'}</td>
                    </tr>
                  ))}
                  {history.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                        No loyalty transactions recorded yet. Complete sales in POS to earn points!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Loyalty Earning & Redemption Formula</h3>
                <p className="text-xs text-gray-500">Configure how customers earn points on spend and how points convert to cash discount.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={config.isEnabled}
                  onChange={(e) => setConfig({ ...config, isEnabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-purple-600"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Points per $1.00 Spent</label>
                <input 
                  type="number"
                  step="0.01"
                  value={config.pointsPerSpend}
                  onChange={(e) => setConfig({ ...config, pointsPerSpend: parseFloat(e.target.value) || 0.1 })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                />
                <p className="text-[10px] text-gray-400">e.g. 0.1 means 1 point earned for every $10 spent.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Point Value In Currency ($ per point)</label>
                <input 
                  type="number"
                  step="0.01"
                  value={config.pointValueInCurrency}
                  onChange={(e) => setConfig({ ...config, pointValueInCurrency: parseFloat(e.target.value) || 0.05 })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                />
                <p className="text-[10px] text-gray-400">e.g. 0.05 means 100 points = $5.00 discount.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Minimum Points Required to Redeem</label>
                <input 
                  type="number"
                  value={config.minPointsToRedeem}
                  onChange={(e) => setConfig({ ...config, minPointsToRedeem: parseInt(e.target.value) || 50 })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                />
                <p className="text-[10px] text-gray-400">Threshold before customer can redeem points at checkout.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">VIP Platinum Bonus Multiplier</label>
                <input 
                  type="number"
                  step="0.05"
                  value={config.tierRules?.platinumBonusMultiplier || 1.20}
                  onChange={(e) => setConfig({
                    ...config,
                    tierRules: {
                      ...config.tierRules,
                      platinumBonusMultiplier: parseFloat(e.target.value) || 1.20
                    }
                  })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                />
                <p className="text-[10px] text-gray-400">e.g. 1.20 gives Platinum members +20% bonus points per purchase.</p>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={handleSaveSettings}
                disabled={savingSettings}
                className="px-6 py-3 bg-purple-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-purple-200 hover:bg-purple-700 transition-all"
              >
                {savingSettings ? 'Saving...' : 'Save Loyalty Settings'}
              </button>
            </div>
          </div>
        )}

        {/* Modal: Create Reward */}
        {isAddRewardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <h3 className="text-lg font-black text-gray-900">Add Reward to Catalog</h3>
                <button onClick={() => setIsAddRewardOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
              </div>

              <form onSubmit={handleAddReward} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Reward Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Free 65W Fast Charger" 
                    required
                    value={newReward.name}
                    onChange={(e) => setNewReward({ ...newReward, name: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Points Required</label>
                    <input 
                      type="number" 
                      required
                      value={newReward.pointsRequired}
                      onChange={(e) => setNewReward({ ...newReward, pointsRequired: Number(e.target.value) })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-gray-700 block mb-1">Type</label>
                    <select
                      value={newReward.type}
                      onChange={(e) => setNewReward({ ...newReward, type: e.target.value as any })}
                      className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                    >
                      <option value="free_item">Free Accessory / Item</option>
                      <option value="discount">Cash Discount</option>
                      <option value="service">Free Service</option>
                      <option value="voucher">Gift Voucher</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Description / Conditions</label>
                  <textarea 
                    placeholder="Describe how the customer can claim this reward..."
                    value={newReward.description}
                    onChange={(e) => setNewReward({ ...newReward, description: e.target.value })}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium h-20"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md"
                  >
                    Save Reward
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAddRewardOpen(false)}
                    className="px-5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal: Adjust Customer Points */}
        {isAdjustModalOpen && selectedCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black text-purple-600 uppercase tracking-widest">Manual Points Adjustment</span>
                  <h3 className="text-lg font-black text-gray-900">{selectedCustomer.name}</h3>
                </div>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
              </div>

              <div className="bg-purple-50 p-4 rounded-2xl flex justify-between items-center">
                <span className="text-xs font-bold text-purple-900">Current Balance:</span>
                <span className="text-xl font-black text-purple-700">{selectedCustomer.loyaltyPoints || 0} pts</span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Points Delta (+ or -)</label>
                  <input 
                    type="number"
                    value={adjustPointsDelta}
                    onChange={(e) => setAdjustPointsDelta(parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-black"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">Enter positive number to award bonus points or negative to deduct.</p>
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Reason / Note</label>
                  <input 
                    type="text"
                    value={adjustReason}
                    onChange={(e) => setAdjustReason(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={handleAdjustPoints}
                  className="flex-1 bg-purple-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-purple-700 transition-all shadow-md"
                >
                  Confirm Adjustment
                </button>
                <button
                  onClick={() => setIsAdjustModalOpen(false)}
                  className="px-5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
