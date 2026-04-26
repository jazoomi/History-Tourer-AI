# syntax=docker/dockerfile:1
#
# Multi-stage build: `deps` installs production node_modules, `runtime` is the
# minimal image that ships. Keeps the final image small and free of devDeps.
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

FROM node:20-alpine AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json ./
COPY src ./src

# Run as the non-root `node` user baked into the official image.
USER node

EXPOSE 3000

# In docker-compose we supply env vars via env_file + environment, so we don't
# need Node's --env-file flag here.
CMD ["node", "src/index.js"]
