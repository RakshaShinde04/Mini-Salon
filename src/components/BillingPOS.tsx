'use client';

import React, { useState, useEffect } from 'react';
import {
  Receipt,
  Printer,
  Download,
  Plus,
  Trash2,
  CheckCircle2,
  Scissors,
  User,
  Phone,
  CreditCard,
  QrCode,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import jsPDF from 'jspdf';

interface Service {
  id: number;
  name: string;
  price: number;
  duration: number;
}

interface BillingItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  duration?: number;
}

interface BillingPOSProps {
  initialCustomerName?: string;
  initialCustomerPhone?: string;
  initialServiceName?: string;
}

export const BillingPOS: React.FC<BillingPOSProps> = ({
  initialCustomerName = '',
  initialCustomerPhone = '',
  initialServiceName = '',
}) => {
  const [services, setServices] = useState<Service[]>([]);
  const [customerName, setCustomerName] = useState(initialCustomerName);
  const [customerPhone, setCustomerPhone] = useState(initialCustomerPhone);

  // Selected Billing Items
  const [items, setItems] = useState<BillingItem[]>([]);

  // Financials
  const [taxEnabled, setTaxEnabled] = useState(true); // 18% GST
  const [discountPercent, setDiscountPercent] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<'Cash' | 'UPI' | 'Card'>('UPI');

  // Custom add-on item input
  const [customItemName, setCustomItemName] = useState('');
  const [customItemPrice, setCustomItemPrice] = useState('');

  // Invoice reference
  const [invoiceNumber, setInvoiceNumber] = useState('');

  useEffect(() => {
    // Generate unique invoice number
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    setInvoiceNumber(`INV-${new Date().getFullYear()}-${randomNum}`);
  }, []);

  // Fetch services
  useEffect(() => {
    async function loadServices() {
      try {
        const res = await fetch('/api/services');
        const json = await res.json();
        if (json.success) {
          setServices(json.data);

          // If initialServiceName was passed, pre-add it
          if (initialServiceName) {
            const match = json.data.find(
              (s: Service) => s.name.toLowerCase() === initialServiceName.toLowerCase()
            );
            if (match) {
              setItems([
                {
                  id: `svc-${match.id}`,
                  name: match.name,
                  price: match.price,
                  quantity: 1,
                  duration: match.duration,
                },
              ]);
            }
          }
        }
      } catch (err) {
        console.error('Failed to load services for billing', err);
      }
    }
    loadServices();
  }, [initialServiceName]);

  // Update customer fields when props change
  useEffect(() => {
    if (initialCustomerName) setCustomerName(initialCustomerName);
    if (initialCustomerPhone) setCustomerPhone(initialCustomerPhone);
  }, [initialCustomerName, initialCustomerPhone]);

  // Toggle or add service to items
  const handleToggleService = (svc: Service) => {
    const existingIndex = items.findIndex((i) => i.name === svc.name);
    if (existingIndex > -1) {
      // Remove
      setItems((prev) => prev.filter((i) => i.name !== svc.name));
    } else {
      // Add
      setItems((prev) => [
        ...prev,
        {
          id: `svc-${svc.id}`,
          name: svc.name,
          price: svc.price,
          quantity: 1,
          duration: svc.duration,
        },
      ]);
    }
  };

  // Add custom add-on product
  const handleAddCustomItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItemName.trim() || !customItemPrice || isNaN(Number(customItemPrice))) return;

    setItems((prev) => [
      ...prev,
      {
        id: `custom-${Date.now()}`,
        name: customItemName.trim(),
        price: Number(customItemPrice),
        quantity: 1,
      },
    ]);

    setCustomItemName('');
    setCustomItemPrice('');
  };

  // Remove item
  const handleRemoveItem = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  // Update item quantity
  const handleQuantityChange = (id: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((i) => {
          if (i.id === id) {
            const newQty = i.quantity + delta;
            return newQty > 0 ? { ...i, quantity: newQty } : null;
          }
          return i;
        })
        .filter(Boolean) as BillingItem[]
    );
  };

  // Financial calculations
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = Math.max(0, subtotal - discountAmount);
  const gstRate = 0.18;
  const gstAmount = taxEnabled ? Math.round(taxableAmount * gstRate) : 0;
  const cgstAmount = Math.round(gstAmount / 2);
  const sgstAmount = gstAmount - cgstAmount;
  const grandTotal = taxableAmount + gstAmount;

  // Print Invoice (Thermal / A4)
  const handlePrint = () => {
    window.print();
  };

  // Download PDF Invoice using jsPDF
  const handleDownloadPDF = () => {
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();

      // Header Banner
      doc.setFillColor(15, 23, 42); // slate-900
      doc.rect(0, 0, pageWidth, 40, 'F');

      // Salon Brand Title
      doc.setTextColor(234, 179, 8); // Gold #eab308
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('LUMIÈRE SALON & SPA', 14, 20);

      doc.setTextColor(220, 220, 220);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text('Luxury Hair, Skin & Bridal Studio • Bandra West, Mumbai', 14, 27);
      doc.text('GSTIN: 27AABCL1234F1Z8 • Phone: +91 98765 43210', 14, 33);

      // Invoice Details (Right-aligned in header)
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('TAX INVOICE', pageWidth - 14, 20, { align: 'right' });
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Invoice No: ${invoiceNumber}`, pageWidth - 14, 27, { align: 'right' });
      doc.text(`Date: ${new Date().toLocaleDateString('en-IN')}`, pageWidth - 14, 33, {
        align: 'right',
      });

      // Customer Details Box
      doc.setDrawColor(220, 220, 220);
      doc.setFillColor(248, 250, 252);
      doc.roundedRect(14, 48, pageWidth - 28, 24, 2, 2, 'FD');

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('BILLED TO (CUSTOMER):', 18, 55);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text(customerName.trim() || 'Walk-in Customer', 18, 62);

      doc.setTextColor(71, 85, 105);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.text(`Phone: +91 ${customerPhone.trim() || 'Not Provided'}`, 18, 68);

      // Payment mode pill
      doc.text(`Payment Mode: ${paymentMode}`, pageWidth - 20, 62, { align: 'right' });
      doc.text(`Status: PAID`, pageWidth - 20, 68, { align: 'right' });

      // Table Header
      let y = 82;
      doc.setFillColor(30, 41, 59); // slate-800
      doc.rect(14, y, pageWidth - 28, 9, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SR', 18, y + 6);
      doc.text('SERVICE / ITEM DESCRIPTION', 32, y + 6);
      doc.text('QTY', 115, y + 6, { align: 'center' });
      doc.text('RATE (INR)', 145, y + 6, { align: 'right' });
      doc.text('AMOUNT (INR)', pageWidth - 20, y + 6, { align: 'right' });

      // Table Rows
      y += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(15, 23, 42);

      items.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;

        // Alternate row fill
        if (index % 2 === 1) {
          doc.setFillColor(248, 250, 252);
          doc.rect(14, y - 4, pageWidth - 28, 8, 'F');
        }

        doc.text((index + 1).toString(), 18, y + 2);
        doc.text(item.name, 32, y + 2);
        doc.text(item.quantity.toString(), 115, y + 2, { align: 'center' });
        doc.text(`Rs. ${item.price.toFixed(2)}`, 145, y + 2, { align: 'right' });
        doc.text(`Rs. ${itemTotal.toFixed(2)}`, pageWidth - 20, y + 2, { align: 'right' });

        y += 8;
      });

      // Bottom border for table
      doc.setDrawColor(200, 200, 200);
      doc.line(14, y, pageWidth - 14, y);
      y += 6;

      // Summary Breakdown (Right Column)
      const summaryX = pageWidth - 70;
      const valueX = pageWidth - 20;

      doc.setFontSize(9);
      doc.text('Subtotal:', summaryX, y);
      doc.text(`Rs. ${subtotal.toFixed(2)}`, valueX, y, { align: 'right' });
      y += 6;

      if (discountAmount > 0) {
        doc.setTextColor(22, 163, 74);
        doc.text(`Discount (${discountPercent}%):`, summaryX, y);
        doc.text(`- Rs. ${discountAmount.toFixed(2)}`, valueX, y, { align: 'right' });
        doc.setTextColor(15, 23, 42);
        y += 6;
      }

      if (taxEnabled) {
        doc.text('CGST (9%):', summaryX, y);
        doc.text(`Rs. ${cgstAmount.toFixed(2)}`, valueX, y, { align: 'right' });
        y += 6;

        doc.text('SGST (9%):', summaryX, y);
        doc.text(`Rs. ${sgstAmount.toFixed(2)}`, valueX, y, { align: 'right' });
        y += 6;
      }

      // Grand Total Line
      doc.setDrawColor(234, 179, 8);
      doc.setFillColor(254, 240, 138); // amber-100
      doc.roundedRect(summaryX - 5, y, 61, 10, 2, 2, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(15, 23, 42);
      doc.text('GRAND TOTAL:', summaryX, y + 7);
      doc.text(`Rs. ${grandTotal.toFixed(2)}`, valueX, y + 7, { align: 'right' });

      // Footer Note
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(100, 116, 139);
      doc.text(
        'Thank you for styling with Lumière Salon! Keep glowing and see you soon.',
        pageWidth / 2,
        275,
        { align: 'center' }
      );
      doc.text('This is a computer-generated tax invoice. No signature required.', pageWidth / 2, 280, {
        align: 'center',
      });

      doc.save(`Lumiere_Invoice_${invoiceNumber}.pdf`);
    } catch (pdfErr) {
      console.error('PDF export error:', pdfErr);
      alert('Failed to generate PDF. You can also use the Print button.');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs uppercase tracking-wider text-amber-400 font-bold">
            Point of Sale & Billing Terminal
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-1">Salon Billing & PDF Invoicing</h1>
          <p className="text-slate-400 text-sm">
            Select multiple services, add custom items, auto-calculate tax/discounts, and print or download official invoices.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-amber-400 font-bold">
            {invoiceNumber}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Service & Customer Selection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Customer Details Box */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl">
            <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold mb-4 flex items-center gap-2">
              <User className="w-4 h-4" />
              Customer Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Customer Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="e.g. Priya Sharma (or Walk-in)"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1.5">
                  Mobile Number
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="10-digit number"
                    value={customerPhone}
                    onChange={(e) =>
                      setCustomerPhone(e.target.value.replace(/\D/g, '').slice(0, 10))
                    }
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Multi-Service Selector */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xs uppercase tracking-wider text-amber-400 font-bold flex items-center gap-2">
                <Scissors className="w-4 h-4" />
                Select Services (Multiple Allowed)
              </h3>
              <span className="text-xs text-slate-400">Click to add/remove</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {services.map((svc) => {
                const isSelected = items.some((i) => i.name === svc.name);

                return (
                  <button
                    key={svc.id}
                    type="button"
                    onClick={() => handleToggleService(svc)}
                    className={`p-3.5 rounded-2xl border text-left transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-amber-500/15 border-amber-500 text-white shadow-md shadow-amber-500/10'
                        : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-sm flex items-center gap-2">
                        {svc.name}
                        {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{svc.duration} mins</div>
                    </div>
                    <div className="font-extrabold text-amber-300 text-base">₹{svc.price}</div>
                  </button>
                );
              })}
            </div>

            {/* Custom Product / Add-on item */}
            <form onSubmit={handleAddCustomItem} className="pt-4 border-t border-slate-800">
              <span className="text-xs font-semibold text-slate-400 block mb-2">
                Add Custom Product / Add-on (e.g. Hair Oil, Shaving Gel, Styling Cream):
              </span>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Item name"
                  value={customItemName}
                  onChange={(e) => setCustomItemName(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                />
                <input
                  type="number"
                  placeholder="Price (₹)"
                  value={customItemPrice}
                  onChange={(e) => setCustomItemPrice(e.target.value)}
                  className="w-28 px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs placeholder-slate-500"
                />
                <button
                  type="submit"
                  disabled={!customItemName || !customItemPrice}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center gap-1 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Right Column: Invoice Preview & Payment Summary (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="glass-panel-gold rounded-3xl p-6 sm:p-7 border border-amber-500/30 shadow-2xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <span className="text-xs uppercase tracking-wider text-amber-400 font-bold block">
                  Invoice Summary
                </span>
                <h4 className="font-bold text-white text-base">Live Bill Calculation</h4>
              </div>
              <Receipt className="w-6 h-6 text-amber-400" />
            </div>

            {/* Billed Items List */}
            <div>
              <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold block mb-2">
                Selected Items ({items.length})
              </span>

              {items.length === 0 ? (
                <div className="py-6 text-center text-slate-500 text-xs">
                  No services selected yet. Click services on the left to add them to this bill.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                    >
                      <div className="flex-1">
                        <span className="font-semibold text-white block">{item.name}</span>
                        <span className="text-slate-400">
                          ₹{item.price} × {item.quantity}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quantity buttons */}
                        <div className="flex items-center bg-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => handleQuantityChange(item.id, -1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            -
                          </button>
                          <span className="w-5 text-center font-bold text-white">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, 1)}
                            className="w-5 h-5 flex items-center justify-center text-slate-400 hover:text-white"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-bold text-amber-400 w-16 text-right">
                          ₹{item.price * item.quantity}
                        </span>

                        <button
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-slate-500 hover:text-rose-400 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Controls: GST & Discounts */}
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  Apply 18% GST (CGST + SGST)
                </span>
                <input
                  type="checkbox"
                  checked={taxEnabled}
                  onChange={(e) => setTaxEnabled(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 focus:ring-amber-400 bg-slate-900 border-slate-700 cursor-pointer"
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold">Discount %:</span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10, 15, 20].map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setDiscountPercent(d)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        discountPercent === d
                          ? 'bg-amber-500 text-slate-950'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {d}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Mode */}
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-300 font-semibold">Payment Mode:</span>
                <div className="flex items-center gap-1">
                  {(['UPI', 'Cash', 'Card'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMode(m)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${
                        paymentMode === m
                          ? 'bg-amber-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Price Calculations */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Subtotal:</span>
                <span className="text-slate-200 font-mono">₹{subtotal.toLocaleString('en-IN')}</span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Discount ({discountPercent}%):</span>
                  <span className="font-mono">- ₹{discountAmount.toLocaleString('en-IN')}</span>
                </div>
              )}

              {taxEnabled && (
                <>
                  <div className="flex justify-between text-slate-400">
                    <span>CGST (9%):</span>
                    <span className="text-slate-300 font-mono">₹{cgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>SGST (9%):</span>
                    <span className="text-slate-300 font-mono">₹{sgstAmount.toLocaleString('en-IN')}</span>
                  </div>
                </>
              )}

              <div className="flex justify-between items-baseline pt-2 border-t border-slate-800/80">
                <span className="text-sm font-bold text-white uppercase tracking-wider">
                  Grand Total:
                </span>
                <span className="text-2xl font-black text-amber-300">
                  ₹{grandTotal.toLocaleString('en-IN')}
                </span>
              </div>
            </div>

            {/* Action Buttons: Print & Download PDF */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                onClick={handlePrint}
                disabled={items.length === 0}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Printer className="w-4 h-4" />
                Print Invoice
              </button>

              <button
                onClick={handleDownloadPDF}
                disabled={items.length === 0}
                className="flex-1 py-3 px-4 rounded-xl text-xs font-bold bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-slate-950 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* HIDDEN PRINT-ONLY INVOICE LAYOUT (renders on window.print()) */}
      <div className="hidden print:block print-invoice-area text-black font-sans">
        <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '2px solid #000', paddingBottom: '12px' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>LUMIÈRE SALON & SPA</h1>
              <p style={{ margin: '4px 0', fontSize: '12px' }}>Luxury Hair, Skin & Bridal Studio • Bandra West, Mumbai</p>
              <p style={{ margin: 0, fontSize: '11px', color: '#555' }}>GSTIN: 27AABCL1234F1Z8 | Phone: +91 98765 43210</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>TAX INVOICE</h2>
              <p style={{ margin: '4px 0', fontSize: '12px' }}><strong>{invoiceNumber}</strong></p>
              <p style={{ margin: 0, fontSize: '11px' }}>Date: {new Date().toLocaleDateString('en-IN')}</p>
            </div>
          </div>

          {/* Customer */}
          <div style={{ margin: '16px 0', padding: '10px', background: '#f5f5f5', borderRadius: '4px' }}>
            <p style={{ margin: 0, fontSize: '12px' }}><strong>Billed To:</strong> {customerName || 'Walk-in Customer'}</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '12px' }}><strong>Phone:</strong> {customerPhone || 'Not provided'} | <strong>Payment Mode:</strong> {paymentMode} (PAID)</p>
          </div>

          {/* Table */}
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '16px' }}>
            <thead>
              <tr style={{ background: '#eee', textAlign: 'left', fontSize: '12px' }}>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>#</th>
                <th style={{ padding: '8px', border: '1px solid #ddd' }}>Service / Item</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>Qty</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Rate (₹)</th>
                <th style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, idx) => (
                <tr key={it.id} style={{ fontSize: '12px' }}>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{idx + 1}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd' }}>{it.name}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'center' }}>{it.quantity}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>₹{it.price.toFixed(2)}</td>
                  <td style={{ padding: '8px', border: '1px solid #ddd', textAlign: 'right' }}>₹{(it.price * it.quantity).toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Financial summary */}
          <div style={{ marginTop: '16px', float: 'right', width: '280px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
              <span>Subtotal:</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discountAmount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0', color: 'green' }}>
                <span>Discount ({discountPercent}%):</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}
            {taxEnabled && (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>CGST (9%):</span>
                  <span>₹{cgstAmount.toFixed(2)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', margin: '4px 0' }}>
                  <span>SGST (9%):</span>
                  <span>₹{sgstAmount.toFixed(2)}</span>
                </div>
              </>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between', margin: '8px 0', fontSize: '16px', fontWeight: 'bold', borderTop: '2px solid #000', paddingTop: '6px' }}>
              <span>Grand Total:</span>
              <span>₹{grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <div style={{ clear: 'both', paddingTop: '40px', textAlign: 'center', fontSize: '11px', color: '#666' }}>
            <p style={{ margin: 0 }}>Thank you for choosing Lumière Salon! Have a wonderful day.</p>
          </div>
        </div>
      </div>
    </div>
  );
};
