FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm install --no-audit --no-fund && npm cache clean --force
COPY . .
RUN npm run build

FROM nginx:stable-alpine

COPY --from=builder /app/out /usr/share/nginx/html
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
