FROM node:20-slim

RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files + lockfile for fast npm ci
COPY package.json package-lock.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# npm ci is 2-3x faster than npm install. Then add missing Linux native binaries.
RUN npm ci && \
    npm install @rollup/rollup-linux-x64-gnu lightningcss-linux-x64-gnu @esbuild/linux-x64 --no-save 2>/dev/null || true

# Copy source
COPY . .

# Build: Prisma generate + db push + compile both workspaces
RUN cd backend && npx prisma generate && npx prisma db push && cd .. && npm run build

CMD ["npm", "start", "--workspace=backend"]
