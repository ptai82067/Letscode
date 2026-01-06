# Multi-stage Dockerfile for backend (Go + Fiber)
# Production-ready Dockerfile for Render deployment

# builder
FROM golang:1.21-alpine AS builder
WORKDIR /app

# install git and ca-certificates for private modules if needed
RUN apk add --no-cache git ca-certificates && update-ca-certificates

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -tags netgo -ldflags "-s -w" -o server ./cmd/server/main.go

# final image
FROM alpine:3.18
RUN apk add --no-cache ca-certificates wget

WORKDIR /app
COPY --from=builder /app/server ./server

# Health check for Docker
HEALTHCHECK --interval=10s --timeout=5s --retries=5 \
    CMD wget --quiet --tries=1 --spider http://localhost:${PORT:-8080}/api/auth/me || exit 1

# Default environment variables for local Docker development
# These will be overridden by:
# 1. docker-compose.yml environment section (local dev)
# 2. Render.com environment variables (production)
ENV DATABASE_URL=""
ENV DB_HOST="postgres"
ENV DB_PORT="5432"
ENV DB_USER="postgres"
ENV DB_PASSWORD="postgres"
ENV DB_NAME="courseai_db"
ENV DB_SSLMODE="disable"
ENV ENV="development"
ENV PORT="8080"
ENV JWT_SECRET="dev_secret_change_in_production"
ENV JWT_EXPIRE_HOURS="24"
ENV FRONTEND_URL="http://localhost:5173"

EXPOSE 8080
CMD ["./server"]
