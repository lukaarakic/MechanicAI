# 1. Base image
FROM node:20

# 2. Set working directory
WORKDIR /app

# 3. Copy package.json and lock file
COPY package*.json ./

# 4. Install only production dependencies first (if needed for smaller image)
RUN npm install

# 5. Copy the rest of your app
COPY . .

# 6. Build your Remix app
RUN npm run build

# 7. Expose the port
EXPOSE 3000

# 8. Run the production server
CMD ["npm", "run", "start"]