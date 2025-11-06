// src/drizzle.config.ts
import { drizzle } from 'drizzle-orm';
import postgres from 'postgres';

// Create Postgres client with a pool
const sql = postgres({
  host: 'localhost',
  port: 5432,
  username: 'your_user',
  password: 'your_password',
  database: 'your_db',
  max: 10,         // max connections in pool
  idle_timeout: 30 // seconds
});

// Export Drizzle instance
export const db = drizzle(sql);
