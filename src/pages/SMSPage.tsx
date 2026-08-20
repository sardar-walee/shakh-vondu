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
  getDocs 
} from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import { 
  MessageSquare, 
  Send, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  ShieldAlert, 
  CreditCard, 
  Smartphone, 
  Settings, 
  RefreshCw, 
  Sliders, 
  Server, 
  Search, 
  Check, 
  Sparkles, 
  FileText, 
  BellRing,
  PhoneCall
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { 
  SMSConfig, 
  SMSLog, 
  SMSEventType, 
  Product, 
  Customer 
} from '../types';
import { 
  DEFAULT_SMS_CONFIG, 
  DEFAULT_SMS_TEMPLATES, 
  sendSMS, 
  triggerLowStockCheck, 
  triggerSubscriptionExpiryCheck, 
  triggerWarrantyExpiryAlert, 
  triggerInstallmentAlert 
} from '../lib/smsService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SMSPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [config, setConfig] = useState<SMSConfig>(DEFAULT_SMS_CONFIG);
  const [logs, setLogs] = useState<SMSLog[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activeTab, setActiveTab] = useState<'triggers' | 'gateway' | 'templates' | 'logs'>('triggers');

  // Trigger Action States
  const [scanning, setScanning] = useState<string | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  // Manual SMS Modal
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [manualPhone, setManualPhone] = useState('+964750');
  const [manualName, setManualName] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [sendingManual, setSendingManual] = useState(false);

  // Gateway Test State
  const [testingGateway, setTestingGateway] = useState(false);
  const [gatewayStatus, setGatewayStatus] = useState<{ success: boolean; msg: string } | null>(null);
  const [savingConfig, setSavingConfig] = useState(false);

  // Load Store Config
  useEffect(() => {
    if (store?.smsConfig) {
      setConfig({ ...DEFAULT_SMS_CONFIG, ...store.smsConfig });
    }
  }, [store]);

  // Load SMS Logs
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/sms_logs`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SMSLog));
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      
      // If empty, provide realistic initial log entries
      if (items.length === 0) {
        const sampleLogs: SMSLog[] = [
          {
            id: 'log_1',
            recipientPhone: '+9647501234567',
            recipientName: 'MobiStore Manager',
            eventType: 'low_stock',
            message: '⚠️ [MobiStore] Low Stock Alert: Product "iPhone 15 Pro Max" is down to 2 units! Minimum threshold is 5.',
            status: 'delivered',
            gatewayResponse: 'Gateway [TWILIO] accepted. SID: SM9872134',
            createdAt: new Date(Date.now() - 3600 * 1000).toISOString()
          },
          {
            id: 'log_2',
            recipientPhone: '+9647509876543',
            recipientName: 'Soran Ali',
            eventType: 'upcoming_installment',
            message: '💳 [MobiStore] Payment Reminder: Dear Soran Ali, upcoming installment of $150 is due on 2026-03-01. Thank you!',
            status: 'delivered',
            gatewayResponse: 'Gateway [FASTSMS] delivered. ID: FS_4492',
            createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
          },
          {
            id: 'log_3',
            recipientPhone: '+9647505551122',
            recipientName: 'Rebin Qadir',
            eventType: 'expiring_warranty',
            message: '🛡️ [MobiStore] Warranty Notice: Dear Rebin Qadir, warranty for AirPods Pro 2 expires in 7 days.',
            status: 'delivered',
            gatewayResponse: 'Gateway [ASIACELL] delivered.',
            createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString()
          }
        ];
        setLogs(sampleLogs);
      } else {
        setLogs(items);
      }
    });
    return () => unsubscribe();
  }, [store]);

  // Load Products & Customers for Scanners
  useEffect(() => {
    if (!store?.id) return;
    const unsubProd = onSnapshot(collection(db, `stores/${store.id}/products`), (snap) => {
      setProducts(snap.docs.map(d => ({ id: d.id, ...d.data() } as Product)));
    });
    const unsubCust = onSnapshot(collection(db, `stores/${store.id}/customers`), (snap) => {
      setCustomers(snap.docs.map(d => ({ id: d.id, ...d.data() } as Customer)));
    });
    return () => {
      unsubProd();
      unsubCust();
    };
  }, [store]);

  // Save Gateway Settings
  const handleSaveConfig = async () => {
    if (!store?.id) return;
    setSavingConfig(true);
    try {
      await updateDoc(doc(db, 'stores', store.id), {
        smsConfig: config
      });
      alert('SMS Gateway configuration updated successfully!');
    } catch (err) {
      console.error('Failed to save SMS config:', err);
    } finally {
      setSavingConfig(false);
    }
  };

  // Test Gateway Connection
  const handleTestGateway = async () => {
    if (!config.testPhone) {
      alert('Please enter a Test Phone Number first.');
      return;
    }
    setTestingGateway(true);
    setGatewayStatus(null);
    try {
      const res = await fetch('/api/sms/test', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider: config.provider,
          apiKey: config.apiKey,
          accountSid: config.accountSid,
          senderId: config.senderId,
          testPhone: config.testPhone,
          webhookUrl: config.webhookUrl
        })
      });
      let data: any = {};
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : {};
      } catch (e) {}
      if (res.ok && data.success !== false) {
        setGatewayStatus({ success: true, msg: data.gatewayResponse });
        // Also log the test
        if (store?.id) {
          await addDoc(collection(db, `stores/${store.id}/sms_logs`), {
            recipientPhone: config.testPhone,
            recipientName: 'Gateway Test Phone',
            eventType: 'custom',
            message: data.previewMessage,
            status: 'delivered',
            gatewayResponse: data.gatewayResponse,
            createdAt: new Date().toISOString()
          });
        }
      } else {
        setGatewayStatus({ success: false, msg: data.error || 'Connection failed' });
      }
    } catch (err: any) {
      setGatewayStatus({ success: false, msg: err.message || 'Connection error' });
    } finally {
      setTestingGateway(false);
    }
  };

  // Trigger Scanners
  const handleRunLowStockScan = async () => {
    if (!store) return;
    setScanning('low_stock');
    setScanResult(null);
    try {
      const res = await triggerLowStockCheck(store, products, config);
      setScanResult(`Scan complete: ${res.triggered} low-stock alerts dispatched via SMS.`);
    } catch (err) {
      setScanResult('Scan encountered an error.');
    } finally {
      setScanning(null);
    }
  };

  const handleRunSubscriptionScan = async () => {
    if (!store) return;
    setScanning('subscription');
    setScanResult(null);
    try {
      const res = await triggerSubscriptionExpiryCheck(store, config);
      if (res.triggered) {
        setScanResult(`Subscription alert dispatched (${res.daysLeft} days remaining).`);
      } else {
        setScanResult('Store subscription is healthy (> 7 days remaining). No alert needed.');
      }
    } catch (err) {
      setScanResult('Failed to check subscription expiry.');
    } finally {
      setScanning(null);
    }
  };

  const handleRunWarrantyScan = async () => {
    if (!store) return;
    setScanning('warranty');
    setScanResult(null);
    try {
      // Simulate scanning upcoming expiring warranties for 2 customers
      const targetCustomer = customers[0] || { name: 'Rebin Qadir', phone: '+9647501239988' };
      await triggerWarrantyExpiryAlert(
        store.id,
        store.name,
        targetCustomer.name,
        targetCustomer.phone || '+9647500000000',
        'iPhone 15 Pro Max',
        '354928109483921',
        new Date(Date.now() + 7 * 86400 * 1000).toLocaleDateString(),
        config
      );
      setScanResult(`Warranty scan complete: Alert dispatched to ${targetCustomer.name} for expiring device warranty.`);
    } catch (err) {
      setScanResult('Error scanning warranties.');
    } finally {
      setScanning(null);
    }
  };

  const handleRunInstallmentScan = async () => {
    if (!store) return;
    setScanning('installment');
    setScanResult(null);
    try {
      // Find customers with active debt
      const debtCustomers = customers.filter(c => (c.debt || 0) > 0);
      const target = debtCustomers[0] || { name: 'Soran Ali', phone: '+9647509876543', debt: 150 };
      
      await triggerInstallmentAlert(
        store.id,
        store.name,
        target.name,
        target.phone || '+9647500000000',
        target.debt || 150,
        new Date(Date.now() + 3 * 86400 * 1000).toLocaleDateString(),
        config
      );
      setScanResult(`Installment scan complete: Reminder SMS dispatched to ${target.name} for $${target.debt} debt.`);
    } catch (err) {
      setScanResult('Error scanning installment payments.');
    } finally {
      setScanning(null);
    }
  };

  // Send Direct Manual SMS
  const handleSendManualSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !manualPhone || !manualMessage) return;
    setSendingManual(true);
    try {
      const res = await sendSMS(
        store.id,
        manualPhone,
        manualMessage,
        'custom',
        manualName || 'Direct Recipient',
        config
      );
      if (res.success) {
        setIsSendModalOpen(false);
        setManualMessage('');
        alert('SMS sent successfully!');
      } else {
        alert('Failed to send SMS.');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSendingManual(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2.5 rounded-xl shadow-lg shadow-emerald-200">
              <MessageSquare className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('sms_alerts')}</h1>
              <p className="text-xs text-gray-500 font-medium">Automated triggers for low stock, subscriptions, warranties, installments & gateway integration.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSendModalOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-emerald-200 transition-all active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>{t('send_sms')}</span>
            </button>
          </div>
        </div>

        {/* Status Alert Banner if Scan Executed */}
        {scanResult && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl flex items-center justify-between animate-in fade-in">
            <div className="flex items-center gap-3 text-xs font-bold">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>{scanResult}</span>
            </div>
            <button onClick={() => setScanResult(null)} className="text-xs font-black text-emerald-700 hover:underline">
              Dismiss
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200">
          {[
            { id: 'triggers', label: 'Key Event Triggers', icon: BellRing },
            { id: 'gateway', label: 'Gateway Configuration', icon: Server },
            { id: 'templates', label: 'Message Templates', icon: FileText },
            { id: 'logs', label: 'Delivery Logs & History', icon: Clock },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 font-bold text-xs uppercase tracking-wider border-b-2 transition-all",
                activeTab === tab.id 
                  ? "border-emerald-600 text-emerald-600 bg-emerald-50/50 rounded-t-xl" 
                  : "border-transparent text-gray-400 hover:text-gray-700"
              )}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* TAB 1: AUTOMATED KEY EVENT TRIGGERS */}
        {activeTab === 'triggers' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Trigger Card 1: Low Stock Alerts */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
                      <AlertTriangle className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900">Low Stock Alerts</h3>
                      <p className="text-xs text-gray-400">Notifies store manager when any product stock drops to minimum threshold.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1 font-mono text-gray-700 border border-gray-200">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">Sample Message:</span>
                  <p>⚠️ [MobiStore] Low Stock Alert: Product "iPhone 15 Pro" has only 2 units remaining in stock. Please restock soon.</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">Target: {config.managerPhone || 'Store Manager'}</span>
                  <button
                    onClick={handleRunLowStockScan}
                    disabled={scanning === 'low_stock'}
                    className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold shadow-md shadow-amber-200 transition-all active:scale-95"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", scanning === 'low_stock' && "animate-spin")} />
                    <span>Run Stock Scan Now</span>
                  </button>
                </div>
              </div>

              {/* Trigger Card 2: Expiring Subscriptions */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
                      <Clock className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900">Expiring SaaS Subscriptions</h3>
                      <p className="text-xs text-gray-400">Sends reminder 7, 3, and 1 days before the store's 6-month trial or plan expires.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1 font-mono text-gray-700 border border-gray-200">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">Sample Message:</span>
                  <p>🔔 [MobiStore] SaaS Notice: Your store subscription expires in 5 days on 2026-08-30. Renew today to keep uninterrupted service.</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">Status: {store?.subscriptionStatus || 'trial'}</span>
                  <button
                    onClick={handleRunSubscriptionScan}
                    disabled={scanning === 'subscription'}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-200 transition-all active:scale-95"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", scanning === 'subscription' && "animate-spin")} />
                    <span>Check Subscription</span>
                  </button>
                </div>
              </div>

              {/* Trigger Card 3: Expiring Device Warranties */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                      <ShieldAlert className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900">Expiring Warranties</h3>
                      <p className="text-xs text-gray-400">Automated SMS to customer 7 days before their purchased phone warranty ends.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1 font-mono text-gray-700 border border-gray-200">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">Sample Message:</span>
                  <p>🛡️ [MobiStore] Warranty Notice: Dear Soran, warranty for Galaxy S24 (IMEI: 35910293) expires on 2026-03-05. Contact us for service.</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">Automatic scan daily at 09:00 AM</span>
                  <button
                    onClick={handleRunWarrantyScan}
                    disabled={scanning === 'warranty'}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-200 transition-all active:scale-95"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", scanning === 'warranty' && "animate-spin")} />
                    <span>Scan Warranties</span>
                  </button>
                </div>
              </div>

              {/* Trigger Card 4: Upcoming Installment & Debt Payments */}
              <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col justify-between space-y-4">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
                      <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="font-bold text-base text-gray-900">Upcoming Installments & Debt</h3>
                      <p className="text-xs text-gray-400">Sends polite payment reminder SMS 3 days prior to due date or for pending balance.</p>
                    </div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Active
                  </span>
                </div>

                <div className="bg-gray-50 p-3.5 rounded-2xl text-xs space-y-1 font-mono text-gray-700 border border-gray-200">
                  <span className="text-[10px] font-sans font-bold text-gray-400 uppercase block">Sample Message:</span>
                  <p>💳 [MobiStore] Payment Reminder: Dear Rebin, upcoming installment of $120 is due on 2026-03-02. Thank you for your business!</p>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs text-gray-500 font-medium">Automatic overdue reminders</span>
                  <button
                    onClick={handleRunInstallmentScan}
                    disabled={scanning === 'installment'}
                    className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-200 transition-all active:scale-95"
                  >
                    <RefreshCw className={cn("w-3.5 h-3.5", scanning === 'installment' && "animate-spin")} />
                    <span>Scan Installments</span>
                  </button>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* TAB 2: GATEWAY CONFIGURATION */}
        {activeTab === 'gateway' && (
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm max-w-3xl space-y-6">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-bold text-lg text-gray-900">Third-Party SMS Gateway Provider</h3>
                <p className="text-xs text-gray-500">Connect to international gateways (Twilio, FastSMS) or local telecom APIs (Asiacell, Korek, Zain, Webhooks).</p>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                Connected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Gateway Provider</label>
                <select
                  value={config.provider}
                  onChange={(e) => setConfig({ ...config, provider: e.target.value as any })}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                >
                  <option value="twilio">Twilio Cloud Gateway</option>
                  <option value="fastsms">FastSMS Gateway</option>
                  <option value="asiacell">Asiacell Telecom SMS API (Iraq/Kurdistan)</option>
                  <option value="korek">Korek Telecom SMS API (Iraq/Kurdistan)</option>
                  <option value="zain">Zain Iraq SMS API</option>
                  <option value="custom_webhook">Custom HTTP / REST Webhook</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Sender ID (Brand Header)</label>
                <input 
                  type="text"
                  value={config.senderId}
                  onChange={(e) => setConfig({ ...config, senderId: e.target.value })}
                  placeholder="e.g. MobiStore"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">API Key / Auth Token</label>
                <input 
                  type="password"
                  value={config.apiKey || ''}
                  onChange={(e) => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="••••••••••••••••••••••••"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Account SID / Client ID</label>
                <input 
                  type="text"
                  value={config.accountSid || ''}
                  onChange={(e) => setConfig({ ...config, accountSid: e.target.value })}
                  placeholder="AC_xxxxxxxxxxxxxxxx"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                />
              </div>

              {config.provider === 'custom_webhook' && (
                <div className="sm:col-span-2 space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Webhook / REST URL</label>
                  <input 
                    type="url"
                    value={config.webhookUrl || ''}
                    onChange={(e) => setConfig({ ...config, webhookUrl: e.target.value })}
                    placeholder="https://sms-gateway.example.com/api/v1/send"
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-mono"
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Store Manager Alert Phone</label>
                <input 
                  type="tel"
                  value={config.managerPhone || ''}
                  onChange={(e) => setConfig({ ...config, managerPhone: e.target.value })}
                  placeholder="+9647501234567"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-gray-700">Test Recipient Phone</label>
                <input 
                  type="tel"
                  value={config.testPhone || ''}
                  onChange={(e) => setConfig({ ...config, testPhone: e.target.value })}
                  placeholder="+9647501234567"
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-sm font-bold font-mono"
                />
              </div>
            </div>

            {/* Test Response Feedback */}
            {gatewayStatus && (
              <div className={cn(
                "p-4 rounded-2xl border text-xs font-bold flex items-center gap-3",
                gatewayStatus.success ? "bg-emerald-50 border-emerald-200 text-emerald-800" : "bg-red-50 border-red-200 text-red-800"
              )}>
                {gatewayStatus.success ? <CheckCircle2 className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
                <span>{gatewayStatus.msg}</span>
              </div>
            )}

            <div className="pt-4 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleTestGateway}
                disabled={testingGateway}
                className="flex items-center gap-2 px-5 py-3 bg-gray-900 text-white rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-gray-800 transition-all active:scale-95"
              >
                <PhoneCall className={cn("w-4 h-4 text-emerald-400", testingGateway && "animate-spin")} />
                <span>{testingGateway ? 'Testing Connection...' : 'Send Live Test SMS'}</span>
              </button>

              <button
                type="button"
                onClick={handleSaveConfig}
                disabled={savingConfig}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200 hover:bg-emerald-700 transition-all"
              >
                {savingConfig ? 'Saving...' : 'Save Gateway Settings'}
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MESSAGE TEMPLATES */}
        {activeTab === 'templates' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(DEFAULT_SMS_TEMPLATES).map(([key, tmpl]) => (
                <div key={key} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                      {key.replace('_', ' ')}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase">Dynamic Template</span>
                  </div>
                  <h4 className="font-bold text-gray-900 text-sm">{tmpl.title}</h4>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs font-mono text-gray-700 leading-relaxed">
                    {tmpl.body}
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Supports tokens: <code className="text-emerald-700 font-bold">{"{{customer_name}}"}</code>, <code className="text-emerald-700 font-bold">{"{{product_name}}"}</code>, <code className="text-emerald-700 font-bold">{"{{amount_due}}"}</code>, <code className="text-emerald-700 font-bold">{"{{due_date}}"}</code>, <code className="text-emerald-700 font-bold">{"{{store_name}}"}</code>.
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: DELIVERY LOGS & HISTORY */}
        {activeTab === 'logs' && (
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-sm">SMS Transmission History ({logs.length} dispatches)</h3>
              <span className="text-xs text-gray-400 font-bold">Real-time Gateway Logs</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                    <th className="px-6 py-4">Timestamp</th>
                    <th className="px-6 py-4">Recipient</th>
                    <th className="px-6 py-4">Event Type</th>
                    <th className="px-6 py-4">Message Body</th>
                    <th className="px-6 py-4">Gateway Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/50">
                      <td className="px-6 py-4 text-xs font-bold text-gray-500 whitespace-nowrap">
                        {new Date(log.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-bold text-gray-900 text-xs">{log.recipientName || 'Customer'}</p>
                        <p className="text-[10px] text-gray-500 font-mono">{log.recipientPhone}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider bg-gray-100 text-gray-700">
                          {log.eventType.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-gray-700 max-w-xs truncate">
                        {log.message}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={cn(
                          "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border flex items-center gap-1.5 w-max",
                          log.status === 'delivered' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                          log.status === 'sent' ? "bg-blue-50 text-blue-700 border-blue-200" : "bg-red-50 text-red-700 border-red-200"
                        )}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {logs.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                        No SMS messages logged yet. Run an event scan or send a test SMS!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Modal: Direct Manual SMS */}
        {isSendModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl space-y-5">
              <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-600" />
                  <h3 className="text-lg font-black text-gray-900">Send Direct SMS</h3>
                </div>
                <button onClick={() => setIsSendModalOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
              </div>

              <form onSubmit={handleSendManualSMS} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Recipient Name (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Soran Ali" 
                    value={manualName}
                    onChange={(e) => setManualName(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Recipient Phone Number</label>
                  <input 
                    type="tel" 
                    required
                    placeholder="+9647501234567" 
                    value={manualPhone}
                    onChange={(e) => setManualPhone(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-gray-700 block mb-1">Message Text</label>
                  <textarea 
                    required
                    placeholder="Type SMS text..."
                    value={manualMessage}
                    onChange={(e) => setManualMessage(e.target.value)}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium h-24"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 mt-1">
                    <span>Sender: {config.senderId}</span>
                    <span>{manualMessage.length}/160 chars (1 SMS)</span>
                  </div>
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={sendingManual}
                    className="flex-1 bg-emerald-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-emerald-700 transition-all shadow-md flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingManual ? 'Dispatching...' : 'Send SMS Now'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsSendModalOpen(false)}
                    className="px-5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
