'use client';

import React, { useState, useEffect } from 'react';
import { Navbar, TabType } from '@/components/Navbar';
import { LuxeHero } from '@/components/LuxeHero';
import { LuxeServices } from '@/components/LuxeServices';
import { LuxeBeforeAfter } from '@/components/LuxeBeforeAfter';
import { LuxeLookbook } from '@/components/LuxeLookbook';
import { BookingForm } from '@/components/BookingForm';
import { CustomerManageBooking } from '@/components/CustomerManageBooking';
import { AdminDashboard } from '@/components/AdminDashboard';
import { AdminLogin } from '@/components/AdminLogin';
import { BillingPOS } from '@/components/BillingPOS';
import { ChatbotWidget } from '@/components/ChatbotWidget';
import { MapPin, Phone, Clock } from 'lucide-react';

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabType>('booking');
  const [managePhone, setManagePhone] = useState<string>('');
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState<boolean>(false);
  const [selectedPresetService, setSelectedPresetService] = useState<string>('');

  // Check saved admin session on mount
  useEffect(() => {
    try {
      const isAuth = localStorage.getItem('lumiere_admin_auth') === 'true';
      if (isAuth) {
        setIsAdminLoggedIn(true);
      }
    } catch (e) {}
  }, []);

  const handleAdminLogout = () => {
    try {
      localStorage.removeItem('lumiere_admin_auth');
      localStorage.removeItem('lumiere_admin_user');
    } catch (e) {}
    setIsAdminLoggedIn(false);
  };

  const handleNavigateToManage = (phone?: string) => {
    if (phone) setManagePhone(phone);
    setActiveTab('manage');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleScrollToBooking = () => {
    setActiveTab('booking');
    setTimeout(() => {
      const el = document.getElementById('booking-form-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleSelectService = (serviceName: string) => {
    setSelectedPresetService(serviceName);
    setActiveTab('booking');
    setTimeout(() => {
      const el = document.getElementById('booking-form-anchor');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const handleScrollToSection = (sectionId: string) => {
    const el = document.getElementById(sectionId);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const [billingCustomer, setBillingCustomer] = useState<{
    name: string;
    phone: string;
    service: string;
  }>({ name: '', phone: '', service: '' });

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
    <div className="min-h-screen flex flex-col bg-[#F8F3ED] text-[#1A1412] selection:bg-[#E892A2] selection:text-white">
      {/* Top Luxe Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdminLoggedIn={isAdminLoggedIn}
        onLogout={handleAdminLogout}
        onScrollToSection={handleScrollToSection}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {activeTab === 'booking' && (
          <>
            {/* LUXE Editorial Hero Section */}
            <LuxeHero onBookClick={handleScrollToBooking} />

            {/* LUXE 3-Card Photographic Services (CUT, COLOR, STYLE) */}
            <LuxeServices onSelectService={handleSelectService} />

            {/* LUXE Interactive Before & After Transformation Slider */}
            <LuxeBeforeAfter onSeeMoreClick={handleScrollToBooking} />

            {/* LUXE Insta Glam Lookbook Gallery */}
            <LuxeLookbook onBookClick={handleScrollToBooking} />

            {/* Core Functional Booking Form with Smart Slots */}
            <BookingForm
              onNavigateToManage={handleNavigateToManage}
              presetService={selectedPresetService}
            />
          </>
        )}

        {activeTab === 'manage' && (
          <CustomerManageBooking
            initialPhone={managePhone}
            onBookNew={() => {
              setActiveTab('booking');
              handleScrollToBooking();
            }}
          />
        )}

        {activeTab === 'admin' &&
          (isAdminLoggedIn ? (
            <AdminDashboard
              onOpenBillingForBooking={handleOpenBillingForBooking}
              onLogout={handleAdminLogout}
            />
          ) : (
            <AdminLogin
              onLoginSuccess={() => setIsAdminLoggedIn(true)}
              onCancel={() => setActiveTab('booking')}
            />
          ))}

        {activeTab === 'billing' && (
          <BillingPOS
            initialCustomerName={billingCustomer.name}
            initialCustomerPhone={billingCustomer.phone}
            initialServiceName={billingCustomer.service}
          />
        )}
      </main>

      {/* LUXE Dark Espresso Footer matching reference */}
      <footer className="bg-[#1A1412] text-[#A69791] text-xs py-8 px-4 sm:px-6 lg:px-8 border-t border-[#2E2522]">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold tracking-widest uppercase">
            <span className="text-[#E892A2]">✦</span>
            <span>LUXE HAIR STUDIO</span>
          </div>

          <div className="text-center text-[11px] text-[#8C7A73]">
            © 2026 LUXE Hair Studio. All Rights Reserved.
          </div>

          <div className="flex items-center gap-4 text-[11px] font-bold tracking-widest uppercase">
            <span>FOLLOW US</span>
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="text-white hover:text-[#E892A2] transition-colors" aria-label="Instagram">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-3.5 h-3.5"
              >
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      {/* Floating AI Chatbot Widget */}
      <ChatbotWidget />
    </div>
  );
}
