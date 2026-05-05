FROM node:20-slim

WORKDIR /app

# Copy package files
COPY package.json ./

# Delete package-lock.json and do a clean install (fixes @tailwindcss/oxide native binding bug)
RUN npm install --legacy-peer-deps

# Copy all source files
COPY . .

# Build the Vite app
RUN npm run build

# Expose port
EXPOSE 3000

# Start the server in production mode
ENV NODE_ENV=production
CMD ["npx", "tsx", "server.ts"]
