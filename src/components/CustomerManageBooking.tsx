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
    <div className="max-w-4xl mx-auto px-4 py-12">
      {/* Title */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold uppercase tracking-wider mb-2">
          Appointment Lookup
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#1A1412] uppercase tracking-tight">
          Manage Your Bookings
        </h1>
        <p className="text-[#5A4E49] text-sm mt-1.5 max-w-md mx-auto">
          Enter your 10-digit mobile number to view, reschedule, or cancel your salon appointments.
        </p>
      </div>

      {/* Search Card */}
      <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 border border-[#E8DDD4] shadow-xl mb-8">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Phone className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="input-lookup-phone"
              type="tel"
              maxLength={10}
              placeholder="Enter your 10-digit mobile number"
              value={searchPhone}
              onChange={(e) => setSearchPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
              onKeyDown={(e) => e.key === 'Enter' && handleLookup()}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm"
            />
          </div>
          <button
            id="btn-search-booking"
            onClick={() => handleLookup()}
            disabled={loading || searchPhone.length !== 10}
            className={`w-full sm:w-auto px-6 py-3 rounded-full font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 ${
              loading || searchPhone.length !== 10
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-[#1A1412] hover:bg-[#2E2522] text-white shadow-md cursor-pointer active:scale-98'
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
            className={`mt-4 p-3.5 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600" />
            )}
            {message.text}
          </div>
        )}
      </div>

      {/* Bookings List */}
      {searched && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-[#1A1412] flex items-center gap-2">
              <span>Your Bookings</span>
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-[#F3EBE3] text-[#1A1412] font-mono">
                {bookings.length}
              </span>
            </h2>
            {onBookNew && (
              <button
                onClick={onBookNew}
                className="text-xs font-bold uppercase tracking-wider text-[#D4708A] hover:underline"
              >
                + Book New Service
              </button>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 text-center text-[#8C7A73] border border-[#E8DDD4]">
              <Calendar className="w-10 h-10 text-[#C4B3AB] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#1A1412]">No bookings found for this mobile number.</p>
              {onBookNew && (
                <button
                  onClick={onBookNew}
                  className="mt-4 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-wider bg-[#1A1412] text-white hover:bg-[#2E2522]"
                >
                  Book Your First Look
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
                  className="bg-white rounded-3xl p-6 border border-[#E8DDD4] shadow-sm space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#E8DDD4] pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#F3E5E8] text-[#D4708A] flex items-center justify-center font-bold">
                        <Scissors className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-extrabold text-[#1A1412] text-base">{b.service}</h3>
                        <p className="text-xs text-[#8C7A73]">
                          Ref: #{b.id.toString().padStart(4, '0')} • Guest: {b.customer_name}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                          b.status === 'Confirmed'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : b.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : b.status === 'Done'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {b.status}
                      </span>
                    </div>
                  </div>

                  {/* Date & Time info */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                    <div className="bg-[#FAF6F2] p-3 rounded-xl border border-[#E8DDD4]">
                      <span className="text-[#8C7A73] block font-bold uppercase text-[10px]">Date</span>
                      <span className="text-[#1A1412] font-bold">{b.date}</span>
                    </div>
                    <div className="bg-[#FAF6F2] p-3 rounded-xl border border-[#E8DDD4]">
                      <span className="text-[#8C7A73] block font-bold uppercase text-[10px]">Scheduled Time</span>
                      <span className="text-[#D4708A] font-bold">{formatSlotLabel(b.time)}</span>
                    </div>
                    <div className="col-span-2 sm:col-span-1 bg-[#FAF6F2] p-3 rounded-xl border border-[#E8DDD4]">
                      <span className="text-[#8C7A73] block font-bold uppercase text-[10px]">Booked On</span>
                      <span className="text-[#5A4E49]">{b.created_at?.slice(0, 10)}</span>
                    </div>
                  </div>

                  {/* Rescheduling Drawer if active for this booking */}
                  {isRescheduling && (
                    <div className="p-5 rounded-2xl bg-[#FAF6F2] border border-[#E8DDD4] space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-bold text-[#1A1412] uppercase tracking-wider flex items-center gap-1.5">
                          <RotateCcw className="w-3.5 h-3.5 text-[#D4708A]" />
                          Reschedule Appointment
                        </span>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="text-xs text-[#8C7A73] hover:text-[#1A1412] cursor-pointer"
                        >
                          ✕ Cancel
                        </button>
                      </div>

                      {/* Pick New Date */}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A4E49] block mb-1">
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
                          className="w-full px-3 py-2 rounded-xl bg-white border border-[#E4D8CE] text-[#1A1412] text-xs"
                        />
                      </div>

                      {/* Pick New Time */}
                      <div>
                        <label className="text-xs font-bold uppercase tracking-wider text-[#5A4E49] block mb-1">
                          Choose Available Slot for {newDate}:
                        </label>
                        {loadingSlots ? (
                          <div className="text-xs text-[#8C7A73] py-2">Loading slots...</div>
                        ) : (
                          <div className="grid grid-cols-4 sm:grid-cols-6 gap-1.5 max-h-40 overflow-y-auto p-1">
                            {rescheduleSlots.map((s) => (
                              <button
                                key={s.time}
                                type="button"
                                disabled={!s.available}
                                onClick={() => setNewTime(s.time)}
                                className={`py-1.5 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                                  !s.available
                                    ? 'bg-gray-100 text-gray-400 line-through cursor-not-allowed'
                                    : newTime === s.time
                                    ? 'bg-[#1A1412] text-white font-bold'
                                    : 'bg-white text-[#1A1412] border border-[#E8DDD4] hover:bg-[#F3EBE3]'
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
                          className={`flex-1 py-2 px-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
                            submittingReschedule || !newTime
                              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                              : 'bg-[#1A1412] text-white hover:bg-[#2E2522] cursor-pointer'
                          }`}
                        >
                          {submittingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                        </button>
                        <button
                          onClick={() => setReschedulingId(null)}
                          className="py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-white border border-[#E8DDD4] text-[#5A4E49] hover:bg-gray-50 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Action Buttons for active bookings */}
                  {b.status !== 'Cancelled' && b.status !== 'Done' && !isRescheduling && (
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-[#E8DDD4]">
                      <button
                        onClick={() => handleStartReschedule(b)}
                        className="py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF6F2] hover:bg-[#F3EBE3] text-[#1A1412] border border-[#E8DDD4] flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <RotateCcw className="w-3.5 h-3.5 text-[#D4708A]" />
                        Reschedule
                      </button>

                      <button
                        onClick={() => handleCancelBooking(b.id)}
                        className="py-2 px-4 rounded-full text-xs font-bold uppercase tracking-wider bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Ban className="w-3.5 h-3.5" />
                        Cancel
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
