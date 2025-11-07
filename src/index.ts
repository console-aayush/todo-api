import { Hono } from "hono";
import { logger } from "hono/logger";
import { cors } from "hono/cors";
import todosRouter from './routes/todos';
import { db, todosTable } from "./db/db";

const app = new Hono();


app.use('*', cors({ origin: '*' }));

// Health check route
app.get("/", async (c) => {
    return c.json({
      status: "ok",
      message: "Server is running",
    });
});

//routes
app.route('/todos', todosRouter);


    Bun.serve({
      fetch: app.fetch,
      port: 3000,
    });



export default app;
