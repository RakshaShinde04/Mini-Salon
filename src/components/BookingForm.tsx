'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  User,
  Phone,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Scissors,
  ArrowRight,
  ShieldCheck,
  RotateCcw,
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface SlotInfo {
  time: string;
  available: boolean;
  booking?: any;
}

interface BookingFormProps {
  onNavigateToManage?: (phone?: string) => void;
}

export const BookingForm: React.FC<BookingFormProps> = ({ onNavigateToManage }) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Date selection
  const [todayStr, setTodayStr] = useState('2026-10-21');
  const [selectedDate, setSelectedDate] = useState('2026-10-21');

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setTodayStr(today);
    setSelectedDate(today);
  }, []);

  // Time slot state
  const [slots, setSlots] = useState<SlotInfo[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [selectedTime, setSelectedTime] = useState<string>('');

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // 1. Fetch all services
  useEffect(() => {
    async function fetchServices() {
      try {
        setLoadingServices(true);
        const res = await fetch('/api/services');
        const json = await res.json();
        if (json.success && json.data.length > 0) {
          setServices(json.data);
          setSelectedService(json.data[0]); // default to first service
        }
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, []);

  // 2. Fetch available slots whenever date changes
  useEffect(() => {
    async function fetchSlots() {
      if (!selectedDate) return;
      try {
        setLoadingSlots(true);
        setSelectedTime(''); // Reset selected slot
        const res = await fetch(`/api/slots?date=${selectedDate}`);
        const json = await res.json();
        if (json.success && json.slots) {
          setSlots(json.slots);
        }
      } catch (err) {
        console.error('Failed to load slots', err);
      } finally {
        setLoadingSlots(false);
      }
    }
    fetchSlots();
  }, [selectedDate]);

  // Quick date pickers
  const setQuickDate = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Format 24h to 12h readable
  const formatSlotLabel = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

  // Format Date readable
  const formatDateReadable = (dateStr: string) => {
    try {
      const [year, month, day] = dateStr.split('-').map(Number);
      const d = new Date(year, month - 1, day);
      return d.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  // Validate phone format
  const isPhoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Validation
    if (!customerName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!/^\d{10}$/.test(cleanPhone)) {
      setErrorMessage('Please provide a valid 10-digit mobile number.');
      return;
    }

    if (!selectedService) {
      setErrorMessage('Please select a service.');
      return;
    }

    if (!selectedDate) {
      setErrorMessage('Please select an appointment date.');
      return;
    }

    if (selectedDate < todayStr) {
      setErrorMessage('Appointment date cannot be in the past.');
      return;
    }

    if (!selectedTime) {
      setErrorMessage('Please choose an available time slot.');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: customerName,
          phone: cleanPhone,
          service: selectedService.name,
          date: selectedDate,
          time: selectedTime,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || 'Failed to create booking.');
        // Refresh slots in case of double-booking conflict
        const slotsRes = await fetch(`/api/slots?date=${selectedDate}`);
        const slotsJson = await slotsRes.json();
        if (slotsJson.success) setSlots(slotsJson.slots);
        return;
      }

      // Success!
      setConfirmedBooking(data.data);

      // Trigger celebratory confetti
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#eab308', '#f59e0b', '#fef08a', '#ffffff'],
        });
      } catch (confettiErr) {
        // graceful fallback
      }
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Reset to book another appointment
  const handleResetForm = () => {
    setConfirmedBooking(null);
    setCustomerName('');
    setPhone('');
    setSelectedTime('');
    setErrorMessage(null);
    // Refresh slots
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSlots(json.slots);
      });
  };

  // Render Confirmation Screen if booked
  if (confirmedBooking) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8">
        <div className="glass-panel-gold rounded-3xl p-8 border border-amber-500/30 text-center shadow-2xl relative overflow-hidden">
          {/* Decorative background glow */}
          <div className="absolute -top-24 -left-24 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-yellow-500/10 rounded-full blur-3xl pointer-events-none"></div>

          <div className="w-20 h-20 bg-gradient-to-tr from-amber-500 to-yellow-300 rounded-full mx-auto flex items-center justify-center shadow-lg shadow-amber-500/30 mb-6">
            <CheckCircle2 className="w-12 h-12 text-slate-950" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-3">
            Appointment Confirmed
          </span>

          <h2 className="text-3xl font-extrabold text-white mb-2">
            You&apos;re All Set!
          </h2>

          <p className="text-lg text-amber-200/90 font-medium mb-6">
            Your booking is confirmed for{' '}
            <span className="text-amber-400 font-bold">
              {formatSlotLabel(confirmedBooking.time)}
            </span>
            ,{' '}
            <span className="text-white font-bold">
              {formatDateReadable(confirmedBooking.date)}
            </span>
          </p>

          {/* Booking Card Details */}
          <div className="bg-slate-900/90 rounded-2xl p-6 border border-slate-800 text-left space-y-4 mb-8">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-xs uppercase tracking-wider text-slate-400">
                Booking Reference
              </span>
              <span className="text-sm font-mono font-bold text-amber-400">
                #BKG-{confirmedBooking.id.toString().padStart(4, '0')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Customer Name</span>
              <span className="text-sm font-semibold text-white">
                {confirmedBooking.customer_name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Mobile Number</span>
              <span className="text-sm font-mono text-slate-300">
                +91 {confirmedBooking.phone}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-slate-400">Reserved Service</span>
              <span className="text-sm font-semibold text-amber-300">
                {confirmedBooking.service}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-slate-800/80">
              <span className="text-sm text-slate-400">Estimated Price</span>
              <span className="text-base font-bold text-amber-400">
                ₹{selectedService?.price || '200'}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetForm}
              className="flex-1 py-3 px-5 rounded-xl font-semibold text-sm bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              Book Another
            </button>

            <button
              onClick={() => onNavigateToManage && onNavigateToManage(confirmedBooking.phone)}
              className="flex-1 py-3 px-5 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2"
            >
              <Clock className="w-4 h-4" />
              Manage / Reschedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Morning, Afternoon, Evening slot filters
  const morningSlots = slots.filter((s) => s.time < '12:00');
  const afternoonSlots = slots.filter((s) => s.time >= '12:00' && s.time < '17:00');
  const eveningSlots = slots.filter((s) => s.time >= '17:00');

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Hero Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold tracking-wider uppercase mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Seamless Instant Appointments
        </div>
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">
          Reserve Your Salon Experience
        </h1>
        <p className="mt-3 text-slate-400 text-base max-w-2xl mx-auto">
          Choose your styling service, pick an available time slot, and receive instant confirmation with zero waiting.
        </p>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleBookingSubmit}
        className="glass-panel rounded-3xl p-6 sm:p-10 border border-slate-800 shadow-2xl relative"
      >
        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start gap-3 text-rose-300 text-sm animate-shake">
            <AlertCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1 font-medium">{errorMessage}</div>
          </div>
        )}

        <div className="space-y-8">
          {/* Step 1: Customer Details */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                1
              </span>
              Your Contact Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-customer-name"
                    type="text"
                    required
                    placeholder="e.g. Priya Sharma"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 transition-colors text-sm"
                  />
                </div>
              </div>

              {/* Phone (10 digits) */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2 flex justify-between">
                  <span>Mobile Phone Number *</span>
                  <span
                    className={`text-xs ${
                      phone.replace(/\D/g, '').length === 10
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    {phone.replace(/\D/g, '').length}/10 Digits
                  </span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="input-phone"
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="10-digit number (e.g. 9876543210)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    className={`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border text-white placeholder-slate-500 focus:outline-none transition-colors text-sm ${
                      phone.length === 10
                        ? 'border-emerald-500/80 focus:border-emerald-400'
                        : 'border-slate-700/80 focus:border-amber-400'
                    }`}
                  />
                  {phone.length === 10 && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Step 2: Select Service (with LIVE PRICE DISPLAY) */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                2
              </span>
              Select Salon Service
            </h3>

            {/* Service Dropdown & Live Price Highlight */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Choose Service
                </label>
                <div className="relative">
                  <Scissors className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <select
                    id="select-service"
                    value={selectedService?.name || ''}
                    onChange={(e) => {
                      const found = services.find((s) => s.name === e.target.value);
                      if (found) setSelectedService(found);
                    }}
                    className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm appearance-none cursor-pointer"
                  >
                    {services.map((svc) => (
                      <option key={svc.id} value={svc.name}>
                        {svc.name} — ₹{svc.price} ({svc.duration} min)
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">
                    ▼
                  </div>
                </div>
              </div>

              {/* LIVE PRICE CARD BADGE */}
              <div className="bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-amber-500/5 rounded-2xl p-4 border border-amber-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs uppercase tracking-wider text-amber-400/90 font-semibold block">
                    Live Price
                  </span>
                  <div className="flex items-baseline gap-1 mt-0.5">
                    <span className="text-2xl font-extrabold text-amber-300">
                      ₹{selectedService ? selectedService.price.toLocaleString('en-IN') : '0'}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Est. Duration</span>
                  <span className="text-sm font-semibold text-slate-200">
                    {selectedService ? `${selectedService.duration} mins` : '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Service Selection Pills */}
            <div className="flex flex-wrap gap-2 mt-3">
              {services.map((svc) => (
                <button
                  type="button"
                  key={svc.id}
                  onClick={() => setSelectedService(svc)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    selectedService?.name === svc.name
                      ? 'bg-amber-500 text-slate-950 font-bold shadow-md shadow-amber-500/20'
                      : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/60'
                  }`}
                >
                  {svc.name} • ₹{svc.price}
                </button>
              ))}
            </div>
          </div>

          {/* Step 3: Date & Smart Time Slots */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
                3
              </span>
              Preferred Date & Smart Time Slot
            </h3>

            {/* Date Pickers */}
            <div className="space-y-3 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <label className="text-xs font-semibold text-slate-300">
                  Select Date (No Past Dates)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setQuickDate(0)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      selectedDate === todayStr
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    Today
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(1)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                  >
                    Tomorrow
                  </button>
                  <button
                    type="button"
                    onClick={() => setQuickDate(2)}
                    className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-800 text-slate-300 hover:bg-slate-700 transition-all"
                  >
                    In 2 Days
                  </button>
                </div>
              </div>

              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  id="input-date"
                  type="date"
                  min={todayStr}
                  required
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white focus:outline-none focus:border-amber-400 transition-colors text-sm cursor-pointer"
                />
              </div>
            </div>

            {/* Smart Time Slots Grid */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  Available Time Slots for {formatDateReadable(selectedDate)}
                </label>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-slate-700 border border-slate-600"></span>
                    Available
                  </span>
                  <span className="flex items-center gap-1.5 text-rose-400">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                    Booked
                  </span>
                </div>
              </div>

              {loadingSlots ? (
                <div className="p-8 text-center text-slate-400 text-sm">
                  <div className="w-6 h-6 border-2 border-amber-400 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Checking live slot availability...
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Morning Slots */}
                  {morningSlots.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Morning (09:00 AM - 12:00 PM)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {morningSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all relative flex flex-col items-center justify-center gap-1 ${
                                !slot.available
                                  ? 'bg-slate-900/40 text-slate-600 border border-slate-800/60 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50'
                              }`}
                            >
                              <span>{formatSlotLabel(slot.time)}</span>
                              {!slot.available && (
                                <span className="text-[9px] no-underline font-normal text-rose-400">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Afternoon Slots */}
                  {afternoonSlots.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Afternoon (12:00 PM - 05:00 PM)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {afternoonSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all relative flex flex-col items-center justify-center gap-1 ${
                                !slot.available
                                  ? 'bg-slate-900/40 text-slate-600 border border-slate-800/60 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50'
                              }`}
                            >
                              <span>{formatSlotLabel(slot.time)}</span>
                              {!slot.available && (
                                <span className="text-[9px] no-underline font-normal text-rose-400">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Evening Slots */}
                  {eveningSlots.length > 0 && (
                    <div>
                      <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
                        Evening (05:00 PM - 08:00 PM)
                      </span>
                      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                        {eveningSlots.map((slot) => {
                          const isSelected = selectedTime === slot.time;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              disabled={!slot.available}
                              onClick={() => setSelectedTime(slot.time)}
                              className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all relative flex flex-col items-center justify-center gap-1 ${
                                !slot.available
                                  ? 'bg-slate-900/40 text-slate-600 border border-slate-800/60 cursor-not-allowed line-through'
                                  : isSelected
                                  ? 'bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold shadow-lg shadow-amber-500/20 scale-105'
                                  : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-amber-500/50'
                              }`}
                            >
                              <span>{formatSlotLabel(slot.time)}</span>
                              {!slot.available && (
                                <span className="text-[9px] no-underline font-normal text-rose-400">
                                  Booked
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Booking Summary Box */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 block">
                Appointment Summary
              </span>
              <p className="text-sm font-semibold text-white mt-0.5">
                {selectedService?.name || 'Select Service'} •{' '}
                {selectedTime ? formatSlotLabel(selectedTime) : 'Choose Slot'} •{' '}
                {formatDateReadable(selectedDate)}
              </p>
            </div>
            <div className="text-right flex items-center gap-3">
              <span className="text-xs text-slate-400">Total Due at Salon:</span>
              <span className="text-xl font-extrabold text-amber-400">
                ₹{selectedService?.price || 0}
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            id="btn-submit-booking"
            type="submit"
            disabled={isSubmitting || !selectedTime || !customerName.trim() || !isPhoneValid}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-base transition-all flex items-center justify-center gap-3 shadow-xl ${
              isSubmitting || !selectedTime || !customerName.trim() || !isPhoneValid
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700/60'
                : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 text-slate-950 hover:brightness-110 shadow-amber-500/25 active:scale-[0.99] cursor-pointer'
            }`}
          >
            {isSubmitting ? (
              <>
                <div className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></div>
                Confirming Appointment...
              </>
            ) : (
              <>
                Confirm Booking Now
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
