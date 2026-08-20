import React, { useState } from 'react';
import { Store } from '../../types';
import { 
  X, 
  CreditCard, 
  Lock, 
  ShieldCheck, 
  Check, 
  AlertCircle 
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PaymentMethodModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPaymentMethod?: Store['paymentMethod'];
  onSave: (paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  }) => Promise<void>;
  isRTL?: boolean;
}

export default function PaymentMethodModal({
  isOpen,
  onClose,
  currentPaymentMethod,
  onSave,
  isRTL = false
}: PaymentMethodModalProps) {
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  const getBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'Visa';
    if (clean.startsWith('5')) return 'Mastercard';
    if (clean.startsWith('3')) return 'Amex';
    return 'Visa';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cardNumber || !cardExpiry || !cardCvc) {
      setError('Please fill in all card fields.');
      return;
    }

    setIsSaving(true);
    setError('');

    try {
      await new Promise((r) => setTimeout(r, 1000));
      const parts = cardExpiry.split('/');
      const month = parseInt(parts[0], 10) || 12;
      const year = parseInt(`20${parts[1] || '28'}`, 10);
      const cleanLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '4242';

      await onSave({
        brand: getBrand(),
        last4: cleanLast4,
        expMonth: month,
        expYear: year
      });

      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 1500);
    } catch (err: any) {
      setError(err.message || 'Failed to update payment method');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gray-900 text-white p-6 relative">
          <button 
            onClick={onClose}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Stripe Billing</span>
              <h2 className="text-lg font-black text-white">Manage Payment Card</h2>
            </div>
          </div>
        </div>

        {/* Form Body */}
        {success ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6 stroke-[3]" />
            </div>
            <h3 className="text-lg font-black text-gray-900">Card Updated Successfully</h3>
            <p className="text-xs text-gray-500">Your default card for upcoming renewals has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {currentPaymentMethod && (
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 flex items-center justify-between text-xs mb-2">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-500" />
                  <span>
                    Current on file: <strong>{currentPaymentMethod.brand} •••• {currentPaymentMethod.last4}</strong>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-gray-400">
                  Exp {currentPaymentMethod.expMonth}/{currentPaymentMethod.expYear.toString().slice(-2)}
                </span>
              </div>
            )}

            {error && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Card Number</label>
              <input
                type="text"
                value={cardNumber}
                onChange={handleCardNumberChange}
                placeholder="4242 4242 4242 4242"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Expiry (MM/YY)</label>
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={handleExpiryChange}
                  placeholder="08/29"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>

              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">CVC</label>
                <input
                  type="password"
                  value={cardCvc}
                  onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                  placeholder="123"
                  className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                  required
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Cardholder Name</label>
              <input
                type="text"
                value={cardHolder}
                onChange={(e) => setCardHolder(e.target.value)}
                placeholder="MobiStore Owner"
                className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                required
              />
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-gray-500 pt-1">
              <Lock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Card details are tokenized securely with Stripe.</span>
            </div>

            <div className="pt-3 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 hover:bg-gray-200 font-bold text-xs rounded-xl transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-blue-500/20 disabled:opacity-50"
              >
                {isSaving ? 'Saving...' : 'Save Card'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
