# ---------- Base Stage ----------
  FROM node:20-alpine AS base

  # Install general dependencies
  RUN apk add --no-cache libc6-compat openssl1.1-compat
  
  WORKDIR /app
  
  # ---------- Deps Stage ----------
  FROM base AS deps
  
  COPY package.json package-lock.json ./
  RUN npm ci
  
  # ---------- Builder Stage ----------
  FROM base AS builder
  
  WORKDIR /app
  
  COPY --from=deps /app/node_modules ./node_modules
  COPY --from=deps /app/package-lock.json ./package-lock.json
  
  COPY . .
  
  ENV DATABASE_URL="file:./prisma/data.db"
  RUN npx prisma generate
  
  RUN npm run build
  
  # ---------- Production Stage ----------
  FROM base AS production
  
  WORKDIR /app
  
  ENV NODE_ENV=production
  ENV DATABASE_URL="file:./prisma/data.db"
  
  COPY --from=builder /app/build ./build
  COPY --from=builder /app/public ./public
  COPY --from=builder /app/prisma ./prisma
  COPY --from=builder /app/package.json ./package.json
  COPY --from=builder /app/node_modules ./node_modules
  
  EXPOSE 3000
  
  CMD ["npm", "run", "start"]
  