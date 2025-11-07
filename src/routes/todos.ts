import { Hono } from 'hono';
import { db, todosTable } from '../db/db';
import { eq } from 'drizzle-orm';

const router = new Hono();

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
    const result = await db.insert(todosTable).values({
      title: body.title,
      completed: body.completed ?? false,
      category: body.category ?? 'General',
    });
    return c.json({ message: 'ok', todo: body }, 201);
  } catch (err) {
    return c.json({ error: 'Failed to create todo', details: err }, 500);
  }
});

// PUT update todo
router.put('/:id', async (c) => {
  const id = Number(c.req.param('id'));
  try {
    const body = await c.req.json();
    const result = await db.update(todosTable)
      .set({
        title: body.title,
        completed: body.completed,
        category: body.category ?? 'General',
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
    if (!result || result.length === 0) return c.json({ error: 'Todo not found' }, 404);
    return c.json({ message: 'Deleted successfully', deleted: result[0] });
  } catch (err) {
    return c.json({ error: 'Failed to delete todo', details: err }, 500);
  }
});

export default router;
