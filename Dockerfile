FROM node:23-alpine AS builder
COPY . /app
WORKDIR /app
RUN npm install

FROM cgr.dev/chainguard/node:latest

LABEL org.opencontainers.image.authors="Ed Addario"
LABEL org.opencontainers.image.url="https://github.com/EAddario/askhal"
ENV NODE_OPTIONS="--no-deprecation"
ENV NODE_NO_WARNINGS=1

COPY --from=builder /app /app
WORKDIR /app

ENTRYPOINT [ "node", "askhal.js" ]
