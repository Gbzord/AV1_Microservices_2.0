import Fastify from 'fastify'
import httpProxy from '@fastify/http-proxy'

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3001'
const ORDER_SERVICE_URL = process.env.ORDER_SERVICE_URL || 'http://localhost:3002'

const app = Fastify({ logger: true })

app.register(httpProxy, {
  upstream: PRODUCT_SERVICE_URL,
  prefix: '/products',
  rewritePrefix: '/products'
})

app.register(httpProxy, {
  upstream: ORDER_SERVICE_URL,
  prefix: '/orders',
  rewritePrefix: '/orders'
})

app.get('/health', async () => ({ status: 'ok' }))

const port = Number(process.env.PORT || 3000)

app.listen({ port, host: '0.0.0.0' }).then(() => {
  app.log.info(`API Gateway listening on http://0.0.0.0:${port}`)
})
