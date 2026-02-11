FROM node:20.19-slim

WORKDIR /app

# Copy all package.json files first (for better Docker layer caching)
COPY package.json ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Fresh install - no lockfile means correct Linux native binaries
RUN npm install

# Copy everything else
COPY . .

# Generate Prisma client and build both workspaces
RUN npm run build

EXPOSE 4000

CMD ["npm", "start", "--workspace=backend"]
