FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
COPY next.config.js ./
COPY chartCache.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force
COPY . .
RUN npm run build


FROM node:20-alpine AS runner
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --omit=dev

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/chartCache.json ./chartCache.json

# Expose port
EXPOSE 3000

# Run Next.js in production
CMD ["npm", "start"]