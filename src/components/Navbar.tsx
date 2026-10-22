'use client';

import React from 'react';
import { Sparkles, Lock, ShieldCheck, LogOut, Scissors, Phone } from 'lucide-react';

export type TabType = 'booking' | 'manage' | 'admin' | 'billing';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  isAdminLoggedIn?: boolean;
  onLogout?: () => void;
  onScrollToSection?: (sectionId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  isAdminLoggedIn = false,
  onLogout,
  onScrollToSection,
}) => {
  const handleNavClick = (tab: TabType, sectionId?: string) => {
    setActiveTab(tab);
    if (sectionId && onScrollToSection) {
      setTimeout(() => onScrollToSection(sectionId), 100);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#F8F3ED]/90 backdrop-blur-md border-b border-[#E8DDD4] shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* LUXE Brand Logo matching reference */}
          <div
            onClick={() => handleNavClick('booking')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div>
              <div className="flex items-baseline gap-1">
                <span className="font-editorial text-3xl font-black tracking-widest text-[#1A1412] uppercase leading-none">
                  LUXE
                </span>
                <span className="text-[#E892A2] text-xs font-bold leading-none">+</span>
              </div>
              <p className="text-[11px] font-serif italic text-[#8C7A73] tracking-widest -mt-0.5">
                Hair Studio
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold uppercase tracking-wider text-[#5A4E49]">
            <button
              onClick={() => handleNavClick('booking')}
              className={`hover:text-[#1A1412] transition-colors ${
                activeTab === 'booking' ? 'text-[#1A1412] font-black underline underline-offset-8 decoration-[#E892A2] decoration-2' : ''
              }`}
            >
              Home
            </button>

            <button
              onClick={() => handleNavClick('booking', 'services-section')}
              className="hover:text-[#1A1412] transition-colors"
            >
              Services
            </button>

            <button
              onClick={() => handleNavClick('booking', 'transformation-section')}
              className="hover:text-[#1A1412] transition-colors"
            >
              Before & After
            </button>

            <button
              onClick={() => handleNavClick('booking', 'looks-section')}
              className="hover:text-[#1A1412] transition-colors"
            >
              Looks
            </button>

            <button
              onClick={() => handleNavClick('manage')}
              className={`hover:text-[#1A1412] transition-colors ${
                activeTab === 'manage' ? 'text-[#1A1412] font-black underline underline-offset-8 decoration-[#E892A2] decoration-2' : ''
              }`}
            >
              My Bookings
            </button>

            <button
              onClick={() => handleNavClick('admin')}
              className={`flex items-center gap-1.5 hover:text-[#1A1412] transition-colors ${
                activeTab === 'admin' ? 'text-[#1A1412] font-black underline underline-offset-8 decoration-[#E892A2] decoration-2' : ''
              }`}
            >
              {isAdminLoggedIn ? (
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              ) : (
                <Lock className="w-3.5 h-3.5 text-[#D4708A]" />
              )}
              Admin
            </button>

            <button
              onClick={() => handleNavClick('billing')}
              className={`hover:text-[#1A1412] transition-colors ${
                activeTab === 'billing' ? 'text-[#1A1412] font-black underline underline-offset-8 decoration-[#E892A2] decoration-2' : ''
              }`}
            >
              Billing
            </button>
          </nav>

          {/* Right Action: Pink Pill "BOOK YOUR LOOK" + Logout */}
          <div className="flex items-center gap-3">
            {isAdminLoggedIn && onLogout && (
              <button
                onClick={onLogout}
                className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors"
                title="Logout Admin"
              >
                <LogOut className="w-3 h-3" />
                <span>Logout</span>
              </button>
            )}

            <button
              id="nav-book-look-btn"
              onClick={() => handleNavClick('booking', 'booking-form-anchor')}
              className="px-6 py-2.5 rounded-full bg-[#F3B6C2] hover:bg-[#E892A2] text-[#1A1412] text-xs font-extrabold uppercase tracking-widest shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer border border-[#EAA2AF]"
            >
              Book Your Look
            </button>
          </div>
        </div>

        {/* Mobile Navigation Sub-bar */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-[#E8DDD4] text-xs font-bold uppercase tracking-wider overflow-x-auto gap-2">
          <button
            onClick={() => handleNavClick('booking')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'booking' ? 'bg-[#1A1412] text-white' : 'text-[#5A4E49]'
            }`}
          >
            Home
          </button>
          <button
            onClick={() => handleNavClick('booking', 'services-section')}
            className="px-2 py-1 text-[#5A4E49] whitespace-nowrap"
          >
            Services
          </button>
          <button
            onClick={() => handleNavClick('manage')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'manage' ? 'bg-[#1A1412] text-white' : 'text-[#5A4E49]'
            }`}
          >
            Bookings
          </button>
          <button
            onClick={() => handleNavClick('admin')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap flex items-center gap-1 ${
              activeTab === 'admin' ? 'bg-[#1A1412] text-white' : 'text-[#5A4E49]'
            }`}
          >
            {isAdminLoggedIn ? <ShieldCheck className="w-3 h-3 text-emerald-500" /> : <Lock className="w-3 h-3" />}
            Admin
          </button>
          <button
            onClick={() => handleNavClick('billing')}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap ${
              activeTab === 'billing' ? 'bg-[#1A1412] text-white' : 'text-[#5A4E49]'
            }`}
          >
            Billing
          </button>
        </div>
      </div>
    </header>
  );
};
