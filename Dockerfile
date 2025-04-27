# -------- Base Stage ----------
  FROM node:20-alpine AS base

  ENV NODE_ENV production
  
  RUN apk add --no-cache libc6-compat openssl1.1-compat sqlite g++ python3
  
  WORKDIR /app
  
  # -------- Deps Stage ----------
  FROM base AS deps
  
  COPY package.json package-lock.json* ./
  RUN npm ci --omit=dev
  
  # -------- Builder Stage ----------
  FROM base AS builder
  
  WORKDIR /app
  
  COPY --from=deps /app/node_modules ./node_modules
  COPY package.json ./
  COPY prisma ./prisma
  COPY public ./public
  COPY src ./src
  
  # Prisma generate
  RUN npx prisma generate --schema=./prisma/schema.prisma
  
  # Remix build
  RUN npm run build
  
  # -------- Runner Stage ----------
  FROM base AS runner
  
  WORKDIR /app
  
  COPY --from=builder /app/node_modules ./node_modules
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/build ./build
  COPY --from=builder /app/package.json ./package.json
  
  ENV DATABASE_URL="file:./prisma/data.db"
  ENV PORT=3000
  ENV HOSTNAME=0.0.0.0
  
  EXPOSE 3000
  
  CMD ["npm", "run", "start"]
  