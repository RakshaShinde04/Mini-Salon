import { createClient } from '@libsql/client';
import dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DATABASE_URL || 'file:salon.db';
const client = createClient({ url: dbUrl });

export async function initAndSeed(force = false) {
  console.log(`[DB] Connecting to ${dbUrl}...`);

  // Create tables
  await client.execute(`
    CREATE TABLE IF NOT EXISTS services (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      price REAL NOT NULL,
      duration INTEGER NOT NULL
    );
  `);

  await client.execute(`
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

  await client.execute(`
    CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_slot 
    ON bookings (date, time) 
    WHERE status != 'Cancelled';
  `);

  const servicesCountRes = await client.execute('SELECT COUNT(*) as count FROM services');
  const servicesCount = Number(servicesCountRes.rows[0].count);

  if (servicesCount === 0 || force) {
    console.log('[DB] Seeding services table...');
    if (force) {
      await client.execute('DELETE FROM services');
      await client.execute('DELETE FROM bookings');
    }

    const services = [
      { name: 'Haircut', price: 200, duration: 30 },
      { name: 'Beard Trim', price: 100, duration: 15 },
      { name: 'Hair Spa', price: 800, duration: 45 },
      { name: 'Facial', price: 500, duration: 40 },
      { name: 'Bridal Makeup', price: 5000, duration: 120 },
    ];

    for (const s of services) {
      await client.execute({
        sql: `INSERT OR REPLACE INTO services (name, price, duration) VALUES (?, ?, ?)`,
        args: [s.name, s.price, s.duration],
      });
    }
    console.log(`[DB] Successfully seeded ${services.length} services.`);

    // Current date in YYYY-MM-DD
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
      await client.execute({
        sql: `INSERT INTO bookings (customer_name, phone, service, date, time, status) VALUES (?, ?, ?, ?, ?, ?)`,
        args: [b.customer_name, b.phone, b.service, b.date, b.time, b.status],
      });
    }
    console.log(`[DB] Successfully seeded ${sampleBookings.length} sample bookings.`);
  } else {
    console.log(`[DB] Database already contains ${servicesCount} services. Skipping seed.`);
  }
}

// When executed directly via node scripts/seed.mjs
if (process.argv[1]?.endsWith('seed.mjs')) {
  initAndSeed(true)
    .then(() => {
      console.log('Seed completed successfully!');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed failed:', err);
      process.exit(1);
    });
}
