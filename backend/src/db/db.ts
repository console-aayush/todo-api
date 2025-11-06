// src/db/db.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Create Postgres client with pooling
const sql = postgres(process.env.DATABASE_URL || "", {
  max: 10,
  idle_timeout: 30,
});

// Drizzle instance
export const db = drizzle(sql, { schema });

// Export the tables individually
export const todosTable = schema.todos;
