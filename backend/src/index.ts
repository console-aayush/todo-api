import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => c.text('Hello from Hono + Bun + TypeScript!'))

Bun.serve({
  fetch: app.fetch,
  port: 3000,
})

console.log('Server running at http://localhost:3000')
