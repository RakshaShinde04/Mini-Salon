'use client';

import React, { useState } from 'react';
import { Navbar, TabType } from '@/components/Navbar';
import { BookingForm } from '@/components/BookingForm';
import { CustomerManageBooking } from '@/components/CustomerManageBooking';
import { AdminDashboard } from '@/components/AdminDashboard';
import { BillingPOS } from '@/components/BillingPOS';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { Scissors, Sparkles, MapPin, Phone, Clock, ShieldCheck, Heart } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('booking');
  const [managePhone, setManagePhone] = useState<string>('');

  // Pre-fill state when transitioning from Admin to Billing POS
  const [billingCustomer, setBillingCustomer] = useState<{
    name: string;
    phone: string;
    service: string;
  }>({ name: '', phone: '', service: '' });

  // Navigate to Manage tab with customer phone prefilled
  const handleNavigateToManage = (phone?: string) => {
    if (phone) setManagePhone(phone);
    setActiveTab('manage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Navigate to Billing tab with customer booking details
  const handleOpenBillingForBooking = (booking: any) => {
    setBillingCustomer({
      name: booking.customer_name,
      phone: booking.phone,
      service: booking.service,
    });
    setActiveTab('billing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-black">
      {/* Top Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'booking' && (
          <BookingForm onNavigateToManage={handleNavigateToManage} />
        )}

        {activeTab === 'manage' && (
          <CustomerManageBooking
            initialPhone={managePhone}
            onBookNew={() => setActiveTab('booking')}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard onOpenBillingForBooking={handleOpenBillingForBooking} />
        )}

        {activeTab === 'billing' && (
          <BillingPOS
            initialCustomerName={billingCustomer.name}
            initialCustomerPhone={billingCustomer.phone}
            initialServiceName={billingCustomer.service}
          />
        )}
      </main>

      {/* Luxury Salon Footer */}
      <footer className="glass-panel border-t border-slate-800/80 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Salon Info */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-bold">
                  <Scissors className="w-4 h-4 -rotate-45" />
                </div>
                <span className="font-extrabold text-lg tracking-wider text-white">
                  LUMIÈRE SALON
                </span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Premium grooming, skin rejuvenation, and bridal makeup services. Crafted for perfection and timeless elegance.
              </p>
            </div>

            {/* Timings */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Salon Timings
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Monday – Sunday: 9:00 AM – 8:00 PM
              </p>
              <p className="text-[11px] text-emerald-400">Open 7 days a week</p>
            </div>

            {/* Location & Contact */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Location & Contact
              </h4>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                42 Hill Road, Bandra West, Mumbai 400050
              </p>
              <p className="text-xs text-slate-300 flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                +91 98765 43210
              </p>
            </div>

            {/* Quick Switch */}
            <div className="space-y-2">
              <h4 className="text-xs uppercase tracking-wider font-bold text-amber-400">
                Quick Navigation
              </h4>
              <div className="flex flex-col gap-1.5 text-xs text-slate-400">
                <button
                  onClick={() => setActiveTab('booking')}
                  className="text-left hover:text-amber-400 transition-colors"
                >
                  • Book Online Appointment
                </button>
                <button
                  onClick={() => setActiveTab('manage')}
                  className="text-left hover:text-amber-400 transition-colors"
                >
                  • Reschedule or Cancel Booking
                </button>
                <button
                  onClick={() => setActiveTab('admin')}
                  className="text-left hover:text-amber-400 transition-colors"
                >
                  • Staff & Admin Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('billing')}
                  className="text-left hover:text-amber-400 transition-colors"
                >
                  • Billing Terminal & Invoices
                </button>
              </div>
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
            <p>© 2026 Lumière Salon & Spa. All rights reserved.</p>
            <p className="flex items-center gap-1 text-slate-400">
              Mini Salon Booking & Billing System • Powered by Next.js & AI
            </p>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
