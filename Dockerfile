# Base image
FROM node:18-slim

# Install OpenSSL for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Set Production Environment Variables BEFORE build
ENV NODE_ENV=production
ENV DATABASE_URL="file:///app/backend/prisma/dev.db"
ENV PORT=3001

# Copy root config files
COPY package.json package-lock.json ./

# Copy workspaces
COPY backend ./backend
COPY frontend ./frontend
COPY shared ./shared

# Install dependencies
RUN npm install

# Build: Prisma generate + compile both workspaces
RUN cd backend && npx prisma generate && cd .. && npm run build

# Expose the API port
EXPOSE 3001

# Run migrations/seed and start
# We ensure the prisma folder exists and is writable
# We also log the DB URL being used for push to verify context
CMD ["sh", "-c", "mkdir -p backend/prisma && echo 'Running DB Push against: '$DATABASE_URL && cd backend && npx prisma db push --accept-data-loss && cd .. && npm start --workspace=backend"]
