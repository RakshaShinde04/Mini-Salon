'use client';

import React from 'react';
import { Scissors, Calendar, Clock, ShieldCheck, Receipt, Sparkles, PhoneCall } from 'lucide-react';

export type TabType = 'booking' | 'manage' | 'admin' | 'billing';

interface NavbarProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  return (
    <header className="sticky top-0 z-40 glass-panel border-b border-amber-500/20 shadow-lg shadow-black/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Brand */}
          <div
            onClick={() => setActiveTab('booking')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-300 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-all duration-300">
              <Scissors className="w-6 h-6 text-slate-950 -rotate-45" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-2xl tracking-wider text-slate-100 uppercase">
                  Lumière
                </span>
                <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
              </div>
              <p className="text-xs font-medium text-amber-400/80 tracking-widest uppercase">
                Luxury Salon & Spa
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              id="nav-book"
              onClick={() => setActiveTab('booking')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'booking'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Calendar className="w-4 h-4" />
              Book Appointment
            </button>

            <button
              id="nav-manage"
              onClick={() => setActiveTab('manage')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'manage'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Clock className="w-4 h-4" />
              My Bookings
            </button>

            <button
              id="nav-admin"
              onClick={() => setActiveTab('admin')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'admin'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Admin Portal
            </button>

            <button
              id="nav-billing"
              onClick={() => setActiveTab('billing')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                activeTab === 'billing'
                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 shadow-md shadow-amber-500/20'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Receipt className="w-4 h-4" />
              Billing & Invoicing
            </button>
          </nav>

          {/* Salon Status & Call Pill */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col items-end text-xs">
              <span className="flex items-center gap-1.5 font-medium text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                Open Today: 9 AM - 8 PM
              </span>
              <span className="text-slate-400">Bandra West, Mumbai</span>
            </div>

            <a
              href="tel:+919876543210"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 transition-all"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Call Salon</span>
            </a>
          </div>
        </div>

        {/* Mobile Navigation Tabs Bar */}
        <div className="md:hidden flex items-center justify-around py-2.5 border-t border-slate-800/80 gap-1 overflow-x-auto">
          <button
            onClick={() => setActiveTab('booking')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'booking' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Calendar className="w-4 h-4" />
            Book
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'manage' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Clock className="w-4 h-4" />
            Lookup
          </button>
          <button
            onClick={() => setActiveTab('admin')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'admin' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            Admin
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap ${
              activeTab === 'billing' ? 'text-amber-400 font-bold' : 'text-slate-400'
            }`}
          >
            <Receipt className="w-4 h-4" />
            Billing
          </button>
        </div>
      </div>
    </header>
  );
};
