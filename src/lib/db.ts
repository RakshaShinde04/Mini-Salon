import { createClient, Client } from '@libsql/client';
import fs from 'fs';
import path from 'path';

export interface Service {
  id: number;
  name: string;
  price: number;
  duration: number; // in minutes
}

export interface Booking {
  id: number;
  customer_name: string;
  phone: string;
  service: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm (24hr format)
  status: 'Pending' | 'Confirmed' | 'Done' | 'Cancelled';
  created_at: string;
}

let dbInstance: Client | null = null;
let initialized = false;

export function getDb(): Client {
  if (!dbInstance) {
    let rawUrl = process.env.DATABASE_URL?.trim() || 'file:./dev.db';
    // Automatically sanitize and strip accidental notes like '(ya Turso cloud URL)'
    rawUrl = rawUrl.replace(/\s*\(.*?\)/g, '').trim();
    if (!rawUrl) rawUrl = 'file:./dev.db';

    // On Vercel serverless, root directory is read-only.
    // If using a local file, mirror it to /tmp so bookings (writes) succeed without permission errors.
    if (process.env.VERCEL && rawUrl.startsWith('file:')) {
      try {
        const tmpDb = '/tmp/dev.db';
        if (!fs.existsSync(tmpDb)) {
          const rootDb = path.join(process.cwd(), 'dev.db');
          if (fs.existsSync(rootDb)) {
            fs.copyFileSync(rootDb, tmpDb);
          }
        }
        rawUrl = `file:${tmpDb}`;
      } catch (err) {
        console.warn('Notice: Could not mirror database to /tmp on Vercel:', err);
      }
    }

    const authToken = process.env.TURSO_AUTH_TOKEN || process.env.DATABASE_AUTH_TOKEN;
    dbInstance = createClient({
      url: rawUrl,
      authToken: authToken ? authToken.trim() : undefined,
    });
  }
  return dbInstance;
}

export async function ensureDbInitialized() {
  if (initialized) return;
  const db = getDb();

  // Create tables
  await db.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      duration INTEGER NOT NULL
    );
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS bookings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      service TEXT NOT NULL,
      date TEXT NOT NULL,
      time TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'Pending',
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );
  `);

  await db.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_slot 
    ON bookings (date, time) 
    WHERE status != 'Cancelled';
  `);

  // Check if services exist, if not seed them
  const countRes = await db.execute('SELECT COUNT(*) as count FROM services');
  const count = Number(countRes.rows[0].count);

  if (count === 0) {
    const services = [
      { name: 'Haircut', price: 200, duration: 30 },
      { name: 'Beard Trim', price: 100, duration: 15 },
      { name: 'Hair Spa', price: 800, duration: 45 },
      { name: 'Facial', price: 500, duration: 40 },
      { name: 'Bridal Makeup', price: 5000, duration: 120 },
    ];

    for (const s of services) {
      await db.execute({
        sql: `INSERT OR REPLACE INTO services (name, price, duration) VALUES (?, ?, ?)`,
        args: [s.name, s.price, s.duration],
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const sampleBookings = [
      {
        customer_name: 'Priya Sharma',
        phone: '9876543210',
        service: 'Haircut',
        date: today,
        time: '10:00',
        status: 'Confirmed',
      },
      {
        customer_name: 'Rahul Verma',
        phone: '9823456781',
        service: 'Beard Trim',
        date: today,
        time: '11:30',
        status: 'Pending',
      },
      {
        customer_name: 'Anjali Patil',
        phone: '9812345678',
        service: 'Facial',
        date: today,
        time: '14:00',
        status: 'Done',
      },
    ];

    for (const b of sampleBookings) {
      await db.execute({
        sql: `INSERT OR IGNORE INTO bookings (customer_name, phone, service, date, time, status) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [b.customer_name, b.phone, b.service, b.date, b.time, b.status],
      });
    }
  }

  initialized = true;
}

export async function getAllServices(): Promise<Service[]> {
  await ensureDbInitialized();
  const db = getDb();
  const res = await db.execute('SELECT * FROM services ORDER BY price ASC');
  return res.rows.map((r) => ({
    id: Number(r.id),
    name: String(r.name),
    price: Number(r.price),
    duration: Number(r.duration),
  }));
}

export async function getBookings(filters?: {
  date?: string;
  status?: string;
  search?: string;
}): Promise<Booking[]> {
  await ensureDbInitialized();
  const db = getDb();

  let query = 'SELECT * FROM bookings WHERE 1=1';
  const args: any[] = [];

  if (filters?.date) {
    query += ' AND date = ?';
    args.push(filters.date);
  }

  if (filters?.status && filters.status !== 'All') {
    query += ' AND status = ?';
    args.push(filters.status);
  }

  if (filters?.search && filters.search.trim()) {
    query += ' AND (customer_name LIKE ? OR phone LIKE ? OR service LIKE ?)';
    const term = `%${filters.search.trim()}%`;
    args.push(term, term, term);
  }

  query += ' ORDER BY date DESC, time ASC';

  const res = await db.execute({ sql: query, args });
  return res.rows.map((r) => ({
    id: Number(r.id),
    customer_name: String(r.customer_name),
    phone: String(r.phone),
    service: String(r.service),
    date: String(r.date),
    time: String(r.time),
    status: r.status as Booking['status'],
    created_at: String(r.created_at),
  }));
}

export async function getBookingById(id: number | string): Promise<Booking | null> {
  await ensureDbInitialized();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM bookings WHERE id = ?',
    args: [Number(id)],
  });

  if (res.rows.length === 0) return null;
  const r = res.rows[0];
  return {
    id: Number(r.id),
    customer_name: String(r.customer_name),
    phone: String(r.phone),
    service: String(r.service),
    date: String(r.date),
    time: String(r.time),
    status: r.status as Booking['status'],
    created_at: String(r.created_at),
  };
}

export async function getBookingsByPhone(phone: string): Promise<Booking[]> {
  await ensureDbInitialized();
  const db = getDb();
  const res = await db.execute({
    sql: 'SELECT * FROM bookings WHERE phone = ? ORDER BY date DESC, time ASC',
    args: [phone.trim()],
  });

  return res.rows.map((r) => ({
    id: Number(r.id),
    customer_name: String(r.customer_name),
    phone: String(r.phone),
    service: String(r.service),
    date: String(r.date),
    time: String(r.time),
    status: r.status as Booking['status'],
    created_at: String(r.created_at),
  }));
}

export async function isSlotBooked(
  date: string,
  time: string,
  excludeId?: number | string
): Promise<boolean> {
  await ensureDbInitialized();
  const db = getDb();

  let sql = "SELECT COUNT(*) as count FROM bookings WHERE date = ? AND time = ? AND status != 'Cancelled'";
  const args: any[] = [date, time];

  if (excludeId !== undefined) {
    sql += ' AND id != ?';
    args.push(Number(excludeId));
  }

  const res = await db.execute({ sql, args });
  return Number(res.rows[0].count) > 0;
}

export async function createBooking(data: {
  customer_name: string;
  phone: string;
  service: string;
  date: string;
  time: string;
}): Promise<Booking> {
  await ensureDbInitialized();
  const db = getDb();

  // Insert into bookings
  const res = await db.execute({
    sql: `INSERT INTO bookings (customer_name, phone, service, date, time, status) 
          VALUES (?, ?, ?, ?, ?, 'Confirmed')`,
    args: [data.customer_name.trim(), data.phone.trim(), data.service.trim(), data.date, data.time],
  });

  const insertedId = Number(res.lastInsertRowid);
  const created = await getBookingById(insertedId);
  if (!created) {
    throw new Error('Failed to retrieve newly created booking');
  }
  return created;
}

export async function updateBookingStatus(
  id: number | string,
  status: string
): Promise<Booking | null> {
  await ensureDbInitialized();
  const db = getDb();
  await db.execute({
    sql: 'UPDATE bookings SET status = ? WHERE id = ?',
    args: [status, Number(id)],
  });
  return getBookingById(id);
}

export async function rescheduleBooking(
  id: number | string,
  date: string,
  time: string
): Promise<Booking | null> {
  await ensureDbInitialized();
  const db = getDb();

  // Slot check
  const booked = await isSlotBooked(date, time, id);
  if (booked) {
    throw new Error('The selected time slot is already booked. Please choose another time.');
  }

  await db.execute({
    sql: "UPDATE bookings SET date = ?, time = ?, status = 'Confirmed' WHERE id = ?",
    args: [date, time, Number(id)],
  });

  return getBookingById(id);
}

export async function cancelBooking(id: number | string): Promise<Booking | null> {
  await ensureDbInitialized();
  const db = getDb();
  await db.execute({
    sql: "UPDATE bookings SET status = 'Cancelled' WHERE id = ?",
    args: [Number(id)],
  });
  return getBookingById(id);
}

export const SALON_HOURS = [
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

export async function getAvailableSlots(date: string) {
  await ensureDbInitialized();
  const db = getDb();

  const res = await db.execute({
    sql: "SELECT time, customer_name, service, status FROM bookings WHERE date = ? AND status != 'Cancelled'",
    args: [date],
  });

  const bookedMap = new Map<string, any>();
  for (const row of res.rows) {
    bookedMap.set(String(row.time), {
      customerName: String(row.customer_name),
      service: String(row.service),
      status: String(row.status),
    });
  }

  return SALON_HOURS.map((time) => {
    const isBooked = bookedMap.has(time);
    return {
      time,
      available: !isBooked,
      booking: isBooked ? bookedMap.get(time) : null,
    };
  });
}
