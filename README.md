# Lumière — Mini Salon Booking & Billing System

A modern, mobile-friendly, full-stack salon management and booking web application built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Libsql SQLite**, featuring real-time smart slot availability, administrative management, PDF invoicing, and an integrated multilingual AI Chatbot.

---

## 🌟 Key Features

### 1. 🗄️ Database & Seed Data
- **Tables**:
  - `services`: `id`, `name`, `price`, `duration`
  - `bookings`: `id`, `customer_name`, `phone`, `service`, `date`, `time`, `status`, `created_at`
- **Unique Constraint & Prevention**: `UNIQUE(date, time) WHERE status != 'Cancelled'` guarantees that no two customers can double-book the same slot.
- **Seeded Services**:
  1. Haircut — ₹200 (30 min)
  2. Beard Trim — ₹100 (15 min)
  3. Hair Spa — ₹800 (45 min)
  4. Facial — ₹500 (40 min)
  5. Bridal Makeup — ₹5,000 (120 min)
- **Seeded Bookings**: 3 sample bookings covering `Confirmed`, `Pending`, and `Done` statuses.
- **Seed Script**: Run anytime with `npm run seed`.

---

### 2. ⚡ Backend API Routes
All endpoints feature strict server-side validation:
- `GET /services` & `GET /api/services`: Returns all available salon services, prices, and durations.
- `POST /bookings` & `POST /api/bookings`:
  - Validates all required fields (`customer_name`, `phone`, `service`, `date`, `time`).
  - Strict 10-digit phone number check (`/^\d{10}$/`).
  - Rejects past dates.
  - Verifies service exists in the database.
  - Double-booking prevention: Returns HTTP `409 Conflict` if the requested slot is already booked.
- `GET /bookings` & `GET /api/bookings`: Retrieves bookings for the admin dashboard with optional `?date=YYYY-MM-DD`, `?status=...`, and `?search=...` filters.
- `PATCH /bookings/:id` & `PATCH /api/bookings/:id`: Updates booking status (`Pending`, `Confirmed`, `Done`, `Cancelled`) or reschedules date/time with conflict checks.
- `DELETE /api/bookings/:id`: Cancels a booking, freeing up the slot.
- `GET /api/slots?date=YYYY-MM-DD`: Returns dynamic availability for all 22 operational slots from 09:00 AM to 08:00 PM.
- `GET /api/customer-lookup?phone=XXXXXXXXXX`: Allows customers to look up their appointments.
- `POST /api/chat`: AI Assistant endpoint reading real-time database prices.

---

### 3. 💇 Customer Booking Page
- **Mobile-Responsive UI**: Crafted with a luxury dark slate and champagne gold aesthetic.
- **Live Price Display**: Selecting a service instantly highlights its price (e.g. `₹200`) and duration (`30 mins`).
- **Smart Time Slots**: As soon as a date is chosen, slots are fetched live from the backend. Booked slots are clearly labeled as `Booked` and disabled to prevent double bookings on the client.
- **Instant Confirmation**: Celebratory confetti animation and an appointment confirmation card displaying:
  `"Your booking is confirmed for [time], [date]"` along with a unique reference number (`#BKG-XXXX`).
- **Self-Service Rescheduling & Cancellation**: Customers can enter their 10-digit mobile number in the **"My Bookings"** tab to reschedule their slot or cancel their booking.

---

### 4. 📊 Admin Dashboard & Billing POS
- **Operations Dashboard**:
  - Metrics cards: Total Bookings, Confirmed, Pending, Completed, Estimated Revenue.
  - Date & status filter tabs + real-time search by customer or phone.
  - Instant status update dropdown (`Pending` ➔ `Confirmed` ➔ `Done` / `Cancelled`).
  - **Day Timeline View**: Visual calendar grouping bookings by time slot from 09:00 AM to 08:00 PM.
- **Billing Terminal & POS**:
  - Load customer details directly from a booking or enter walk-in customers.
  - **Multi-Service Selection**: Select multiple services (e.g., Haircut + Hair Spa + Beard Trim) with quantity controls.
  - Add custom items or retail products (e.g. hair serum, styling wax).
  - Auto-calculated subtotal, 18% GST (CGST + SGST breakdown toggle), and percentage discount.
  - **Downloadable PDF Invoice**: Generates high-resolution branded tax invoice using `jspdf`.
  - **Print Invoice**: Clean thermal/A4 print stylesheet with one click.

---

### 5. 🤖 Multilingual AI Chatbot ("Lumi")
- Embedded floating chat widget on the booking page.
- Directly connected to `/api/chat`, fetching real database pricing and timing dynamically.
- Understands **English**, **Hindi**, **Hinglish** (*"Haircut ka kitna lagega?"*), and **Marathi** (*"Hair spa che charges kay ahet?"*).
- **Out-of-Scope Declination**: Politely declines any non-salon requests (e.g., *"Ghar pe aakar haircut karoge kya?"* / home delivery).
- Supports Google Gemini API when `GEMINI_API_KEY` is provided in `.env`, and includes an intelligent built-in multilingual fallback NLP engine so it functions 100% out of the box with zero external setup.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Tested on Node v24.18.0)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Seed Database
Initialize and seed the SQLite database with services and sample bookings:
```bash
npm run seed
```

### 4. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 5. (Optional) Configure Gemini API Key
To enable Gemini for the AI Chatbot, add your key to `.env`:
```env
GEMINI_API_KEY="your-gemini-api-key-here"
```
*(If left empty, the built-in intelligent multilingual fallback engine handles queries automatically).*
