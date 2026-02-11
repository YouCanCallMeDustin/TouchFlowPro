FROM node:20.19-slim

# Required for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy all package.json files first (for better Docker layer caching)
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Fresh install - no lockfile means correct Linux native binaries
RUN npm install

# Copy everything else
COPY . .

# Generate Prisma client, push schema to create SQLite DB, and build
RUN cd backend && npx prisma generate && npx prisma db push && cd ..
RUN npm run build

EXPOSE 4000

CMD ["npm", "start", "--workspace=backend"]
