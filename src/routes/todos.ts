import { Hono } from 'hono';
import { db, todosTable } from '../db/db';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

const router = new Hono();

// Zod schema for validating todos
const todoSchema = z.object({
  title: z.string().min(1, "Title cannot be empty").refine((val) => isNaN(Number(val)), {
    message: "Title cannot be a number",
  }),
  completed: z.boolean().optional(),
  category: z.string().default("General"),
});

// GET all todos (with optional search)
router.get('/', async (c) => {
  try {
    const search = c.req.query('search') || '';
    let todos = await db.select().from(todosTable);

    if (search) {
      const lowerSearch = search.toLowerCase();
      todos = todos.filter(todo => todo.title.toLowerCase().includes(lowerSearch));
    }

    return c.json(todos);
  } catch (err) {
    return c.json({ error: 'Failed to fetch todos', details: err }, 500);
  }
});

// POST new todo
router.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const validated = todoSchema.parse(body); // throws if invalid

    await db.insert(todosTable).values({
      title: validated.title,
      completed: validated.completed ?? false,
      category: validated.category,
    });

    return c.json({ message: 'Todo created successfully', todo: validated }, 201);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: err.errors }, 400);
    }
    return c.json({ error: 'Failed to create todo', details: err }, 500);
  }
});

// PUT update todo
router.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const body = await c.req.json();
    const validated = todoSchema.parse(body);

    const result = await db.update(todosTable)
      .set({
        title: validated.title,
        completed: validated.completed,
        category: validated.category,
      })
      .where(eq(todosTable.id, id))
      .returning();

    if (!result || result.length === 0) {
      return c.json({ error: 'Todo not found' }, 404);
    }

    return c.json(result[0]);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return c.json({ error: 'Validation failed', details: err.errors }, 400);
    }
    return c.json({ error: 'Failed to update todo', details: err }, 500);
  }
});

// DELETE todo
router.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const result = await db.delete(todosTable).where(eq(todosTable.id, id)).returning();
    if (!result || result.length === 0) return c.json({ error: 'Todo not found' }, 404);
    return c.json({ message: 'Deleted successfully', deleted: result[0] });
  } catch (err) {
    return c.json({ error: 'Failed to delete todo', details: err }, 500);
  }
});

export default router;
