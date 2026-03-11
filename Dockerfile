# ─────────────────────────────────────────
# Stage 1: Build do Angular
# ─────────────────────────────────────────
FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev=false

COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: Servir com Nginx
# ─────────────────────────────────────────
FROM nginx:alpine

COPY --from=builder /app/dist/sindycondo/browser /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
