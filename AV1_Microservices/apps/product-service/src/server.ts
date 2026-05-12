import Fastify from 'fastify'

interface Product {
  id: number
  name: string
  price: number
  stock: number
}

const app = Fastify({ logger: true })

let products: Product[] = [
  { id: 1, name: 'Keyboard Mini', price: 129.9, stock: 12 },
  { id: 2, name: 'Mouse Wireless', price: 79.9, stock: 18 },
  { id: 3, name: 'Monitor 24"', price: 799.9, stock: 8 }
]

const nextProductId = () => Math.max(0, ...products.map((product) => product.id)) + 1

app.get('/health', async () => ({ status: 'ok' }))

app.get('/products', async () => products)

app.get('/products/:id', async (request, reply) => {
  const id = Number((request.params as { id: string }).id)
  const product = products.find((item) => item.id === id)

  if (!product) {
    return reply.status(404).send({ message: 'Product not found' })
  }

  return product
})

app.post('/products', async (request, reply) => {
  const body = request.body as { name?: string; price?: number; stock?: number }

  if (!body.name || typeof body.price !== 'number' || typeof body.stock !== 'number') {
    return reply.status(400).send({ message: 'Missing name, price or stock' })
  }

  const product: Product = {
    id: nextProductId(),
    name: body.name,
    price: body.price,
    stock: body.stock
  }

  products.push(product)
  return reply.status(201).send(product)
})

app.patch('/products/:id/stock', async (request, reply) => {
  const id = Number((request.params as { id: string }).id)
  const body = request.body as { stock?: number }
  const product = products.find((item) => item.id === id)

  if (!product) {
    return reply.status(404).send({ message: 'Product not found' })
  }

  if (typeof body.stock !== 'number' || body.stock < 0) {
    return reply.status(400).send({ message: 'Stock must be a non-negative number' })
  }

  product.stock = body.stock
  return product
})

const port = Number(process.env.PORT || 3001)

app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`Product Service listening on http://0.0.0.0:${port}`)
})
