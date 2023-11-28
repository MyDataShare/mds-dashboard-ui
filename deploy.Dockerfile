FROM node:18.17.1-alpine

# Install nginx & bash – bash is needed by e.g. the entrypoint script
RUN apk add nginx bash

WORKDIR /usr/src/app

# Create a user for the app and set its permissions
RUN addgroup -S appuser \
    && adduser -H -S -D appuser -G appuser  \
    && chmod -R 770 ./ \
    && chown appuser: -R ./ \
    && mkdir -p /usr/share/nginx/html \
    && chown appuser: -R /usr/share/nginx/html \
    && chown appuser: -R /var/lib/nginx \
    && chown appuser: -R /var/log/nginx

# Install production dependencies
COPY package*.json ./
COPY mydatashare-core-*.tgz ./
COPY tsconfig.json ./
# Prevent running 'prepare' package.json script, which tries to install husky (a dev dependency)
RUN npm pkg delete scripts.prepare
RUN npm ci --omit=dev

# Copy source files
COPY src src/
COPY public public/

ENV GENERATE_SOURCEMAP=false
ENV INLINE_RUNTIME_CHUNK=false

# Build React app
RUN npm run build
RUN mv build/index.html build/index.html.orig
RUN mv ./build/* /usr/share/nginx/html

# Copy nginx configuration
COPY nginx/base-nginx.conf /etc/nginx/nginx.conf
COPY nginx/nginx.conf /etc/nginx/sites-enabled/default.conf

# nginx will serve content on this port
EXPOSE 5000

USER appuser

COPY entrypoint.sh ./
ENTRYPOINT ./entrypoint.sh
