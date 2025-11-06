import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import { db, todosTable } from "./db/db";

const app = new Hono();

// Middleware
app.use("*", logger());
app.use("*", cors());

// Health check route
app.get("/", async (c) => {
  try {
    const result = await db.select().from(todosTable).limit(1);
    return c.json({
      status: "ok",
      message: "Server is running",
      dbStatus: "connected",
      sample: result,
    });
  } catch (err) {
    return c.json(
      {
        status: "error",
        message: "Database connection failed",
        error: err,
      },
      500
    );
  }
});

// Start server
async function startServer() {
  try {
    await db.select().from(todosTable).limit(1); // test query
    console.log("Database connected successfully");

    Bun.serve({
      fetch: app.fetch,
      port: 3000,
    });

    console.log("Server running at http://localhost:3000");
  } catch (err) {
    console.error("Failed to connect to database:", err);
    process.exit(1);
  }
}

startServer();

export default app;
