'use client';

import React, { useState, useEffect } from 'react';
import {
  Search,
  Phone,
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RotateCcw,
  RefreshCw,
  Ban,
  ArrowRight,
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

interface CustomerManageBookingProps {
  initialPhone?: string;
  onBookNew?: () => void;
}

export const CustomerManageBooking: React.FC<CustomerManageBookingProps> = ({
  initialPhone = '',
  onBookNew,
}) => {
  const [searchPhone, setSearchPhone] = useState(initialPhone);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(
    null
  );

  // Reschedule state
  const [reschedulingId, setReschedulingId] = useState<number | null>(null);
  const [todayStr, setTodayStr] = useState('2026-10-21');
  const [newDate, setNewDate] = useState('2026-10-21');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);
    setNewDate(today);
  }, []);
  const [newTime, setNewTime] = useState('');
  const [rescheduleSlots, setRescheduleSlots] = useState<{ time: string; available: boolean }[]>(
    []
  );
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [submittingReschedule, setSubmittingReschedule] = useState(false);

  // Auto-search if initialPhone provided
  useEffect(() => {
    if (initialPhone && initialPhone.length === 10) {
      handleLookup(initialPhone);
    }
  }, [initialPhone]);

  // Lookup bookings by phone
  const handleLookup = async (phoneToSearch?: string) => {
    const raw = phoneToSearch || searchPhone;
    const clean = raw.replace(/\D/g, '');
    if (clean.length !== 10) {
      setMessage({ text: 'Please enter a valid 10-digit phone number', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage(null);
    setSearched(true);

    try {
      const res = await fetch(`/api/customer-lookup?phone=${clean}`);
      const json = await res.json();
      if (json.success) {
        setBookings(json.data);
      } else {
        setMessage({ text: json.error || 'Failed to lookup bookings', type: 'error' });
      }
    } catch (err: any) {
      setMessage({ text: 'Error connecting to salon server', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  // Fetch slots for rescheduling
  const loadSlotsForDate = async (date: string) => {
    setLoadingSlots(true);
    setNewTime('');
    try {
      const res = await fetch(`/api/slots?date=${date}`);
      const json = await res.json();
      if (json.success && json.slots) {
        setRescheduleSlots(json.slots);
      }
    } catch (err) {
      console.error('Failed to load slots for reschedule', err);
    } finally {
      setLoadingSlots(false);
    }
  };

  const handleStartReschedule = (b: Booking) => {
    setReschedulingId(b.id);
    setNewDate(b.date < todayStr ? todayStr : b.date);
    loadSlotsForDate(b.date < todayStr ? todayStr : b.date);
  };

  // Submit Reschedule
  const handleConfirmReschedule = async (bookingId: number) => {
    if (!newDate || !newTime) {
      setMessage({ text: 'Please select a new date and available time slot', type: 'error' });
      return;
    }

    setSubmittingReschedule(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          time: newTime,
          status: 'Confirmed',
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({ text: json.error || 'Failed to reschedule appointment', type: 'error' });
        return;
      }

      setMessage({
        text: `Appointment rescheduled successfully to ${newTime}, ${newDate}!`,
        type: 'success',
      });
      setReschedulingId(null);
      // Refresh list
      handleLookup();
    } catch (err: any) {
      setMessage({ text: 'Network error rescheduling booking', type: 'error' });
    } finally {
      setSubmittingReschedule(false);
    }
  };

  // Cancel Booking
  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm('Are you sure you want to cancel this salon appointment?')) {
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const res = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Cancelled' }),
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        setMessage({ text: json.error || 'Failed to cancel appointment', type: 'error' });
        return;
      }

      setMessage({ text: 'Your booking has been cancelled successfully.', type: 'success' });
      // Refresh list
      handleLookup();
    } catch (err) {
      setMessage({ text: 'Error cancelling appointment', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const formatSlotLabel = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Title */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold text-white">Manage Your Appointments</h1>
        <p className="text-slate-400 text-sm mt-2">
          Enter your registered 10-digit mobile number to view, reschedule, or cancel your bookings.
        </p>
      </div>

      {/* Search Card */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-lookup-phone"
              type="tel"
              maxLength={10}
              placeholder="Enter your 10-digit mobile number"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm"
            />
          </div>
          <button
            id="btn-search-booking"
            onClick={() => handleLookup()}
            disabled={loading || searchPhone.length !== 10}
            className={`w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
              loading || searchPhone.length !== 10
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20 cursor-pointer'
            }`}
          >
            {loading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Find Bookings
          </button>
        </div>

        {/* Message notification */}
        {message && (
          <div
            className={`mt-4 p-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <AlertCircle className="w-4 h-4" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <span>Your Bookings</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                {bookings.length}
              </span>
            </h2>
            {onBookNew && (
              <button
                onClick={onBookNew}
                className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
              >
                + Book New Service
              </button>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="glass-panel rounded-2xl p-8 text-center text-slate-400">
              <Calendar className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-medium">No bookings found for this mobile number.</p>
              {onBookNew && (
                <button
                  onClick={onBookNew}
                  className="mt-4 px-4 py-2 rounded-xl text-xs font-bold bg-amber-500 text-slate-950 hover:bg-amber-400"
                >
                  Book Your First Appointment
                </button>
              )}
            </div>
          ) : (
            bookings.map((b) => {
              const isPast = b.date < todayStr;
              const isRescheduling = reschedulingId === b.id;

              return (
                <div
                  key={b.id}
                  className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-base">{b.service}</h3>
                        <p className="text-xs text-slate-400">
                          Ref: #{b.id.toString().padStart(4, '0')} • Customer: {b.customer_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : b.status === 'Pending'
                            ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                            : b.status === 'Done'
                            ? 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Date</span>
                      <span className="text-slate-200 font-semibold">{b.date}</span>
                    </div>
                    <div className="bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Scheduled Time</span>
                      <span className="text-amber-400 font-semibold">{formatSlotLabel(b.time)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-slate-900/60 p-2.5 rounded-xl border border-slate-800">
                      <span className="text-slate-500 block">Booked On</span>
                      <span className="text-slate-400">{b.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>

                  {/* Rescheduling Drawer if active for this booking */}
                  {isRescheduling && (
                    <div className="p-4 rounded-xl bg-slate-900/95 border border-amber-500/40 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5" />
                          Reschedule Appointment
                        </span>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      {/* Pick New Date */}
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          Pick New Date:
                        </label>
                        <input
                          type="date"
                          min={todayStr}
                          value={newDate}
                          onChange={(e) => {
                            setNewDate(e.target.value);
                            loadSlotsForDate(e.target.value);
                          }}
                          className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-700 text-white text-xs"
                        />
                      </div>

                      {/* Pick New Time */}
                      <div>
                        <label className="text-xs text-slate-300 block mb-1">
                          Choose Available Slot for {newDate}:
                        </label>
                        {loadingSlots ? (
                          <div className="text-xs text-slate-400 py-2">Loading slots...</div>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1">
                            {rescheduleSlots.map((s) => (
                              <button
                                key={s.time}
                                type="button"
                                disabled={!s.available}
                                onClick={() => setNewTime(s.time)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all ${
                                  !s.available
                                    ? 'bg-slate-900/40 text-slate-600 line-through cursor-not-allowed'
                                    : newTime === s.time
                                    ? 'bg-amber-500 text-slate-950 font-bold'
                                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                }`}
                              >
                                {formatSlotLabel(s.time)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => handleConfirmReschedule(b.id)}
                          disabled={submittingReschedule || !newTime}
                          className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                            submittingReschedule || !newTime
                              ? 'bg-slate-800 text-slate-500'
                              : 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950'
                          }`}
                        >
                          {submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="py-2 px-3 rounded-lg text-xs bg-slate-800 text-slate-300 hover:text-white"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for active bookings */}
                  {b.status !== 'Cancelled' && b.status !== 'Done' && !isRescheduling && (
                    <div className="flex flex-wrap gap-2 pt-1 border-t border-slate-800/60">
                      <button
                        onClick={() => handleStartReschedule(b)}
                        className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 flex items-center gap-1.5 transition-all"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        Reschedule Date / Time
                      </button>

                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="py-2 px-3.5 rounded-xl text-xs font-semibold bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 flex items-center gap-1.5 transition-all"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel Appointment
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
};
