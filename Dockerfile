FROM node:18-alpine

# Install dependencies for LiteFS
RUN apk add --no-cache openssl ca-certificates fuse3 sqlite

# Install LiteFS binary
COPY --from=flyio/litefs:0.5 /usr/local/bin/litefs /usr/local/bin/litefs

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci --legacy-peer-deps

# Copy LiteFS configuration
COPY litefs.yml /etc/litefs.yml

COPY . .

# Build the application
RUN npm run build

ENV NODE_ENV=production

# Use LiteFS as entrypoint which will start our application
ENTRYPOINT ["litefs", "mount"]
