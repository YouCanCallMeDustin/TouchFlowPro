FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Only copy package.json files - NO lockfile so npm resolves Linux-native deps fresh
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Cache bust: change this value to force a fresh npm install (bypasses Docker layer cache)
ARG CACHEBUST=2
RUN npm install

# Copy source
COPY . .

# Build: Prisma generate + db push + compile both workspaces
RUN cd backend && npx prisma generate && npx prisma db push && cd .. && npm run build

CMD ["npm", "start", "--workspace=backend"]
