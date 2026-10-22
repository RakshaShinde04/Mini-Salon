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
  presetService?: string;
}

export const BookingForm: React.FC<BookingFormProps> = ({
  onNavigateToManage,
  presetService,
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Date selection
  const [todayStr, setTodayStr] = useState('2026-10-22');
  const [selectedDate, setSelectedDate] = useState('2026-10-22');

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
          if (presetService) {
            const match = json.data.find(
              (s: Service) => s.name.toLowerCase() === presetService.toLowerCase()
            );
            setSelectedService(match || json.data[0]);
          } else {
            setSelectedService(json.data[0]);
          }
        }
      } catch (err) {
        console.error('Failed to fetch services', err);
      } finally {
        setLoadingServices(false);
      }
    }
    fetchServices();
  }, [presetService]);

  // Update selectedService if presetService changes
  useEffect(() => {
    if (presetService && services.length > 0) {
      const match = services.find(
        (s) => s.name.toLowerCase() === presetService.toLowerCase()
      );
      if (match) setSelectedService(match);
    }
  }, [presetService, services]);

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

  const formatSlotLabel = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const period = h >= 12 ? 'PM' : 'AM';
    const displayHour = h % 12 === 0 ? 12 : h % 12;
    return `${displayHour}:${m.toString().padStart(2, '0')} ${period}`;
  };

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

  const isPhoneValid = /^\d{10}$/.test(phone.replace(/\D/g, ''));

  // Handle Booking Submit
  const handleBookingSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

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

      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#E892A2', '#F7B8C4', '#1A1412', '#F3EBE3'],
        });
      } catch (confettiErr) {}
    } catch (err: any) {
      console.error('Booking submission error:', err);
      setErrorMessage('Network error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setConfirmedBooking(null);
    setCustomerName('');
    setPhone('');
    setSelectedTime('');
    setErrorMessage(null);
    fetch(`/api/slots?date=${selectedDate}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.success) setSlots(json.slots);
      });
  };

  // Render Confirmation Card
  if (confirmedBooking) {
    return (
      <div id="booking-form-anchor" className="max-w-xl mx-auto px-4 py-12">
        <div className="bg-white rounded-[2.5rem] p-8 sm:p-10 border border-[#E8DDD4] text-center shadow-2xl relative overflow-hidden">
          <div className="w-20 h-20 bg-[#F3E5E8] text-[#D4708A] rounded-full mx-auto flex items-center justify-center mb-6 shadow-sm">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="inline-block px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#F3E5E8] text-[#D4708A] mb-3">
            Appointment Confirmed
          </span>

          <h2 className="text-3xl font-extrabold text-[#1A1412] mb-2 uppercase">
            You&apos;re All Set!
          </h2>

          <p className="text-base text-[#5A4E49] font-medium mb-6">
            Your booking is confirmed for{' '}
            <span className="text-[#D4708A] font-bold">
              {formatSlotLabel(confirmedBooking.time)}
            </span>
            ,{' '}
            <span className="text-[#1A1412] font-bold">
              {formatDateReadable(confirmedBooking.date)}
            </span>
          </p>

          <div className="bg-[#FAF6F2] rounded-2xl p-6 border border-[#E8DDD4] text-left space-y-3.5 mb-8 text-sm">
            <div className="flex justify-between items-center border-b border-[#E8DDD4] pb-3">
              <span className="text-xs uppercase tracking-wider text-[#8C7A73] font-bold">
                Booking Reference
              </span>
              <span className="font-mono font-bold text-[#1A1412]">
                #BKG-{confirmedBooking.id.toString().padStart(4, '0')}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#8C7A73]">Customer</span>
              <span className="font-semibold text-[#1A1412]">
                {confirmedBooking.customer_name}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#8C7A73]">Phone</span>
              <span className="font-mono text-[#1A1412]">+91 {confirmedBooking.phone}</span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-[#8C7A73]">Service</span>
              <span className="font-bold text-[#D4708A]">
                {confirmedBooking.service}
              </span>
            </div>

            <div className="flex justify-between items-center pt-2 border-t border-[#E8DDD4]">
              <span className="text-[#8C7A73]">Price at Salon</span>
              <span className="text-base font-extrabold text-[#1A1412]">
                ₹{selectedService?.price || '200'}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={handleResetForm}
              className="flex-1 py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#F3EBE3] hover:bg-[#EBDDD5] text-[#1A1412] transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              Book Another
            </button>

            <button
              onClick={() => onNavigateToManage && onNavigateToManage(confirmedBooking.phone)}
              className="flex-1 py-3 px-5 rounded-full font-bold text-xs uppercase tracking-wider bg-[#1A1412] hover:bg-[#2E2522] text-white transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <Clock className="w-4 h-4" />
              Manage / Reschedule
            </button>
          </div>
        </div>
      </div>
    );
  }

  const morningSlots = slots.filter((s) => s.time < '12:00');
  const afternoonSlots = slots.filter((s) => s.time >= '12:00' && s.time < '17:00');
  const eveningSlots = slots.filter((s) => s.time >= '17:00');

  return (
    <div id="booking-form-anchor" className="max-w-4xl mx-auto px-4 py-12">
      {/* Title */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#F3E5E8] text-[#D4708A] text-xs font-bold tracking-wider uppercase border border-[#E8C5CC] mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Online Reservations</span>
        </div>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-[#1A1412] tracking-tight uppercase">
          Book Your Appointment
        </h2>
        <p className="mt-2 text-sm text-[#5A4E49] max-w-xl mx-auto">
          Choose your styling service, pick an available slot, and receive instant confirmation.
        </p>
      </div>

      {/* Main Form Container */}
      <form
        onSubmit={handleBookingSubmit}
        className="bg-white rounded-[2.5rem] p-6 sm:p-10 border border-[#E8DDD4] shadow-xl space-y-8"
      >
        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
            <div className="font-semibold">{errorMessage}</div>
          </div>
        )}

        {/* Step 1: Contact Details */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#8C6D63] font-bold mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F3EBE3] text-[#1A1412] flex items-center justify-center text-xs font-bold">
              1
            </span>
            Guest Contact Details
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A4E49] mb-1.5">
                Full Name *
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-customer-name"
                  type="text"
                  required
                  placeholder="e.g. Priya Sharma"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A4E49] mb-1.5 flex justify-between">
                <span>Phone (10 Digits) *</span>
                <span className={`text-[11px] ${phone.length === 10 ? 'text-emerald-600 font-bold' : 'text-[#8C7A73]'}`}>
                  {phone.length}/10 Digits
                </span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  id="input-phone"
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] placeholder-[#A0938D] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm transition-all"
                />
                {phone.length === 10 && (
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 absolute right-3.5 top-1/2 -translate-y-1/2" />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Choose Service with Live Price */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#8C6D63] font-bold mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F3EBE3] text-[#1A1412] flex items-center justify-center text-xs font-bold">
              2
            </span>
            Select Salon Service
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
            <div className="md:col-span-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-[#5A4E49] mb-1.5">
                Choose Service
              </label>
              <div className="relative">
                <Scissors className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <select
                  id="select-service"
                  value={selectedService?.name || ''}
                  onChange={(e) => {
                    const found = services.find((s) => s.name === e.target.value);
                    if (found) setSelectedService(found);
                  }}
                  className="w-full pl-10 pr-10 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm appearance-none cursor-pointer"
                >
                  {services.map((svc) => (
                    <option key={svc.id} value={svc.name}>
                      {svc.name} — ₹{svc.price} ({svc.duration} min)
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8C7A73] text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* Live Price Badge */}
            <div className="bg-[#F3EBE3] rounded-2xl p-4 border border-[#E8DDD4] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#8C6D63] block">
                  Live Price
                </span>
                <span className="text-2xl font-black text-[#1A1412]">
                  ₹{selectedService ? selectedService.price.toLocaleString('en-IN') : '0'}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-[#8C6D63] block font-bold uppercase">Duration</span>
                <span className="text-xs font-bold text-[#1A1412]">
                  {selectedService ? `${selectedService.duration} mins` : '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Service selection pills */}
          <div className="flex flex-wrap gap-2 mt-3">
            {services.map((svc) => (
              <button
                type="button"
                key={svc.id}
                onClick={() => setSelectedService(svc)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                  selectedService?.name === svc.name
                    ? 'bg-[#1A1412] text-white'
                    : 'bg-[#FAF6F2] text-[#5A4E49] hover:bg-[#F3EBE3] border border-[#E8DDD4]'
                }`}
              >
                {svc.name} • ₹{svc.price}
              </button>
            ))}
          </div>
        </div>

        {/* Step 3: Date & Smart Slots */}
        <div>
          <h3 className="text-xs uppercase tracking-wider text-[#8C6D63] font-bold mb-4 flex items-center gap-2">
            <span className="w-5 h-5 rounded-full bg-[#F3EBE3] text-[#1A1412] flex items-center justify-center text-xs font-bold">
              3
            </span>
            Select Date & Available Slot
          </h3>

          {/* Date Picker */}
          <div className="space-y-3 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <label className="text-xs font-bold uppercase tracking-wider text-[#5A4E49]">
                Appointment Date
              </label>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setQuickDate(0)}
                  className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                    selectedDate === todayStr
                      ? 'bg-[#1A1412] text-white'
                      : 'bg-[#FAF6F2] text-[#5A4E49] hover:bg-[#F3EBE3]'
                  }`}
                >
                  Today
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(1)}
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF6F2] text-[#5A4E49] hover:bg-[#F3EBE3] cursor-pointer"
                >
                  Tomorrow
                </button>
                <button
                  type="button"
                  onClick={() => setQuickDate(2)}
                  className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#FAF6F2] text-[#5A4E49] hover:bg-[#F3EBE3] cursor-pointer"
                >
                  In 2 Days
                </button>
              </div>
            </div>

            <div className="relative">
              <Calendar className="w-4 h-4 text-[#8C7A73] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                id="input-date"
                type="date"
                min={todayStr}
                required
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-[#FAF6F2] border border-[#E4D8CE] text-[#1A1412] focus:outline-none focus:border-[#E892A2] focus:bg-white text-sm cursor-pointer"
              />
            </div>
          </div>

          {/* Smart Slots Grid */}
          <div>
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-[#5A4E49] uppercase tracking-wider">
                Available Slots for {formatDateReadable(selectedDate)}
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-[#5A4E49]">
                  <span className="w-2.5 h-2.5 rounded-full bg-white border border-[#E8DDD4]"></span>
                  Available
                </span>
                <span className="flex items-center gap-1.5 text-rose-500 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-400"></span>
                  Booked
                </span>
              </div>
            </div>

            {loadingSlots ? (
              <div className="p-8 text-center text-[#8C7A73] text-sm">
                <div className="w-5 h-5 border-2 border-[#1A1412] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                Checking live slots...
              </div>
            ) : (
              <div className="space-y-4">
                {morningSlots.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A73] block mb-2">
                      Morning (9 AM - 12 PM)
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
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              !slot.available
                                ? 'bg-[#F2EDEA] text-gray-400 line-through cursor-not-allowed border border-[#E8DDD4]'
                                : isSelected
                                ? 'bg-[#1A1412] text-white font-bold shadow-md scale-105'
                                : 'bg-[#FAF6F2] hover:bg-[#F3EBE3] text-[#1A1412] border border-[#E8DDD4]'
                            }`}
                          >
                            <span>{formatSlotLabel(slot.time)}</span>
                            {!slot.available && (
                              <span className="text-[9px] no-underline font-bold text-rose-500">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {afternoonSlots.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A73] block mb-2">
                      Afternoon (12 PM - 5 PM)
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
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              !slot.available
                                ? 'bg-[#F2EDEA] text-gray-400 line-through cursor-not-allowed border border-[#E8DDD4]'
                                : isSelected
                                ? 'bg-[#1A1412] text-white font-bold shadow-md scale-105'
                                : 'bg-[#FAF6F2] hover:bg-[#F3EBE3] text-[#1A1412] border border-[#E8DDD4]'
                            }`}
                          >
                            <span>{formatSlotLabel(slot.time)}</span>
                            {!slot.available && (
                              <span className="text-[9px] no-underline font-bold text-rose-500">
                                Booked
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {eveningSlots.length > 0 && (
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8C7A73] block mb-2">
                      Evening (5 PM - 8 PM)
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
                            className={`py-2 px-2.5 rounded-xl text-xs font-semibold transition-all flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                              !slot.available
                                ? 'bg-[#F2EDEA] text-gray-400 line-through cursor-not-allowed border border-[#E8DDD4]'
                                : isSelected
                                ? 'bg-[#1A1412] text-white font-bold shadow-md scale-105'
                                : 'bg-[#FAF6F2] hover:bg-[#F3EBE3] text-[#1A1412] border border-[#E8DDD4]'
                            }`}
                          >
                            <span>{formatSlotLabel(slot.time)}</span>
                            {!slot.available && (
                              <span className="text-[9px] no-underline font-bold text-rose-500">
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

        {/* Submit Button */}
        <button
          id="btn-submit-booking"
          type="submit"
          disabled={isSubmitting || !selectedTime || !customerName.trim() || !isPhoneValid}
          className={`w-full py-4 px-6 rounded-full font-bold text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-3 shadow-lg ${
            isSubmitting || !selectedTime || !customerName.trim() || !isPhoneValid
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-[#1A1412] hover:bg-[#2E2522] text-white cursor-pointer active:scale-98'
          }`}
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              Confirm Booking
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>
    </div>
  );
};
