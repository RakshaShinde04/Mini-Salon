'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  User,
  Phone,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Filter,
  RefreshCw,
  Search,
  Receipt,
  ListFilter,
  CalendarDays,
  TrendingUp,
  DollarSign,
  ChevronDown,
  LogOut,
} from 'lucide-react';

interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
  status: 'Pending' | 'Confirmed' | 'Done' | 'Cancelled';
  created_at: string;
}

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface AdminDashboardProps {
  onOpenBillingForBooking?: (booking: Booking) => void;
  onLogout?: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenBillingForBooking,
  onLogout,
}) => {
  const [todayStr, setTodayStr] = useState<string>('2026-10-21');
  const [selectedDate, setSelectedDate] = useState<string>('2026-10-21');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);
    setSelectedDate(today);
  }, []);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // View state: 'list' | 'calendar'
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Notification toast
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  // Fetch Services for pricing reference
  useEffect(() => {
    fetch('/api/services')
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setServices(json.data);
      })
      .catch(console.error);
  }, []);

  // Fetch Bookings with filters
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedDate && selectedDate !== 'ALL') {
        params.append('date', selectedDate);
      }
      if (selectedStatus && selectedStatus !== 'All') {
        params.append('status', selectedStatus);
      }
      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      const res = await fetch(`/api/bookings?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      }
    } catch (err) {
      console.error('Failed to load bookings:', err);
      showToast('Failed to load bookings from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [selectedDate, selectedStatus]);

  // Handle instant status change
  const handleStatusChange = async (bookingId: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        showToast(json.error || 'Failed to update status', 'error');
        return;
      }

      // Update in local state
      setBookings((prev) =>
        prev.map((b) => (b.id === bookingId ? { ...b, status: newStatus as any } : b))
      );
      showToast(`Booking #${bookingId} updated to ${newStatus}`);
    } catch (err) {
      showToast('Error updating booking status', 'error');
    }
  };

  // Metrics calculations
  const totalCount = bookings.length;
  const confirmedCount = bookings.filter((b) => b.status === 'Confirmed').length;
  const pendingCount = bookings.filter((b) => b.status === 'Pending').length;
  const doneCount = bookings.filter((b) => b.status === 'Done').length;

  const estimatedRevenue = bookings
    .filter((b) => b.status !== 'Cancelled')
    .reduce((sum, b) => {
      const s = services.find((srv) => srv.name === b.service);
      return sum + (s?.price || 200);
    }, 0);

  const formatSlotLabel = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  const operationalHours = [
    '09:00',
    '09:30',
    '10:00',
    '10:30',
    '11:00',
    '11:30',
    '12:00',
    '12:30',
    '13:00',
    '13:30',
    '14:00',
    '14:30',
    '15:00',
    '15:30',
    '16:00',
    '16:30',
    '17:00',
    '17:30',
    '18:00',
    '18:30',
    '19:00',
    '19:30',
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast alert */}
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl text-sm font-semibold shadow-2xl flex items-center gap-2.5 transition-all ${
            toast.type === 'success'
              ? 'bg-emerald-950 border border-emerald-500/40 text-emerald-300'
              : 'bg-rose-950 border border-rose-500/40 text-rose-300'
          }`}
        >
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400" />
          )}
          {toast.message}
        </div>
      )}

      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            Administrative Management
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Salon Operations & Bookings</h1>
          <p className="text-slate-400 text-sm">
            Live schedule, appointment status tracking, and instant billing terminal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchBookings()}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-all"
            title="Refresh bookings"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-amber-400' : ''}`} />
          </button>

          {/* View mode toggle */}
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'list'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              List View
            </button>
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'calendar'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarDays className="w-3.5 h-3.5" />
              Day Timeline View
            </button>
          </div>

          {onLogout && (
            <button
              id="btn-admin-logout"
              onClick={onLogout}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 transition-all cursor-pointer"
              title="Log out of Admin Portal"
            >
              <LogOut className="w-3.5 h-3.5" />
              Logout
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="glass-panel rounded-2xl p-4 border border-slate-800">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Total Bookings</span>
            <CalendarIcon className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-white">{totalCount}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">
            {selectedDate === 'ALL' ? 'All time' : selectedDate}
          </span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-emerald-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Confirmed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl font-black text-emerald-400">{confirmedCount}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Ready for service</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-amber-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Pending</span>
            <Clock className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl font-black text-amber-400">{pendingCount}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Awaiting check-in</span>
        </div>

        <div className="glass-panel rounded-2xl p-4 border border-blue-500/20">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-xs font-semibold">Completed</span>
            <Scissors className="w-4 h-4 text-blue-400" />
          </div>
          <span className="text-2xl font-black text-blue-400">{doneCount}</span>
          <span className="block text-[11px] text-slate-500 mt-0.5">Services done</span>
        </div>

        <div className="col-span-2 sm:col-span-1 glass-panel rounded-2xl p-4 border border-amber-500/30 bg-amber-500/5">
          <div className="flex items-center justify-between text-amber-400 mb-1">
            <span className="text-xs font-semibold">Est. Revenue</span>
            <TrendingUp className="w-4 h-4" />
          </div>
          <span className="text-2xl font-black text-amber-300">
            ₹{estimatedRevenue.toLocaleString('en-IN')}
          </span>
          <span className="block text-[11px] text-slate-400 mt-0.5">From active slots</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel rounded-2xl p-4 border border-slate-800 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Date Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setSelectedDate(todayStr)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDate === todayStr
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            Today&apos;s Bookings
          </button>
          <button
            onClick={() => setSelectedDate('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              selectedDate === 'ALL'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'bg-slate-900 text-slate-300 hover:bg-slate-800'
            }`}
          >
            All Dates
          </button>
          <input
            type="date"
            value={selectedDate === 'ALL' ? '' : selectedDate}
            onChange={(e) => setSelectedDate(e.target.value || 'ALL')}
            className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs"
          />
        </div>

        {/* Status Filter Tabs & Search */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['All', 'Pending', 'Confirmed', 'Done', 'Cancelled'].map((st) => (
              <button
                key={st}
                onClick={() => setSelectedStatus(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all ${
                  selectedStatus === st
                    ? 'bg-slate-800 text-amber-400 font-bold shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search customer / phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchBookings()}
              className="pl-9 pr-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500 focus:outline-none focus:border-amber-400 w-48 sm:w-56"
            />
          </div>
        </div>
      </div>

      {/* VIEW MODE 1: LIST / TABLE VIEW */}
      {viewMode === 'list' && (
        <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-900/90 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4 font-bold"># ID</th>
                  <th className="py-4 px-4 font-bold">Customer & Contact</th>
                  <th className="py-4 px-4 font-bold">Service</th>
                  <th className="py-4 px-4 font-bold">Date & Time</th>
                  <th className="py-4 px-4 font-bold">Status</th>
                  <th className="py-4 px-4 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-slate-500">
                      No bookings matching your active filters.
                    </td>
                  </tr>
                ) : (
                  bookings.map((b) => (
                    <tr
                      key={b.id}
                      className="hover:bg-slate-800/40 transition-colors group"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-amber-400">
                        #{b.id.toString().padStart(4, '0')}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-white">{b.customer_name}</div>
                        <a
                          href={`tel:${b.phone}`}
                          className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1 font-mono mt-0.5"
                        >
                          <Phone className="w-3 h-3" />
                          {b.phone}
                        </a>
                      </td>

                      <td className="py-3.5 px-4">
                        <span className="font-medium text-slate-200">{b.service}</span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="text-white font-medium">{b.date}</div>
                        <div className="text-xs text-amber-400 font-semibold">
                          {formatSlotLabel(b.time)}
                        </div>
                      </td>

                      {/* Status Dropdown */}
                      <td className="py-3.5 px-4">
                        <select
                          value={b.status}
                          onChange={(e) => handleStatusChange(b.id, e.target.value)}
                          className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border appearance-none cursor-pointer focus:outline-none transition-colors ${
                            b.status === 'Confirmed'
                              ? 'bg-emerald-950/80 text-emerald-400 border-emerald-500/40'
                              : b.status === 'Pending'
                              ? 'bg-amber-950/80 text-amber-400 border-amber-500/40'
                              : b.status === 'Done'
                              ? 'bg-blue-950/80 text-blue-400 border-blue-500/40'
                              : 'bg-rose-950/80 text-rose-400 border-rose-500/40'
                          }`}
                        >
                          <option value="Pending" className="bg-slate-900 text-amber-400">
                            Pending
                          </option>
                          <option value="Confirmed" className="bg-slate-900 text-emerald-400">
                            Confirmed
                          </option>
                          <option value="Done" className="bg-slate-900 text-blue-400">
                            Done
                          </option>
                          <option value="Cancelled" className="bg-slate-900 text-rose-400">
                            Cancelled
                          </option>
                        </select>
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Quick Confirm */}
                          {b.status === 'Pending' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Confirmed')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20"
                              title="Confirm Booking"
                            >
                              Confirm
                            </button>
                          )}

                          {/* Quick Mark Done */}
                          {b.status === 'Confirmed' && (
                            <button
                              onClick={() => handleStatusChange(b.id, 'Done')}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20"
                              title="Mark as Completed"
                            >
                              Complete
                            </button>
                          )}

                          {/* Send to Billing */}
                          {onOpenBillingForBooking && b.status !== 'Cancelled' && (
                            <button
                              onClick={() => onOpenBillingForBooking(b)}
                              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 flex items-center gap-1"
                              title="Generate Invoice in Billing POS"
                            >
                              <Receipt className="w-3.5 h-3.5" />
                              Bill
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VIEW MODE 2: DAY TIMELINE / CALENDAR VIEW */}
      {viewMode === 'calendar' && (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-2xl">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div>
              <h3 className="font-bold text-white text-lg flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-amber-400" />
                Schedule for {selectedDate === 'ALL' ? todayStr : selectedDate}
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Hour-by-hour operational slot assignments
              </p>
            </div>
            <span className="text-xs text-slate-400">
              {bookings.filter((b) => b.status !== 'Cancelled').length} Booked Slots
            </span>
          </div>

          <div className="space-y-3">
            {operationalHours.map((time) => {
              const bookingForSlot = bookings.find(
                (b) =>
                  b.time === time &&
                  (selectedDate === 'ALL' || b.date === selectedDate) &&
                  b.status !== 'Cancelled'
              );

              return (
                <div
                  key={time}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border transition-all ${
                    bookingForSlot
                      ? 'bg-slate-900/90 border-amber-500/30 shadow-md'
                      : 'bg-slate-950/40 border-slate-900 text-slate-600'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <span className="font-mono text-xs font-bold text-amber-400 w-20">
                      {formatSlotLabel(time)}
                    </span>

                    {bookingForSlot ? (
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                        <div>
                          <span className="font-bold text-white text-sm">
                            {bookingForSlot.customer_name}
                          </span>
                          <span className="text-xs text-slate-400 ml-2">
                            ({bookingForSlot.service}) • {bookingForSlot.phone}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">
                        Available / Open Slot
                      </span>
                    )}
                  </div>

                  {bookingForSlot && (
                    <div className="flex items-center gap-2 mt-2 sm:mt-0">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          bookingForSlot.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : bookingForSlot.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                        }`}
                      >
                        {bookingForSlot.status}
                      </span>

                      {onOpenBillingForBooking && (
                        <button
                          onClick={() => onOpenBillingForBooking(bookingForSlot)}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20"
                        >
                          Invoice
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
