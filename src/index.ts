import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { callApi } from './helper.js'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/trsage', async (c) => {
    const body = await c.req.json()
    const result =  await callApi(body.apiUrl);
    return c.json({ success: true, message: result })
})

const port = 3000
console.log(`Server is running on http://localhost:${port}`)

serve({
  fetch: app.fetch,
  port
})
