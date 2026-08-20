import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Store,
  Package,
  Car,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Filter,
  CreditCard,
  Eye,
  Sliders
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge, RoleBadge } from '../components/common/Badge';
import { ProductCategory, OrderStatus, CarPackageType } from '../types';

interface AdminDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const {
    products,
    sellers,
    orders,
    carAds,
    commissionTransactions,
    updateSellerCommission,
    toggleSellerVerification,
    updateOrderStatus,
    updateCarAdStatus
  } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  const [tab, setTab] = useState<'overview' | 'sellers' | 'orders' | 'products' | 'cars' | 'finances'>('overview');

  // KPI Calculations
  const totalGmv = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalCommissionRevenue = deliveredOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const totalCarAdRevenue = carAds
    .filter(c => c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + (c.packagePrice || 0), 0);
  const totalPlatformEarnings = totalCommissionRevenue + totalCarAdRevenue;

  // Editing seller modal / state
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(10);

  const handleSaveCommission = (sellerId: string) => {
    updateSellerCommission(sellerId, Number(newCommissionRate));
    setEditingSellerId(null);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-6 sm:p-8 rounded-3xl border border-red-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-red-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">داشبۆردی سەرپەرشتیاری گشتی (Super Admin)</h1>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Master Control
              </span>
            </div>
            <p className="text-xs text-red-200 mt-1">
              پلاتفۆرمی شاخی (Shakh) • خاوەن موڵک: <span className="font-latin font-bold">shakh8002@gmail.com</span> • دۆمەین: <span className="font-latin">daim-post.online</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 scrollbar-none">
        {[
          { id: 'overview', label: 'پوختەی دارایی و گشتی', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'sellers', label: `فرۆشیاران (${sellers.length})`, icon: <Store className="w-4 h-4" /> },
          { id: 'orders', label: `داواکارییەکان (${orders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'products', label: `کاڵاکان (${products.length})`, icon: <Sliders className="w-4 h-4" /> },
          { id: 'cars', label: `ڕیکلامی ئۆتۆمبێل (${carAds.length})`, icon: <Car className="w-4 h-4" /> },
          { id: 'finances', label: 'تۆماری کۆمسیۆن و داهات', icon: <DollarSign className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆی داهاتی پلاتفۆرمی شاخی</span>
              <h3 className="text-2xl font-black text-emerald-600 font-latin">
                {totalPlatformEarnings.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">کۆمسیۆن + ڕیکلامی ئۆتۆمبێل</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆمسیۆنی داواکارییە گەیەندراوەکان</span>
              <h3 className="text-2xl font-black text-orange-600 font-latin">
                {totalCommissionRevenue.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">{deliveredOrders.length} داواکاری تەواوکراو</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">داهاتی ڕیکلامی ئۆتۆمبێل</span>
              <h3 className="text-2xl font-black text-blue-600 font-latin">
                {totalCarAdRevenue.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">پاکێجەکانی ٧، ١٥ و ٣٠ ڕۆژ</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆی فرۆشی گشتی (GMV)</span>
              <h3 className="text-2xl font-black text-slate-900 font-latin">
                {totalGmv.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">بەهای هەموو داواکارییەکان</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">فرۆشیارانی چالاک</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{sellers.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">کاڵاکان</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{products.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">ڕیکلامی ئۆتۆمبێل</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{carAds.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">کۆی داواکارییەکان</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{orders.length}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Management Tab */}
      {tab === 'sellers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">بەڕێوەبردنی فرۆشیاران و ڕێژەی کۆمسیۆن</h3>
              <p className="text-xs text-slate-500">دەتوانیت ڕێژەی کۆمسیۆنی تایبەت بە هەر فرۆشیارێک (Commission %) دیاریبکەیت.</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">فرۆشگا</th>
                  <th className="p-3">بەش</th>
                  <th className="p-3">شار</th>
                  <th className="p-3">ڕێژەی کۆمسیۆن</th>
                  <th className="p-3">پشتڕاستکردنەوە</th>
                  <th className="p-3">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={s.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{s.storeName}</p>
                          <span className="text-[10px] text-slate-400 font-latin">{s.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><CategoryBadge category={s.category} /></td>
                    <td className="p-3 text-slate-700">{s.city}</td>
                    <td className="p-3">
                      {editingSellerId === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newCommissionRate}
                            onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-xs font-latin"
                          />
                          <button
                            onClick={() => handleSaveCommission(s.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            پاشەکەوت
                          </button>
                        </div>
                      ) : (
                        <span className="font-black text-orange-600 font-latin text-sm">
                          {s.commissionRate}%
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleSellerVerification(s.id)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer ${
                          s.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isVerified ? 'پشتڕاستکراوە ✓' : 'پشتڕاستنەکراوە'}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setEditingSellerId(s.id);
                          setNewCommissionRate(s.commissionRate);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="دەستکاری کۆمسیۆن"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Orders Management Tab */}
      {tab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">سەرجەم داواکارییەکانی پلاتفۆرم</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">کۆدی داواکاری</th>
                  <th className="p-3">فرۆشگا</th>
                  <th className="p-3">کۆی پارە</th>
                  <th className="p-3">کۆمسیۆنی شاخی</th>
                  <th className="p-3">دۆخی داواکاری</th>
                  <th className="p-3">شار</th>
                  <th className="p-3">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map(o => (
                  <tr key={o.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold font-latin">{o.orderNumber}</td>
                    <td className="p-3 text-slate-800">{o.sellerName}</td>
                    <td className="p-3 font-black font-latin">{o.total.toLocaleString()} د.ع</td>
                    <td className="p-3 font-black text-orange-600 font-latin">
                      {(o.commissionAmount || Math.round(o.subtotal * 0.1)).toLocaleString()} د.ع
                    </td>
                    <td className="p-3"><StatusBadge status={o.status} /></td>
                    <td className="p-3 text-slate-600">{o.deliveryCity}</td>
                    <td className="p-3">
                      <button
                        onClick={() => onNavigate('order-tracking', o.id)}
                        className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                      >
                        وردەکاری
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Car Ads Moderation Tab */}
      {tab === 'cars' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">بەڕێوەبردنی ڕیکلامەکانی ئۆتۆمبێل</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carAds.map(car => (
              <div key={car.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <img src={car.images[0]} alt="" className="w-full h-32 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{car.title}</h4>
                  <p className="text-xs font-black text-blue-700 font-latin mt-0.5">{car.priceIqd.toLocaleString()} د.ع</p>
                  <p className="text-[10px] text-slate-400">پاکێج: {car.packageType} • خاوەن: {car.userName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    car.adStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {car.adStatus}
                  </span>

                  <button
                    onClick={() => updateCarAdStatus(car.id, car.adStatus === 'active' ? 'expired' : 'active')}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-lg"
                  >
                    گۆڕینی دۆخ
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Financial Commission Ledger */}
      {tab === 'finances' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">تۆماری دارایی کۆمسیۆنە وەرگیراوەکان</h3>

          <div className="space-y-3">
            {commissionTransactions.map(tx => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">کۆمسیۆنی داواکاری {tx.orderId}</h4>
                  <p className="text-[11px] text-slate-500">
                    فرۆشگا: {tx.sellerName} • فرۆشی گشتی: {tx.orderTotal.toLocaleString()} د.ع ({tx.commissionRate}%)
                  </p>
                </div>
                <div className="text-left">
                  <span className="font-black text-emerald-600 font-latin text-sm block">
                    +{tx.commissionAmount.toLocaleString()} د.ع
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
