######### First Stage: Development/Build #########

FROM node:20-alpine AS development

WORKDIR /app

# Kopiramo samo package fajlove i instaliramo dependencije
COPY --chown=node:node package.json package-lock.json ./
RUN npm ci

# Kopiramo ceo projekat
COPY --chown=node:node . .

# Generišemo Prisma klijenta
RUN npx prisma generate

# Gradimo Remix aplikaciju
RUN npm run build

# Uklanjamo dev dependencije
RUN npm prune --omit=dev

######### Second Stage: Production #########

FROM node:20-alpine AS production

WORKDIR /app

# Kopiramo samo ono što je potrebno za produkciju
COPY --chown=node:node --from=development /app/node_modules ./node_modules
COPY --chown=node:node --from=development /app/build ./build
COPY --chown=node:node --from=development /app/public ./public
COPY --chown=node:node --from=development /app/package.json ./package.json
COPY --chown=node:node --from=development /app/prisma ./prisma

# Setujemo env varijable
ENV NODE_ENV=production
ENV DATABASE_URL="file:./prisma/data.db"

# Koristimo non-root usera
USER node

# Expose-ujemo port
EXPOSE 3000

# Startujemo Remix server
CMD ["npm", "run", "start"]
