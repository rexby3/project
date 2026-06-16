# ── Build stage: install all deps and build web + server ──
FROM node:22-slim AS build
WORKDIR /app

# Install dependencies first (better layer caching)
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
RUN npm install

# Build: web (vite) + server (esbuild bundle)
COPY . .
RUN npm run build

# ── Runtime stage: only production deps + build output ──
FROM node:22-slim AS run
WORKDIR /app
ENV NODE_ENV=production

# Production dependencies only
COPY package.json package-lock.json ./
COPY server/package.json ./server/package.json
COPY web/package.json ./web/package.json
RUN npm install --omit=dev && npm cache clean --force

# Compiled server + built web
COPY --from=build /app/server/dist ./server/dist
COPY --from=build /app/web/dist ./web/dist

EXPOSE 8080
CMD ["node", "server/dist/index.js"]
