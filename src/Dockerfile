# Multi-stage build of the Next.js app

# Download dependencies defined in package.json
FROM node:21-alpine AS dependencies
RUN apk add --no-cache libc6-compat
WORKDIR /next-app

COPY package.json package-lock.json ./
RUN npm install

# Build the app
FROM node:21-alpine AS builder
WORKDIR /next-app
COPY --from=dependencies /next-app/node_modules ./node_modules
COPY . .

ENV IS_BUILD true
ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Run the app in production mode
FROM node:21-alpine AS runner
WORKDIR /next-app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 next-group
RUN adduser --system --uid 1001 next-user

COPY --from=builder --chown=next-user:next-group /next-app/.next ./.next
COPY --from=builder /next-app/node_modules ./node_modules
COPY --from=builder /next-app/package.json ./package.json

USER next-user

EXPOSE 3000

ENV PORT 3000

CMD ["npm", "start"]