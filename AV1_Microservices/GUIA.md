# AV1 Microserviços Node.js

## Visão geral
Arquitetura:
- Cliente → `api-gateway` (`:3000`)
- `/products/*` → `product-service` (`:3001`)
- `/orders/*` → `order-service` (`:3002`)
- `order-service` consulta `product-service` internamente ao criar pedidos

## Instruções
### Instalação local
```bash
npm install
```

### Rodando em desenvolvimento
```bash
npm run dev
```

### Rodando individualmente
```bash
npm run product
npm run order
npm run gateway
```

### Docker
```bash
docker compose up --build
```

```bash
docker compose up --build -d
```

```bash
docker compose down
```

## Testes com curl
### Products
Listar todos
```bash
curl http://localhost:3000/products
```

Buscar por ID
```bash
curl http://localhost:3000/products/1
```

Criar produto
```bash
curl -X POST http://localhost:3000/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Headset Pro","price":450,"stock":20}'
```

### Orders
Criar pedido
```bash
curl -X POST http://localhost:3000/orders \
  -H "Content-Type: application/json" \
  -d '{"items":[{"productId":1,"quantity":2},{"productId":2,"quantity":1}]}'
```

Listar pedidos
```bash
curl http://localhost:3000/orders
```

Buscar pedido por ID
```bash
curl http://localhost:3000/orders/1
```

### Gateway
Health check
```bash
curl http://localhost:3000/health
```

## Variáveis de ambiente
- `PRODUCT_SERVICE_URL` (Order Service / API Gateway)
- `ORDER_SERVICE_URL` (API Gateway)

## Estrutura do projeto
```
/
├── package.json
├── tsconfig.json
├── docker-compose.yml
├── GUIA.md
└── apps/
    ├── product-service/
    │   ├── src/server.ts
    │   ├── tsconfig.json
    │   ├── Dockerfile
    │   └── package.json
    ├── order-service/
    │   ├── src/server.ts
    │   ├── tsconfig.json
    │   ├── Dockerfile
    │   └── package.json
    └── api-gateway/
        ├── src/server.ts
        ├── tsconfig.json
        ├── Dockerfile
        └── package.json
```
