import Fastify from 'fastify'

interface OrderItem {
  productId: number
  quantity: number
  price: number
}

interface Order {
  id: number
  items: OrderItem[]
  total: number
  createdAt: string
}

interface OrderRequest {
  items?: Array<{ productId?: number; quantity?: number }>
}

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001'
const app = Fastify({ logger: true })

const orders: Order[] = []

app.get('/health', async () => ({ status: 'ok' }))

app.get('/orders', async () => orders)

app.get('/orders/:id', async (request, reply) => {
  const id = Number((request.params as { id: string }).id)
  const order = orders.find((item) => item.id === id)

  if (!order) {
    return reply.status(404).send({ message: 'Order not found' })
  }

  return order
})

app.post('/orders', async (request, reply) => {
  const body = request.body as OrderRequest

  if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
    return reply.status(400).send({ message: 'Order must contain items' })
  }

  const aggregatedItems = body.items.reduce<Record<number, number>>((acc, item) => {
    const productId = Number(item.productId)
    const quantity = Number(item.quantity)

    if (!Number.isInteger(productId) || !Number.isInteger(quantity) || quantity <= 0) {
      return acc
    }

    acc[productId] = (acc[productId] || 0) + quantity
    return acc
  }, {})

  const orderItems: OrderItem[] = []

  for (const [productIdString, quantity] of Object.entries(aggregatedItems)) {
    const productId = Number(productIdString)
    const response = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}`)

    if (response.status === 404) {
      return reply.status(404).send({ message: `Product ${productId} not found` })
    }

    if (!response.ok) {
      return reply.status(502).send({ message: 'Unable to reach product service' })
    }

    const product = await response.json() as { id: number; price: number; stock: number }

    if (product.stock < quantity) {
      return reply.status(409).send({ message: `Insufficient stock for product ${productId}` })
    }

    const updatedStock = product.stock - quantity
    const patchResponse = await fetch(`${PRODUCT_SERVICE_URL}/products/${productId}/stock`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ stock: updatedStock })
    })

    if (!patchResponse.ok) {
      return reply.status(502).send({ message: 'Failed to update product stock' })
    }

    orderItems.push({ productId, quantity, price: product.price })
  }

  const total = orderItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const order: Order = {
    id: orders.length + 1,
    items: orderItems,
    total,
    createdAt: new Date().toISOString()
  }

  orders.push(order)
  return reply.status(201).send(order)
})

const port = Number(process.env.PORT || 3002)

app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`Order Service listening on http://0.0.0.0:${port}`)
})
