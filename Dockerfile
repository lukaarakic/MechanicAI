# ---- Stage 1: Base (Dependencies) ----
  FROM node:22 AS base
  WORKDIR /app
  
  COPY package*.json ./
  RUN npm i \
  && npx prisma generate \
  && npm run build \
  && npm prune --omit=dev
  
  # # ---- Stage 2: Builder ----
  # FROM node:20 AS builder
  # WORKDIR /app
  
  # COPY --from=base /app/node_modules ./node_modules
  # COPY . .
  
  # ENV DATABASE_URL="file:./prisma/data.db"
  # RUN npx prisma db push
  # RUN npx prisma generate
  # RUN npm run build
  
  # ---- Stage 3: Production ----
  FROM node:22 AS production
  WORKDIR /app
  
  COPY --from=base /app/build ./build
  COPY --from=base /app/public ./public
  COPY --from=base /app/node_modules ./node_modules
  COPY --from=base /app/package.json ./package.json
  COPY --from=base /app/prisma ./prisma
  
  # ENV NODE_ENV=production
  # ENV DATABASE_URL="file:./prisma/data.db"
  
  EXPOSE 3000
  
  CMD ["npm", "run", "start"]
  