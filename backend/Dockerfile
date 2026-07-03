# backend/Dockerfile

FROM node:20-alpine AS base
WORKDIR /app

# ── Install dependencies first (layer caching) ──────────────
COPY backend/package*.json ./
RUN npm install --omit=dev

# ── Copy source ──────────────────────────────────────────────
COPY backend/ .

# Express + Socket.io default port
EXPOSE 5000

ENV NODE_ENV=production

CMD ["node", "server.js"]