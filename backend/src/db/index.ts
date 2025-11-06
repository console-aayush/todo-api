// connecting drizzle with postgres
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

import * as schema from "./schema";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });