# Exemplo otimizado

# Stage 1 - Build
FROM node:18-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install --production=false

COPY . .
RUN npm run build

# Certifique que /app/dist existe aqui
RUN ls -la /app/dist

# Stage 2 - Runtime
FROM node:18-alpine
WORKDIR /app

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json .

CMD ["node", "dist/server.js"]
