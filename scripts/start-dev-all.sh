#!/bin/bash

# One-command dev startup for macOS / Linux
# 
# What it does:
# - Ensure Docker is available and start services via docker-compose.yml
# - Detect/create PostgreSQL database automatically
# - Download Go modules and start backend as background process
# - Install frontend deps (if needed) and start Vite dev server
#
# Usage (from repo root):
#   ./scripts/start-dev-all.sh
#
# Notes:
# - Requires: Docker, Docker Compose, Go 1.21+, Node.js 18+
# - Background processes are logged to ./logs/
# - Script must be run from repository root or scripts/ directory

set -e

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Utility functions
print_header() {
    echo -e "${BLUE}== $1 ==${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

has_command() {
    command -v "$1" &> /dev/null
}

# Determine script root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(dirname "$SCRIPT_DIR")"
cd "$REPO_ROOT"

# Create logs directory
LOGS_DIR="$REPO_ROOT/logs"
mkdir -p "$LOGS_DIR"
BACKEND_OUT_LOG="$LOGS_DIR/backend.out.log"
BACKEND_ERR_LOG="$LOGS_DIR/backend.err.log"
FRONTEND_OUT_LOG="$LOGS_DIR/frontend.out.log"
FRONTEND_ERR_LOG="$LOGS_DIR/frontend.err.log"

print_header "start-dev-all.sh: starting development environment"

# ============================================================================
# Step 1: Docker & PostgreSQL
# ============================================================================
print_header "1) Docker / PostgreSQL"

if ! has_command docker; then
    print_error "Docker CLI not found. Please install Docker Desktop."
    echo "  macOS: brew install docker docker-compose"
    echo "  Linux: https://docs.docker.com/engine/install/"
    exit 1
fi

# Check Docker daemon
echo "Checking Docker daemon..."
if ! docker info &> /dev/null; then
    print_error "Docker daemon not available. Please start Docker Desktop and try again."
    exit 1
fi

print_success "Docker daemon is running"

# Start services
echo "Starting PostgreSQL and Adminer via docker-compose..."
docker-compose up -d 2>&1 | grep -E "Running|Created|Pulling" || true

# Wait for PostgreSQL on 127.0.0.1:5433
echo "Waiting for PostgreSQL on 127.0.0.1:5433 (timeout 60s)..."
TIMEOUT=60
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if nc -z 127.0.0.1 5433 2>/dev/null; then
        print_success "PostgreSQL is reachable"
        break
    fi
    ELAPSED=$((ELAPSED + 2))
    sleep 2
done

if [ $ELAPSED -ge $TIMEOUT ]; then
    print_error "PostgreSQL did not become reachable within 60s"
    echo "  Check logs: docker logs courseai_postgres"
    exit 1
fi

# Wait for Adminer on 127.0.0.1:8082
echo "Waiting for Adminer on 127.0.0.1:8082 (timeout 30s)..."
TIMEOUT=30
ELAPSED=0
while [ $ELAPSED -lt $TIMEOUT ]; do
    if nc -z 127.0.0.1 8082 2>/dev/null; then
        print_success "Adminer is reachable at http://127.0.0.1:8082"
        break
    fi
    ELAPSED=$((ELAPSED + 2))
    sleep 2
done

# Create database if missing
echo "Creating database 'courseai_db' if it doesn't exist..."
docker exec courseai_postgres psql -U postgres -c "CREATE DATABASE courseai_db;" 2>&1 || true
print_success "Database setup complete"

# ============================================================================
# Step 2: Go Toolchain
# ============================================================================
print_header "2) Go toolchain"

if ! has_command go; then
    print_error "Go not found on PATH. Backend cannot start."
    echo "  Install Go 1.21+: https://go.dev/dl/"
    exit 1
fi

GO_VERSION=$(go version | awk '{print $3}')
print_success "Go $GO_VERSION found"

# ============================================================================
# Step 3: Backend
# ============================================================================
print_header "3) Backend"

BACKEND_DIR="$REPO_ROOT/backend"

if [ ! -d "$BACKEND_DIR" ]; then
    print_warning "Backend directory not found: $BACKEND_DIR"
else
    cd "$BACKEND_DIR"

    # Download modules
    echo "Downloading Go modules..."
    go mod download 2>&1 | tail -1

    # Check port 8080 is free
    if nc -z 127.0.0.1 8080 2>/dev/null; then
        print_error "Port 8080 is already in use"
        echo "  Run: $REPO_ROOT/scripts/stop-dev-all.sh"
        exit 1
    fi

    # Start backend
    echo "Starting backend (logs: $BACKEND_OUT_LOG)..."
    nohup go run cmd/server/main.go > "$BACKEND_OUT_LOG" 2> "$BACKEND_ERR_LOG" &
    BACKEND_PID=$!
    echo "$BACKEND_PID" > "$LOGS_DIR/backend.pid"

    # Wait for port 8080 (max 10 seconds)
    TIMEOUT=10
    ELAPSED=0
    while [ $ELAPSED -lt $TIMEOUT ]; do
        if nc -z 127.0.0.1 8080 2>/dev/null; then
            print_success "Backend is running on http://127.0.0.1:8080 (PID: $BACKEND_PID)"
            break
        fi
        ELAPSED=$((ELAPSED + 1))
        sleep 1
    done

    if [ $ELAPSED -ge $TIMEOUT ]; then
        print_error "Backend did not start within 10s"
        echo "  Check logs: $BACKEND_ERR_LOG"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi

    cd "$REPO_ROOT"
fi

# ============================================================================
# Step 4: Frontend
# ============================================================================
print_header "4) Frontend"

FRONTEND_DIR="$REPO_ROOT/frontend"

if [ ! -d "$FRONTEND_DIR" ]; then
    print_warning "Frontend directory not found: $FRONTEND_DIR"
else
    # Check for node_modules
    if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
        if ! has_command npm; then
            print_warning "npm not found. Cannot install frontend dependencies."
            echo "  Install Node.js 18+: https://nodejs.org/"
        else
            echo "Installing frontend dependencies..."
            cd "$FRONTEND_DIR"
            npm install 2>&1 | tail -3
            cd "$REPO_ROOT"
        fi
    fi

    if has_command npm; then
        # Check if Vite is already running (ports 5173-5185)
        VITE_PID=$(lsof -ti:5173 2>/dev/null || true)

        if [ -n "$VITE_PID" ]; then
            print_success "Frontend already running on port 5173 (PID: $VITE_PID)"
            echo "$VITE_PID" > "$LOGS_DIR/frontend.pid"
        else
            echo "Starting frontend dev server (logs: $FRONTEND_OUT_LOG)..."
            cd "$FRONTEND_DIR"
            nohup npm run dev > "$FRONTEND_OUT_LOG" 2> "$FRONTEND_ERR_LOG" &
            FRONTEND_PID=$!
            echo "$FRONTEND_PID" > "$LOGS_DIR/frontend.pid"
            cd "$REPO_ROOT"

            # Wait for port 5173 (max 15 seconds)
            TIMEOUT=15
            ELAPSED=0
            while [ $ELAPSED -lt $TIMEOUT ]; do
                if nc -z 127.0.0.1 5173 2>/dev/null; then
                    print_success "Frontend is running on http://127.0.0.1:5173 (PID: $FRONTEND_PID)"
                    break
                fi
                ELAPSED=$((ELAPSED + 1))
                sleep 1
            done

            if [ $ELAPSED -ge $TIMEOUT ]; then
                print_warning "Frontend did not open a port in time. Check logs: $FRONTEND_ERR_LOG"
            fi
        fi
    fi
fi

# ============================================================================
# Final Summary
# ============================================================================
echo ""
print_header "Development environment ready!"
echo ""
echo "Services:"
echo "  PostgreSQL:  127.0.0.1:5433 (Adminer: http://127.0.0.1:8082)"
echo "  Backend:     http://127.0.0.1:8080/api"
echo "  Frontend:    http://127.0.0.1:5173"
echo ""
echo "Logs:"
echo "  Backend:   $BACKEND_ERR_LOG"
echo "  Frontend:  $FRONTEND_ERR_LOG"
echo ""
echo "To stop all services, run:"
echo "  $REPO_ROOT/scripts/stop-dev-all.sh"
echo ""
