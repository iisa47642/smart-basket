FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM nginx:stable-alpine

# The project supplies its own config; avoid the image's package-metadata lookup on startup.
RUN rm /docker-entrypoint.d/10-listen-on-ipv6-by-default.sh
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80
