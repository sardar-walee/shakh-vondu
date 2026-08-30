import React, { useState, useRef } from 'react';
import {
  UserCheck,
  Plus,
  Phone,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  MapPin,
  Truck,
  MessageSquare,
  Star,
  ShieldCheck,
  AlertCircle,
  Filter,
  Search,
  ExternalLink,
  DollarSign,
  Activity,
  Save,
  X,
  Upload,
  Camera,
  Loader2,
  FileText,
  Lock,
  Mail,
  Car,
  Eye,
  EyeOff,
  Copy,
  Check
} from 'lucide-react';
import { StoreDriver } from '../../types';
import { Modal } from '../common/Modal';
import { ImageUpload } from '../common/ImageUpload';
import { CITIES } from '../../data/seedData';

const compressImageFile = (file: File): Promise<string> => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 1000;
        const MAX_HEIGHT = 1000;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.8));
        } else {
          resolve(event.target?.result as string);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  });
};

const DirectFileUpload: React.FC<{
  label: string;
  value: string;
  onChange: (dataUrl: string) => void;
  placeholder?: string;
}> = ({ label, value, onChange, placeholder }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setLoading(true);
    try {
      const compressed = await compressImageFile(file);
      onChange(compressed);
    } catch (err) {
      console.error('File compress error:', err);
    } finally {
      setLoading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block">{label}</label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="text-[11px] font-bold text-teal-600 hover:text-teal-700 dark:text-teal-400 bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-800 flex items-center gap-1 cursor-pointer transition-colors"
        >
          {loading ? (
            <Loader2 className="w-3 h-3 animate-spin" />
          ) : (
            <Upload className="w-3 h-3" />
          )}
          <span>{loading ? 'بارکردن...' : 'هەڵبژاردنی وێنە'}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {value ? (
        <div className="relative group rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-900 aspect-video max-h-32">
          <img src={value} alt={label} className="w-full h-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-opacity cursor-pointer shadow-md"
            title="سڕینەوە"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ) : null}

      <input
        type="url"
        placeholder={placeholder || 'یان بەستەری وێنە دابنێ (https://...)'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2 text-xs font-latin"
      />
    </div>
  );
};

interface CaptainManagerProps {
  sellerId: string;
  sellerName?: string;
  drivers: StoreDriver[];
  onAddDriver: (driver: Omit<StoreDriver, 'id'>) => Promise<{ success: boolean; driverId?: string }>;
  onUpdateDriver: (driverId: string, updates: Partial<StoreDriver>) => Promise<void>;
  onDeleteDriver: (driverId: string) => Promise<void>;
  isPlatformAdmin?: boolean;
}

export const CaptainManager: React.FC<CaptainManagerProps> = ({
  sellerId,
  sellerName = 'فرۆشگا',
  drivers,
  onAddDriver,
  onUpdateDriver,
  onDeleteDriver,
  isPlatformAdmin = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [vehicleFilter, setVehicleFilter] = useState<string>('all');
  const [dutyFilter, setDutyFilter] = useState<'all' | 'on_duty' | 'off_duty'>('all');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDriver, setEditingDriver] = useState<StoreDriver | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicleType, setVehicleType] = useState<'motorcycle' | 'car' | 'bicycle' | 'van' | 'pickup'>('motorcycle');
  const [vehicleModel, setVehicleModel] = useState('');
  const [vehicleColor, setVehicleColor] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [city, setCity] = useState(CITIES[0] || 'Erbil (هەولێر)');
  const [coverageAreas, setCoverageAreas] = useState<string[]>([]);
  const [newAreaInput, setNewAreaInput] = useState('');
  const [driverPhotoUrl, setDriverPhotoUrl] = useState('');
  const [idCardFrontUrl, setIdCardFrontUrl] = useState('');
  const [idCardBackUrl, setIdCardBackUrl] = useState('');
  const [nationalIdNumber, setNationalIdNumber] = useState('');
  const [vehiclePhotoUrl, setVehiclePhotoUrl] = useState('');
  const [driverLicenseUrl, setDriverLicenseUrl] = useState('');
  const [deliveryFeeType, setDeliveryFeeType] = useState<'fixed' | 'per_km' | 'store_default'>('fixed');
  const [customDeliveryFee, setCustomDeliveryFee] = useState<number>(2000);
  const [commissionRate, setCommissionRate] = useState<number>(10);
  const [nationalIdOrLicense, setNationalIdOrLicense] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [isOnDuty, setIsOnDuty] = useState(true);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [driverId: string]: boolean }>({});
  const [copiedDriverId, setCopiedDriverId] = useState<string | null>(null);

  const togglePasswordVisibility = (driverId: string) => {
    setVisiblePasswords(prev => ({ ...prev, [driverId]: !prev[driverId] }));
  };

  const openAddModal = () => {
    setEditingDriver(null);
    setName('');
    setEmail('');
    setPassword('');
    setPhone('');
    setAddress('');
    setVehicleType('motorcycle');
    setVehicleModel('');
    setVehicleColor('');
    setPlateNumber('');
    setCity(CITIES[0] || 'Erbil (هەولێر)');
    setCoverageAreas([]);
    setNewAreaInput('');
    setDriverPhotoUrl('');
    setIdCardFrontUrl('');
    setIdCardBackUrl('');
    setNationalIdNumber('');
    setVehiclePhotoUrl('');
    setDriverLicenseUrl('');
    setDeliveryFeeType('fixed');
    setCustomDeliveryFee(2000);
    setCommissionRate(10);
    setNationalIdOrLicense('');
    setNotes('');
    setIsActive(true);
    setIsOnDuty(true);
    setIsModalOpen(true);
  };

  const openEditModal = (driver: StoreDriver) => {
    setEditingDriver(driver);
    setName(driver.name || '');
    setEmail(driver.email || '');
    setPassword(driver.password || '');
    setPhone(driver.phone || '');
    setAddress(driver.address || '');
    setVehicleType(driver.vehicleType || 'motorcycle');
    setVehicleModel(driver.vehicleModel || '');
    setVehicleColor(driver.vehicleColor || '');
    setPlateNumber(driver.plateNumber || '');
    setCity(driver.city || CITIES[0] || 'Erbil (هەولێر)');
    setCoverageAreas(driver.coverageAreas || []);
    setNewAreaInput('');
    setDriverPhotoUrl(driver.driverPhotoUrl || driver.avatarUrl || '');
    setIdCardFrontUrl(driver.idCardFrontUrl || '');
    setIdCardBackUrl(driver.idCardBackUrl || '');
    setNationalIdNumber(driver.nationalIdNumber || '');
    setVehiclePhotoUrl(driver.vehiclePhotoUrl || '');
    setDriverLicenseUrl(driver.driverLicenseUrl || '');
    setDeliveryFeeType(driver.deliveryFeeType || 'fixed');
    setCustomDeliveryFee(driver.customDeliveryFee ?? 2000);
    setCommissionRate(driver.commissionRate ?? 10);
    setNationalIdOrLicense(driver.nationalIdOrLicense || '');
    setNotes(driver.notes || '');
    setIsActive(driver.isActive !== false);
    setIsOnDuty(driver.isOnDuty !== false);
    setIsModalOpen(true);
  };

  const handleSaveDriver = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      alert('تکایە ناوی کاپتن و ژمارەی مۆبایل بنووسە.');
      return;
    }

    setIsSaving(true);
    try {
      const driverData: Omit<StoreDriver, 'id'> = {
        sellerId,
        sellerName,
        name: name.trim(),
        email: email.trim() || undefined,
        password: password.trim() || undefined,
        phone: phone.trim(),
        address: address.trim() || undefined,
        vehicleType,
        vehicleModel: vehicleModel.trim() || undefined,
        vehicleColor: vehicleColor.trim() || undefined,
        plateNumber: plateNumber.trim() || undefined,
        city: city.trim() || undefined,
        coverageAreas: coverageAreas.length > 0 ? coverageAreas : undefined,
        driverPhotoUrl: driverPhotoUrl.trim() || undefined,
        avatarUrl: driverPhotoUrl.trim() || undefined,
        idCardFrontUrl: idCardFrontUrl.trim() || undefined,
        idCardBackUrl: idCardBackUrl.trim() || undefined,
        nationalIdNumber: nationalIdNumber.trim() || undefined,
        vehiclePhotoUrl: vehiclePhotoUrl.trim() || undefined,
        driverLicenseUrl: driverLicenseUrl.trim() || undefined,
        deliveryFeeType,
        customDeliveryFee: Number(customDeliveryFee) || undefined,
        commissionRate: Number(commissionRate) || undefined,
        nationalIdOrLicense: nationalIdOrLicense.trim() || undefined,
        notes: notes.trim() || undefined,
        isActive,
        isOnDuty,
        totalDeliveries: editingDriver ? editingDriver.totalDeliveries : 0,
        rating: editingDriver ? editingDriver.rating : 5.0
      };

      if (editingDriver) {
        await onUpdateDriver(editingDriver.id, driverData);
      } else {
        await onAddDriver(driverData);
      }

      setIsModalOpen(false);
      setEditingDriver(null);
    } catch (err) {
      console.error('Error saving driver:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async (driver: StoreDriver) => {
    await onUpdateDriver(driver.id, { isActive: !driver.isActive });
  };

  const handleToggleDuty = async (driver: StoreDriver) => {
    const newDuty = driver.isOnDuty === false ? true : false;
    await onUpdateDriver(driver.id, { isOnDuty: newDuty });
  };

  // Filtered drivers list
  const filteredDrivers = drivers.filter(drv => {
    const matchesSearch =
      (drv.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drv.phone || '').includes(searchTerm) ||
      (drv.plateNumber || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (drv.vehicleModel || '').toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' && drv.isActive) ||
      (statusFilter === 'inactive' && !drv.isActive);

    const matchesVehicle = vehicleFilter === 'all' || drv.vehicleType === vehicleFilter;

    const matchesDuty =
      dutyFilter === 'all' ||
      (dutyFilter === 'on_duty' && drv.isOnDuty !== false) ||
      (dutyFilter === 'off_duty' && drv.isOnDuty === false);

    return matchesSearch && matchesStatus && matchesVehicle && matchesDuty;
  });

  const getVehicleIcon = (type: string) => {
    switch (type) {
      case 'car':
        return '🚗';
      case 'motorcycle':
        return '🛵';
      case 'van':
        return '🚐';
      case 'pickup':
        return '🛻';
      case 'bicycle':
        return '🚲';
      default:
        return '🛵';
    }
  };

  const getVehicleLabel = (type: string) => {
    switch (type) {
      case 'car':
        return 'ئۆتۆمبێل (Car)';
      case 'motorcycle':
        return 'ماتۆڕسکیل (Motorcycle)';
      case 'van':
        return 'ڤان (Van)';
      case 'pickup':
        return 'پیکاب (Pickup)';
      case 'bicycle':
        return 'پاسکیل (Bicycle)';
      default:
        return 'گەیاندن';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Action Header */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                بەڕێوەبردنی کاپتنەکانی گەیاندن (Delivery Captains)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                تۆمارکردن، دەستکاری زانیارییەکان، دیاریکردنی کرێ و چاودێری ئەرکی کاپتنانی خێرا
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={openAddModal}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl text-xs font-black shadow-lg shadow-orange-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer self-stretch sm:self-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>زیادکردنی کاپتنی نوێ</span>
        </button>
      </div>

      {/* Filters and Search Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-4 sm:p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="گەڕان بەپێی ناو، مۆبایل، تابلۆ..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl pr-10 pl-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Vehicle Type Filter */}
          <div>
            <select
              value={vehicleFilter}
              onChange={(e) => setVehicleFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">هەموو جۆرەکانی ئامراز 🛵🚗</option>
              <option value="motorcycle">تەنها ماتۆڕسکیل 🛵</option>
              <option value="car">تەنها ئۆتۆمبێل 🚗</option>
              <option value="van">تەنها ڤان 🚐</option>
              <option value="pickup">تەنها پیکاب 🛻</option>
              <option value="bicycle">تەنها پاسکیل 🚲</option>
            </select>
          </div>

          {/* Duty Filter */}
          <div>
            <select
              value={dutyFilter}
              onChange={(e) => setDutyFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">هەموو دۆخەکانی خزمەت</option>
              <option value="on_duty">لە ئەرکدایە (On Duty) 🟢</option>
              <option value="off_duty">لە پشوودایە (Off Duty) ⚪</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-2.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            >
              <option value="all">هەموو هەژمارەکان (چالاک و ناچالاک)</option>
              <option value="active">تەنها چالاکەکان ✓</option>
              <option value="inactive">تەنها ناچالاکەکان ✕</option>
            </select>
          </div>

        </div>

        {/* Quick Counts Indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-100 dark:border-slate-800">
          <span>کۆی کاپتنەکان: <strong className="font-latin text-slate-900 dark:text-white">{drivers.length}</strong></span>
          <div className="flex items-center gap-3 font-medium text-[11px]">
            <span className="flex items-center gap-1 text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
              <span>لە ئەرکدان: {drivers.filter(d => d.isOnDuty !== false && d.isActive).length}</span>
            </span>
            <span className="flex items-center gap-1 text-slate-400">
              <span className="w-2 h-2 rounded-full bg-slate-300 inline-block" />
              <span>پشوو: {drivers.filter(d => d.isOnDuty === false).length}</span>
            </span>
          </div>
        </div>
      </div>

      {/* Captains Grid / List */}
      {filteredDrivers.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 p-12 rounded-3xl border border-slate-200 dark:border-slate-800 text-center space-y-3">
          <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
            <UserCheck className="w-8 h-8" />
          </div>
          <h3 className="text-sm font-black text-slate-800 dark:text-slate-200">
            {searchTerm ? 'هیچ کاپتنێک بەم پێوەرانە نەدۆزرایەوە' : 'هیچ کاپتنێکی گەیاندن تۆمار نەکراوە'}
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            دەتوانیت کاپتنی نوێ زیاد بکەیت تا بە خێرایی داواکارییەکان وەربگرن و بیگەیەننە کڕیار.
          </p>
          <button
            type="button"
            onClick={openAddModal}
            className="mt-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl text-xs font-black shadow-md cursor-pointer inline-flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>زیادکردنی یەکەم کاپتن</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {filteredDrivers.map(drv => (
            <div
              key={drv.id}
              className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 space-y-4 hover:border-orange-300 dark:hover:border-orange-700/60 transition-all shadow-xs flex flex-col justify-between"
            >
              
              {/* Header Info */}
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {drv.driverPhotoUrl ? (
                        <img
                          src={drv.driverPhotoUrl}
                          alt={drv.name}
                          className="w-12 h-12 rounded-2xl object-cover border-2 border-orange-500/30"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center text-xl font-black">
                          {getVehicleIcon(drv.vehicleType)}
                        </div>
                      )}

                      {/* On-Duty dot */}
                      <span
                        className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${
                          drv.isOnDuty !== false ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'
                        }`}
                        title={drv.isOnDuty !== false ? 'لە ئەرکدایە (Online)' : 'لە پشوودایە (Offline)'}
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-black text-slate-900 dark:text-white">
                          {drv.name}
                        </h3>
                        {drv.rating && (
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-600 bg-amber-50 dark:bg-amber-950/40 px-1.5 py-0.5 rounded-md font-latin">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span>{drv.rating.toFixed(1)}</span>
                          </span>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 dark:text-slate-400 font-latin flex items-center gap-1.5 mt-0.5">
                        <Phone className="w-3 h-3 text-orange-500" />
                        <span>{drv.phone}</span>
                      </p>
                    </div>
                  </div>

                  {/* Active Badge / Duty Switcher */}
                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleToggleActive(drv)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black cursor-pointer transition-colors ${
                        drv.isActive
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                          : 'bg-slate-200 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {drv.isActive ? 'چالاکە ✓' : 'ناچالاکە'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleToggleDuty(drv)}
                      className={`px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors ${
                        drv.isOnDuty !== false
                          ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                          : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
                      }`}
                    >
                      {drv.isOnDuty !== false ? '🟢 لە ئەرکدایە' : '⚪ لە پشوودایە'}
                    </button>
                  </div>
                </div>

                {/* Super Admin / Manager Driver Credentials (Email & Password) */}
                <div className="p-2.5 bg-amber-50/80 dark:bg-amber-950/40 rounded-2xl border border-amber-200/80 dark:border-amber-900/50 space-y-1 text-[11px]">
                  <div className="flex items-center justify-between font-bold text-amber-950 dark:text-amber-200">
                    <span className="flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                      <span>وشەی تێپەڕی کاپتن (Password):</span>
                    </span>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => togglePasswordVisibility(drv.id)}
                        className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/60 rounded-lg transition-colors cursor-pointer text-amber-800 dark:text-amber-300"
                        title={visiblePasswords[drv.id] ? 'داخستنی وشەی تێپەڕ' : 'پیشاندانی وشەی تێپەڕ'}
                      >
                        {visiblePasswords[drv.id] ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                      {drv.password && (
                        <button
                          type="button"
                          onClick={() => {
                            navigator.clipboard.writeText(drv.password || '');
                            setCopiedDriverId(drv.id);
                            setTimeout(() => setCopiedDriverId(null), 2000);
                          }}
                          className="p-1 hover:bg-amber-200/50 dark:hover:bg-amber-900/60 rounded-lg transition-colors cursor-pointer text-amber-800 dark:text-amber-300"
                          title="کۆپیکردنی وشەی تێپەڕ"
                        >
                          {copiedDriverId === drv.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-latin">
                    <span className="text-slate-600 dark:text-slate-300 font-medium">
                      {drv.email || `${drv.phone}@shakh.com`}
                    </span>
                    <span className="font-mono font-bold text-slate-900 dark:text-amber-100 bg-white/80 dark:bg-slate-900 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                      {visiblePasswords[drv.id] ? (drv.password || '12345678') : '••••••••'}
                    </span>
                  </div>
                </div>

                {/* Address & City */}
                {(drv.address || drv.city || (drv.coverageAreas && drv.coverageAreas.length > 0)) && (
                  <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-100 dark:border-slate-800 text-[11px] space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span className="font-bold">{drv.city || 'هەولێر'}</span>
                      {drv.address && <span className="text-slate-500 truncate">• {drv.address}</span>}
                    </div>
                    {drv.coverageAreas && drv.coverageAreas.length > 0 && (
                      <p className="text-[10px] text-slate-400 line-clamp-1 pr-5">
                        گەڕەکەکان: {drv.coverageAreas.join('، ')}
                      </p>
                    )}
                  </div>
                )}

                {/* Badges / Vehicle Info & Vehicle Photo */}
                <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div className="grid grid-cols-2 gap-2">
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-slate-400 text-[10px] block">ئامرازی گواستنەوە:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                        <span>{getVehicleIcon(drv.vehicleType)}</span>
                        <span>{getVehicleLabel(drv.vehicleType)}</span>
                      </span>
                      {drv.vehicleModel && (
                        <span className="text-[10px] text-slate-500 block truncate">{drv.vehicleModel}</span>
                      )}
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl space-y-0.5">
                      <span className="text-slate-400 text-[10px] block">تابلۆ و گەیاندن:</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200 font-latin truncate block">
                        {drv.plateNumber || 'تابلۆ دیاری نەکراوە'}
                      </span>
                      <span className="text-[10px] text-emerald-600 font-bold block font-latin">
                        {drv.totalDeliveries || 0} گەیاندن
                      </span>
                    </div>
                  </div>

                  {/* Vehicle Photo (وێنەی ئۆتۆمبێل / ماتۆڕسکیل) */}
                  {drv.vehiclePhotoUrl && (
                    <div className="p-2 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 flex items-center gap-2">
                      <img
                        src={drv.vehiclePhotoUrl}
                        alt="Vehicle"
                        className="w-16 h-12 rounded-xl object-cover border border-slate-200 dark:border-slate-700 shadow-xs"
                      />
                      <div className="text-[11px]">
                        <span className="font-extrabold text-slate-800 dark:text-slate-200 block">وێنەی ئۆتۆمبێل / ماتۆڕسکیل</span>
                        <span className="text-[10px] text-slate-400 block font-latin">{drv.plateNumber || 'پلاک تۆمارکراوە'}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Personal ID (زێنەی کەسی / تەسکەرە / کارتی نیشتمانی) Section */}
                <div className="p-2.5 bg-teal-50/60 dark:bg-teal-950/30 rounded-2xl border border-teal-200/80 dark:border-teal-900/40 space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-extrabold text-teal-950 dark:text-teal-300 flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-teal-600" />
                      <span>زێنەی کەسی / کارتی نیشتمانی:</span>
                    </span>
                    {drv.nationalIdNumber && (
                      <span className="font-mono font-bold text-teal-800 dark:text-teal-300 font-latin">
                        {drv.nationalIdNumber}
                      </span>
                    )}
                  </div>

                  {drv.idCardFrontUrl || drv.idCardBackUrl ? (
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {drv.idCardFrontUrl ? (
                        <a
                          href={drv.idCardFrontUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative rounded-xl overflow-hidden border border-teal-300 dark:border-teal-800 block bg-white"
                        >
                          <img
                            src={drv.idCardFrontUrl}
                            alt="ID Front"
                            className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-teal-900/80 text-white text-[9px] font-bold text-center py-0.5 backdrop-blur-xs">
                            پێشەوەی زێنەی کەسی 👁️
                          </span>
                        </a>
                      ) : (
                        <div className="h-16 rounded-xl bg-teal-100/50 border border-dashed border-teal-300 flex items-center justify-center text-[10px] text-teal-700">
                          پێشەوە دیاری نەکراوە
                        </div>
                      )}

                      {drv.idCardBackUrl ? (
                        <a
                          href={drv.idCardBackUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="group relative rounded-xl overflow-hidden border border-teal-300 dark:border-teal-800 block bg-white"
                        >
                          <img
                            src={drv.idCardBackUrl}
                            alt="ID Back"
                            className="w-full h-16 object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-0 inset-x-0 bg-teal-900/80 text-white text-[9px] font-bold text-center py-0.5 backdrop-blur-xs">
                            پشتەوەی زێنەی کەسی 👁️
                          </span>
                        </a>
                      ) : (
                        <div className="h-16 rounded-xl bg-teal-100/50 border border-dashed border-teal-300 flex items-center justify-center text-[10px] text-teal-700">
                          پشتەوە دیاری نەکراوە
                        </div>
                      )}
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openEditModal(drv)}
                      className="w-full py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-[11px] font-bold cursor-pointer flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                    >
                      <Upload className="w-3.5 h-3.5" />
                      <span>ئەپلۆدکردنی زێنەی کەسی کاپتن (ID Upload)</span>
                    </button>
                  )}
                </div>

                {/* Custom Fee or Commission */}
                {drv.customDeliveryFee !== undefined && drv.customDeliveryFee > 0 && (
                  <div className="flex items-center justify-between text-[11px] bg-orange-50/70 dark:bg-orange-950/20 p-2 rounded-xl border border-orange-100 dark:border-orange-900/30 text-orange-900 dark:text-orange-200 font-medium">
                    <span>کرێی دیاریکراوی کاپتن:</span>
                    <span className="font-black font-latin text-orange-600 dark:text-orange-400">
                      {drv.customDeliveryFee.toLocaleString()} د.ع
                    </span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <a
                    href={`tel:${drv.phone}`}
                    className="p-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-xl transition-colors cursor-pointer"
                    title="پەیوەندی تەلەفۆنی"
                  >
                    <Phone className="w-4 h-4" />
                  </a>

                  <a
                    href={`https://wa.me/${drv.phone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2 bg-green-50 hover:bg-green-100 dark:bg-green-950/40 dark:hover:bg-green-900/50 text-green-700 dark:text-green-300 rounded-xl transition-colors cursor-pointer"
                    title="واتسئەپ"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => openEditModal(drv)}
                    className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>دەستکاری</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm(`ئایا دڵنیایت لە سڕینەوەی کاپتن "${drv.name}"؟`)) {
                        onDeleteDriver(drv.id);
                      }
                    }}
                    className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer"
                    title="سڕینەوە"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Captain Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDriver ? `دەستکاری زانیارییەکانی کاپتن: ${editingDriver.name}` : 'زیادکردنی کاپتنی نوێی گەیاندن'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveDriver} className="space-y-4 text-xs">
          
          {/* Personal Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ناوی سیانی کاپتن *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="وەک: دڵشاد فەرهاد حەمەد"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ژمارەی تەلەفۆن / مۆبایل *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="0750 123 4567"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Captain Credentials (Email & Password) */}
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 space-y-3">
            <h5 className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              <span>ئیمەیڵ و وشەی تێپەڕی چوونەژوورەوەی کاپتن (Login Credentials):</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ئیمەیڵی کاپتن:</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  dir="ltr"
                  placeholder="captain@shakh.com"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">وشەی تێپەڕ (Password):</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  dir="ltr"
                  placeholder="********"
                  className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-amber-500"
                />
              </div>
            </div>
          </div>

          {/* Captain Photo Direct Upload */}
          <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <DirectFileUpload
              label="وێنەی کەسیی کاپتن (Captain Profile Photo)"
              value={driverPhotoUrl}
              onChange={(dataUrl) => setDriverPhotoUrl(dataUrl)}
              placeholder="لینکی وێنەی کاپتن..."
            />
          </div>

          {/* Vehicle Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                جۆری ئامرازی گواستنەوە
              </label>
              <select
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              >
                <option value="motorcycle">ماتۆڕسکیل 🛵</option>
                <option value="car">ئۆتۆمبێل 🚗</option>
                <option value="van">ڤان 🚐</option>
                <option value="pickup">پیکاب 🛻</option>
                <option value="bicycle">پاسکیل 🚲</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                مۆدێل و ڕەنگ
              </label>
              <input
                type="text"
                value={vehicleModel}
                onChange={(e) => setVehicleModel(e.target.value)}
                placeholder="وەک: هۆندا کلیک ڕەش"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ژمارەی تابلۆ
              </label>
              <input
                type="text"
                value={plateNumber}
                onChange={(e) => setPlateNumber(e.target.value)}
                placeholder="هەولێر 1234 A"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* City & Address & Delivery Fee */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                شار
              </label>
              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              >
                {CITIES.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ناونیشان / شوێنی نیشتەجێبوون
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="وەک: عەنکاوە، جادەی گشتی"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                کرێی دیاریکراوی گەیاندن (دینار)
              </label>
              <input
                type="number"
                step={250}
                value={customDeliveryFee}
                onChange={(e) => setCustomDeliveryFee(Number(e.target.value))}
                placeholder="2000"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Tazkara / National ID Documents */}
          <div className="p-3 bg-teal-50/60 dark:bg-teal-950/40 rounded-2xl border border-teal-200 dark:border-teal-800 space-y-3">
            <h5 className="text-xs font-extrabold text-teal-950 dark:text-teal-300 flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-teal-600" />
              <span>وێنەی تەسکەرە / کارتی نیشتمانی (National ID Cards):</span>
            </h5>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <DirectFileUpload
                label="وێنەی پێشەوەی تەسکەرە"
                value={idCardFrontUrl}
                onChange={(dataUrl) => setIdCardFrontUrl(dataUrl)}
                placeholder="لینکی وێنەی پێشەوەی تەسکەرە..."
              />
              <DirectFileUpload
                label="وێنەی پشتەوەی تەسکەرە"
                value={idCardBackUrl}
                onChange={(dataUrl) => setIdCardBackUrl(dataUrl)}
                placeholder="لینکی وێنەی پشتەوەی تەسکەرە..."
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">ژمارەی تەسکەرە / کارتی نیشتمانی:</label>
              <input
                type="text"
                value={nationalIdNumber}
                onChange={(e) => setNationalIdNumber(e.target.value)}
                dir="ltr"
                placeholder="199512345678"
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-latin text-slate-800 dark:text-slate-200 text-right focus:outline-hidden focus:border-teal-500"
              />
            </div>
          </div>

          {/* Vehicle Photo & Driver License Upload */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700">
            <DirectFileUpload
              label="وێنەی ئۆتۆمبێل / ماتۆڕسکیل"
              value={vehiclePhotoUrl}
              onChange={(dataUrl) => setVehiclePhotoUrl(dataUrl)}
              placeholder="لینکی وێنەی ئۆتۆمبێل..."
            />
            <DirectFileUpload
              label="وێنەی مۆڵەتی شۆفێری"
              value={driverLicenseUrl}
              onChange={(dataUrl) => setDriverLicenseUrl(dataUrl)}
              placeholder="لینکی وێنەی مۆڵەت..."
            />
          </div>

          {/* Coverage Neighborhoods Tag Input */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-700 dark:text-slate-300 block">
              گەڕەکە داپۆشراوەکان (گەڕەک بنووسە و ئینتەر دابگرە):
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                value={newAreaInput}
                onChange={(e) => setNewAreaInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && newAreaInput.trim()) {
                    e.preventDefault();
                    if (!coverageAreas.includes(newAreaInput.trim())) {
                      setCoverageAreas([...coverageAreas, newAreaInput.trim()]);
                    }
                    setNewAreaInput('');
                  }
                }}
                placeholder="وەک: بەختیاری، وەزیران، ڕاستی..."
                className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
              <button
                type="button"
                onClick={() => {
                  if (newAreaInput.trim() && !coverageAreas.includes(newAreaInput.trim())) {
                    setCoverageAreas([...coverageAreas, newAreaInput.trim()]);
                    setNewAreaInput('');
                  }
                }}
                className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white rounded-xl font-bold cursor-pointer"
              >
                زیادکردن
              </button>
            </div>

            {coverageAreas.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {coverageAreas.map((area, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 text-orange-900 dark:text-orange-200 rounded-lg text-xs font-semibold"
                  >
                    <span>{area}</span>
                    <button
                      type="button"
                      onClick={() => setCoverageAreas(coverageAreas.filter((_, i) => i !== idx))}
                      className="text-orange-500 hover:text-rose-600 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* National ID / License & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                زانیاری مۆڵەتی شۆفێری یان ناسنامە (ئارەزوومەندانە)
              </label>
              <input
                type="text"
                value={nationalIdOrLicense}
                onChange={(e) => setNationalIdOrLicense(e.target.value)}
                placeholder="ژمارەی مۆڵەت یان کارتی نیشتمانی"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                وێنەی کەسیی کاپتن (Photo URL)
              </label>
              <input
                type="text"
                value={driverPhotoUrl}
                onChange={(e) => setDriverPhotoUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              تێبینی و پەیوەندی فریاگوزاری
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="تێبینی تایبەت، کاتی ئامادەیی یان ژمارەی کەسی نزیک..."
              className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
            />
          </div>

          {/* Status Switches */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-200 dark:border-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">هەژماری کاپتن چالاکە</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isOnDuty}
                onChange={(e) => setIsOnDuty(e.target.checked)}
                className="w-4 h-4 rounded text-orange-500"
              />
              <span className="font-bold text-slate-800 dark:text-slate-200">لە ئەرکدایە (On Duty)</span>
            </label>
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-5 py-2.5 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl font-bold cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-bold shadow-md cursor-pointer disabled:opacity-50 flex items-center gap-2"
            >
              <Save className="w-4 h-4" />
              <span>{isSaving ? 'پاشەکەوت دەکرێت...' : editingDriver ? 'پاشەکەوتکردنی گۆڕانکارییەکان' : 'تۆمارکردنی کاپتن'}</span>
            </button>
          </div>

        </form>
      </Modal>

    </div>
  );
};
