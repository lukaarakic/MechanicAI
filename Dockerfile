# ---- Stage 1: Base (Dependencies) ----
  FROM node:20-alpine AS base
  WORKDIR /app
  
  COPY package*.json ./
  RUN npm i
  
  # ---- Stage 2: Builder ----
  FROM node:20-alpine AS builder
  WORKDIR /app
  
  COPY --from=base /app/node_modules ./node_modules
  COPY . .
  
  ENV DATABASE_URL="file:./prisma/data.db"
  RUN npx prisma generate
  RUN npm run build
  
  # ---- Stage 3: Production ----
  FROM node:20-alpine AS production
  WORKDIR /app
  
  COPY --from=builder /app/build ./build
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/package.json ./package.json
  COPY --from=builder /app/prisma ./prisma
  
  ENV NODE_ENV=production
  ENV DATABASE_URL="file:./prisma/data.db"
  
  EXPOSE 3000
  
  CMD ["npm", "run", "start"]
  