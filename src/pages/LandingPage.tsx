import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'motion/react';
import { 
  Smartphone, 
  ShieldCheck, 
  BarChart3, 
  Users, 
  Zap, 
  CheckCircle,
  Globe,
  ArrowRight,
  ShoppingCart,
  Package
} from 'lucide-react';

export default function LandingPage() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-black text-gray-900 tracking-tighter">MobiStore Pro</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Features</a>
            <a href="#pricing" className="text-gray-600 font-medium hover:text-blue-600 transition-colors">Pricing</a>
            <Link to="/login" className="bg-gray-900 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 bg-blue-50 text-blue-600 px-4 py-2 rounded-full text-sm font-bold mb-8"
          >
            <Zap className="w-4 h-4 fill-current" />
            Empowering 500+ Mobile Stores Worldwide
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8"
          >
            The All-in-One <span className="text-blue-600">SaaS</span> for <br />
            Modern Phone Shops.
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-500 max-w-2xl mx-auto mb-12"
          >
            Manage inventory, track IMEIs, generate invoices, and analyze profits with the most powerful management system designed specifically for electronics retail.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link to="/login" className="w-full sm:w-auto bg-blue-600 text-white px-10 py-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transition-all shadow-xl shadow-blue-200 flex items-center justify-center gap-2">
              Start Your 6-Month Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white text-gray-900 border-2 border-gray-100 px-10 py-5 rounded-2xl font-bold text-lg hover:border-blue-600 hover:text-blue-600 transition-all">
              Watch Demo
            </a>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
          {[
            { label: 'Active Stores', value: '1,200+' },
            { label: 'Transactions', value: '$45M+' },
            { label: 'Uptime', value: '99.99%' },
            { label: 'Customer Support', value: '24/7' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-4xl font-black text-gray-900 mb-2">{stat.value}</div>
              <div className="text-gray-500 font-medium">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl font-black text-gray-900 mb-4">Built for Mobile Experts</h2>
            <p className="text-gray-500 text-lg">Every tool you need to scale your retail business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { 
                title: 'Smart Inventory', 
                desc: 'Real-time tracking with IMEI & Barcode support. Never lose a serial number again.',
                icon: Package
              },
              { 
                title: 'Professional POS', 
                desc: 'Fast, secure, and intuitive sales terminal with multi-payment support.',
                icon: ShoppingCart
              },
              { 
                title: 'Advanced Analytics', 
                desc: 'Visual reports on sales, profits, and top-selling products for every branch.',
                icon: BarChart3
              },
              { 
                title: 'Multi-Branch', 
                desc: 'Manage multiple locations from a single master dashboard. Synchronized data.',
                icon: Globe
              },
              { 
                title: 'Role Permissions', 
                desc: 'Fine-grained access control for managers, cashiers, and warehouse staff.',
                icon: Users
              },
              { 
                title: 'Cloud Security', 
                desc: 'Enterprise-grade data protection with automatic daily backups.',
                icon: ShieldCheck
              }
            ].map((f, i) => (
              <motion.div 
                key={f.title}
                whileHover={{ y: -10 }}
                className="p-10 rounded-3xl bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all"
              >
                <div className="bg-blue-50 w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <f.icon className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">{f.title}</h3>
                <p className="text-gray-500 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-32 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] opacity-20 -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-600 rounded-full blur-[150px] opacity-20 translate-y-1/2 -translate-x-1/2" />
        
        <div className="max-w-7xl mx-auto px-4 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black mb-6 tracking-tight">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-xl">Start with 6 months for free. No credit card required.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { name: 'Standard (3 Mo)', price: '$89', features: ['All Core Features', 'Up to 2 Branches', '5 Employees', 'IMEI Tracking'] },
              { name: 'Professional (6 Mo)', price: '$159', features: ['All Core Features', 'Up to 5 Branches', '15 Employees', 'Advanced Analytics'], popular: true },
              { name: 'Enterprise (1 Yr)', price: '$299', features: ['Unlimited Everything', 'Custom Branding', 'Priority Support', 'API Access'] }
            ].map((plan) => (
              <div 
                key={plan.name}
                className={cn(
                  "p-10 rounded-3xl border transition-all",
                  plan.popular ? "bg-blue-600 border-blue-500 shadow-2xl scale-105" : "bg-gray-800/50 border-gray-700"
                )}
              >
                {plan.popular && <div className="bg-white text-blue-600 text-xs font-black uppercase tracking-widest px-4 py-1 rounded-full w-fit mb-6">Most Popular</div>}
                <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-2 mb-8">
                  <span className="text-5xl font-black">{plan.price}</span>
                  <span className="text-gray-400 font-medium">/period</span>
                </div>
                <div className="space-y-4 mb-10">
                  {plan.features.map(feat => (
                    <div key={feat} className="flex items-center gap-3">
                      <CheckCircle className={cn("w-5 h-5", plan.popular ? "text-white" : "text-blue-500")} />
                      <span className="text-gray-300">{feat}</span>
                    </div>
                  ))}
                </div>
                <Link 
                  to="/login"
                  className={cn(
                    "w-full py-4 rounded-2xl font-bold text-center block transition-all shadow-lg",
                    plan.popular ? "bg-white text-blue-600 hover:bg-gray-100" : "bg-blue-600 text-white hover:bg-blue-700 shadow-blue-900"
                  )}
                >
                  Start Now
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <Smartphone className="w-8 h-8 text-blue-600" />
            <span className="text-2xl font-black text-gray-900 tracking-tighter">MobiStore Pro</span>
          </div>
          <p className="text-gray-500">© 2026 MobiStore SaaS Platform. All rights reserved.</p>
          <div className="flex gap-6 text-gray-400">
            <a href="#" className="hover:text-blue-600">Twitter</a>
            <a href="#" className="hover:text-blue-600">LinkedIn</a>
            <a href="#" className="hover:text-blue-600">Privacy</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

