FROM node:22-bookworm-slim AS base
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates openssl \
    && rm -rf /var/lib/apt/lists/*

FROM base AS build
WORKDIR /app
ENV PRISMA_GENERATE_SKIP_AUTOINSTALL=1
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
COPY prisma.config.ts tsconfig.json ./
RUN DATABASE_URL=postgresql://build:build@localhost:5432/build npx prisma generate --schema=prisma/schema
COPY src ./src
COPY docs ./docs
RUN npm run build

FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=4000
COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/docs ./docs
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/prisma.config.ts ./prisma.config.ts
RUN mkdir -p /app/temp && chown node:node /app/temp
USER node
EXPOSE 4000
CMD ["node", "dist/index.js"]
