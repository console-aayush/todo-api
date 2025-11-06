
import { Hono } from 'hono';
import { db, todosTable } from '../db/db';
import { eq } from 'drizzle-orm';

const router = new Hono();

// GET all todos
router.get('/', async (c) => {
  try {
    const todos = await db.select().from(todosTable);
    return c.json(todos);
  } catch (err) {
    return c.json({ error: 'Failed to fetch todos', details: err }, 500);
  }
});

// GET single todo by ID
router.get('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const todo = await db.select().from(todosTable).where(eq(todosTable.id, id));
    if (!todo || todo.length === 0) {
      return c.json({ error: 'Todo not found' }, 404);
    }
    return c.json(todo[0]);
  } catch (err) {
    return c.json({ error: 'Failed to fetch todo', details: err }, 500);
  }
});

// POST create new todo
router.post('/', async (c) => {
  try {
    const body = await c.req.json();
    const result = await db
      .insert(todosTable)
      .values({
        title: body.title,
        completed: body.completed ?? false,
      })
      .returning();
    return c.json(result[0], 201);
  } catch (err) {
    return c.json({ error: 'Failed to create todo', details: err }, 500);
  }
});

// PUT update todo
router.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const body = await c.req.json();
    const result = await db
      .update(todosTable)
      .set({
        title: body.title,
        completed: body.completed,
      })
      .where(eq(todosTable.id, id))
      .returning();
    if (!result || result.length === 0) {
      return c.json({ error: 'Todo not found' }, 404);
    }
    return c.json(result[0]);
  } catch (err) {
    return c.json({ error: 'Failed to update todo', details: err }, 500);
  }
});

// DELETE todo
router.delete('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const result = await db.delete(todosTable).where(eq(todosTable.id, id)).returning();
    if (!result || result.length === 0) {
      return c.json({ error: 'Todo not found' }, 404);
    }
    return c.json({ message: 'Todo deleted successfully', deleted: result[0] });
  } catch (err) {
    return c.json({ error: 'Failed to delete todo', details: err }, 500);
  }
});

export default router;
