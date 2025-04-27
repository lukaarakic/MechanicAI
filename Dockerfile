# 1. Base image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and lock file
COPY package*.json ./

# 4. Install all deps
RUN npm install

# 5. Copy everything else
COPY . .

# 6. Prisma setup
ENV DATABASE_URL="file:./prisma/data.db"
RUN npx prisma db push
RUN npx prisma generate

# 7. Build your Remix app
RUN npm run build

# 8. Expose the port
EXPOSE 3000

# 9. Start the app
CMD ["npm", "run", "start"]
