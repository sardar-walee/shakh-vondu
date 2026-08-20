import React, { useState } from 'react';
import { User, MapPin, Phone, Mail, Shield, Save, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { RoleBadge } from '../components/common/Badge';
import { CITIES } from '../data/seedData';

interface UserProfileViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const UserProfileView: React.FC<UserProfileViewProps> = ({ onNavigate }) => {
  const { currentUser, updateUserProfile } = useAuth();

  const [fullName, setFullName] = useState(currentUser?.fullName || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [city, setCity] = useState(currentUser?.city || 'Erbil (هەولێر)');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [area, setArea] = useState(currentUser?.area || '');
  const [savedToast, setSavedToast] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateUserProfile({
      fullName,
      phone,
      city,
      address,
      area
    });
    setSavedToast(true);
    setTimeout(() => setSavedToast(false), 3000);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-16">
      
      <div className="text-right">
        <h1 className="text-2xl font-black text-slate-900">پڕۆفایلی بەکارهێنەر</h1>
        <p className="text-xs text-slate-500 mt-1">زانیاری کەسی، ژمارەی پەیوەندی و ناونیشانەکانی گەیاندن</p>
      </div>

      {savedToast && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>زانیارییەکان بە سەرکەوتوویی پاشەکەوت کران!</span>
        </div>
      )}

      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
        
        {/* User Card */}
        <div className="flex items-center gap-4 border-b border-slate-100 pb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center font-black text-2xl shadow-md">
            {fullName ? fullName.charAt(0) : 'U'}
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900">{fullName || 'بەکارهێنەر'}</h3>
            <p className="text-xs text-slate-400 font-latin">{currentUser?.email}</p>
            <div className="mt-1.5">
              <RoleBadge role={currentUser?.role || 'customer'} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4 text-right">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ناوی تەواو:</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ژمارەی مۆبایل:</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin focus:bg-white focus:outline-hidden focus:border-orange-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">شار:</label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-semibold focus:bg-white focus:outline-hidden"
              >
                {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">گەڕەک / ناوچە:</label>
              <input
                type="text"
                value={area}
                onChange={(e) => setArea(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ناونیشانی وردی ماڵ یان کار:</label>
            <textarea
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-[0.98] cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>پاشەکەوتکردنی گۆڕانکارییەکان</span>
          </button>
        </form>

      </div>
    </div>
  );
};
