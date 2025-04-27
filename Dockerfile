# 1. Base image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and lock files
COPY package*.json ./

# 4. Install dependencies
RUN npm install

# 5. Copy everything else
COPY . .

# 6. Prisma database setup
ENV DATABASE_URL="file:./prisma/data.db"
RUN npx prisma generate
RUN npx prisma db push

# 7. Build the Remix app
RUN npm run build

# 8. Expose port
EXPOSE 3000

# 9. Start app
CMD ["npm", "run", "start"]
