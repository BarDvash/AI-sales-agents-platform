#!/bin/bash
#
# Development environment script for AI Sales Agents Platform
#
# Usage:
#   ./scripts/dev.sh start              # Start all tenants
#   ./scripts/dev.sh start valdman      # Start specific tenant only
#   ./scripts/dev.sh stop               # Stop server + ngrok (DB stays running)
#   ./scripts/dev.sh stop valdman       # Unregister webhook for specific tenant
#   ./scripts/dev.sh restart            # Restart everything
#   ./scripts/dev.sh status             # Show running services status
#

set -e

# Project root (relative to script location)
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PID_DIR="$PROJECT_DIR/.pids"
VENV_DIR="$PROJECT_DIR/venv"
ENV_FILE="$PROJECT_DIR/.env"

# Tenant configuration
ALL_TENANTS="valdman joannas_bakery"

# Map tenant_id to env var name for bot token
get_token_var() {
    case "$1" in
        valdman) echo "VALDMAN_BOT_TOKEN" ;;
        joannas_bakery) echo "JOANNAS_BOT_TOKEN" ;;
        *) echo "" ;;
    esac
}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

log_info()  { echo -e "${BLUE}[INFO]${NC} $1"; }
log_ok()    { echo -e "${GREEN}[OK]${NC} $1"; }
log_warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Load environment variables from .env
load_env() {
    if [ ! -f "$ENV_FILE" ]; then
        log_error ".env file not found at $ENV_FILE"
        exit 1
    fi
    export $(grep -v '^#' "$ENV_FILE" | grep -v '^$' | xargs)
}

# Ensure PID directory exists
ensure_pid_dir() {
    mkdir -p "$PID_DIR"
}

# Check if a process is running by PID file
is_running() {
    local pid_file="$PID_DIR/$1.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            return 0
        fi
        # Stale PID file
        rm -f "$pid_file"
    fi
    return 1
}

# Save PID to file
save_pid() {
    echo "$2" > "$PID_DIR/$1.pid"
}

# Get PID from file
get_pid() {
    cat "$PID_DIR/$1.pid" 2>/dev/null
}

# Kill process by PID file
kill_process() {
    local name="$1"
    local pid_file="$PID_DIR/$name.pid"
    if [ -f "$pid_file" ]; then
        local pid=$(cat "$pid_file")
        if kill -0 "$pid" 2>/dev/null; then
            kill "$pid" 2>/dev/null
            # Wait for process to die
            local i=0
            while [ $i -lt 10 ]; do
                if ! kill -0 "$pid" 2>/dev/null; then
                    break
                fi
                sleep 0.5
                i=$((i + 1))
            done
            # Force kill if still running
            if kill -0 "$pid" 2>/dev/null; then
                kill -9 "$pid" 2>/dev/null
            fi
        fi
        rm -f "$pid_file"
    fi
}

# Wait for ngrok to be ready and return the public URL
get_ngrok_url() {
    local max_attempts=20
    local attempt=0
    while [ $attempt -lt $max_attempts ]; do
        local url=$(curl -s http://127.0.0.1:4040/api/tunnels 2>/dev/null | python3 -c "
import sys, json
try:
    data = json.load(sys.stdin)
    tunnels = data.get('tunnels', [])
    for t in tunnels:
        if t.get('proto') == 'https':
            print(t['public_url'])
            break
except:
    pass
" 2>/dev/null)
        if [ -n "$url" ]; then
            echo "$url"
            return 0
        fi
        attempt=$((attempt + 1))
        sleep 1
    done
    return 1
}

# Set Telegram webhook for a tenant
set_webhook() {
    local tenant_id="$1"
    local ngrok_url="$2"
    local token_var=$(get_token_var "$tenant_id")

    if [ -z "$token_var" ]; then
        log_error "Unknown tenant: $tenant_id"
        return 1
    fi

    local bot_token=$(eval echo "\$$token_var")
    if [ -z "$bot_token" ]; then
        log_error "Bot token not set for $tenant_id (env var: $token_var)"
        return 1
    fi

    local webhook_url="$ngrok_url/webhooks/telegram/$tenant_id"
    local response=$(curl -s -X POST "https://api.telegram.org/bot${bot_token}/setWebhook?url=${webhook_url}")

    if echo "$response" | python3 -c "import sys,json; r=json.load(sys.stdin); sys.exit(0 if r.get('ok') else 1)" 2>/dev/null; then
        log_ok "Webhook set for $tenant_id -> $webhook_url"
        return 0
    else
        log_error "Failed to set webhook for $tenant_id: $response"
        return 1
    fi
}

# Unset Telegram webhook for a tenant
unset_webhook() {
    local tenant_id="$1"
    local token_var=$(get_token_var "$tenant_id")

    if [ -z "$token_var" ]; then
        return 1
    fi

    local bot_token=$(eval echo "\$$token_var")
    if [ -z "$bot_token" ]; then
        return 1
    fi

    curl -s -X POST "https://api.telegram.org/bot${bot_token}/deleteWebhook" > /dev/null 2>&1
    log_ok "Webhook removed for $tenant_id"
}

# ============================================================
# COMMANDS
# ============================================================

cmd_start() {
    local tenant_filter="$1"
    load_env
    ensure_pid_dir

    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}  AI Sales Agents Platform - Starting${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""

    # 1. Check Docker is running
    if ! docker info > /dev/null 2>&1; then
        log_error "Docker is not running. Please start Docker Desktop."
        exit 1
    fi
    log_ok "Docker is running"

    # 2. Start PostgreSQL
    log_info "Starting PostgreSQL..."
    docker-compose -f "$PROJECT_DIR/docker-compose.yml" up -d postgres 2>/dev/null
    # Wait for DB to be healthy
    local db_attempts=0
    while [ $db_attempts -lt 15 ]; do
        if docker exec ai_sales_agents_db pg_isready -U sales_agent_user > /dev/null 2>&1; then
            break
        fi
        db_attempts=$((db_attempts + 1))
        sleep 1
    done
    if [ $db_attempts -ge 15 ]; then
        log_error "PostgreSQL failed to start"
        exit 1
    fi
    log_ok "PostgreSQL is ready"

    # 3. Activate venv and run migrations
    log_info "Running database migrations..."
    cd "$PROJECT_DIR"
    source "$VENV_DIR/bin/activate"
    alembic upgrade head 2>&1 | tail -1
    log_ok "Migrations complete"

    # 4. Start uvicorn (if not already running)
    if is_running "uvicorn"; then
        log_warn "Server already running (PID: $(get_pid uvicorn))"
    else
        log_info "Starting server..."
        uvicorn api.main:app --reload --log-level info > "$PID_DIR/server.log" 2>&1 &
        save_pid "uvicorn" $!
        sleep 2
        if is_running "uvicorn"; then
            log_ok "Server started (PID: $(get_pid uvicorn))"
        else
            log_error "Server failed to start. Check .pids/server.log"
            exit 1
        fi
    fi

    # 5. Start ngrok (if not already running)
    if is_running "ngrok"; then
        log_warn "ngrok already running (PID: $(get_pid ngrok))"
    else
        log_info "Starting ngrok..."
        ngrok http 8000 --log=stdout > "$PID_DIR/ngrok.log" 2>&1 &
        save_pid "ngrok" $!
        sleep 3
        if ! is_running "ngrok"; then
            log_error "ngrok failed to start. Check .pids/ngrok.log"
            exit 1
        fi
    fi

    # 6. Get ngrok URL
    log_info "Waiting for ngrok URL..."
    local ngrok_url=$(get_ngrok_url)
    if [ -z "$ngrok_url" ]; then
        log_error "Could not get ngrok URL. Is ngrok running?"
        exit 1
    fi
    log_ok "ngrok URL: $ngrok_url"

    # 7. Set webhooks
    echo ""
    log_info "Setting Telegram webhooks..."

    if [ -n "$tenant_filter" ]; then
        # Start specific tenant
        local check_var=$(get_token_var "$tenant_filter")
        if [ -z "$check_var" ]; then
            log_error "Unknown tenant: $tenant_filter. Available: $ALL_TENANTS"
            exit 1
        fi
        set_webhook "$tenant_filter" "$ngrok_url"
    else
        # Start all tenants
        for tenant_id in $ALL_TENANTS; do
            set_webhook "$tenant_id" "$ngrok_url"
        done
    fi

    # 8. Print status
    echo ""
    echo -e "${GREEN}========================================${NC}"
    echo -e "${GREEN}  All services running!${NC}"
    echo -e "${GREEN}========================================${NC}"
    echo ""
    echo -e "  Server:  http://localhost:8000"
    echo -e "  Public:  $ngrok_url"
    echo -e "  Health:  $ngrok_url/health"
    echo -e "  ngrok:   http://127.0.0.1:4040"
    echo ""
    echo -e "  ${YELLOW}Press Ctrl+C to stop all services${NC}"
    echo ""

    # 9. Tail server logs (foreground) with cleanup on exit
    trap 'echo ""; log_info "Shutting down..."; cmd_stop; exit 0' INT TERM
    tail -f "$PID_DIR/server.log"
}

cmd_stop() {
    local tenant_filter="$1"
    load_env
    ensure_pid_dir

    if [ -n "$tenant_filter" ]; then
        # Stop specific tenant webhook only
        log_info "Removing webhook for $tenant_filter..."
        unset_webhook "$tenant_filter"
        return 0
    fi

    echo ""
    log_info "Stopping services..."

    # Unset all webhooks
    for tenant_id in $ALL_TENANTS; do
        unset_webhook "$tenant_id"
    done

    # Kill ngrok
    kill_process "ngrok"
    log_ok "ngrok stopped"

    # Kill uvicorn
    kill_process "uvicorn"
    log_ok "Server stopped"

    # Clean up log files
    rm -f "$PID_DIR"/*.log

    echo ""
    log_ok "All services stopped (PostgreSQL still running)"
    echo ""
}

cmd_restart() {
    cmd_stop
    sleep 1
    cmd_start "$1"
}

cmd_status() {
    load_env
    ensure_pid_dir

    echo ""
    echo -e "${BLUE}Service Status:${NC}"
    echo ""

    # Docker/PostgreSQL
    if docker exec ai_sales_agents_db pg_isready -U sales_agent_user > /dev/null 2>&1; then
        log_ok "PostgreSQL: running"
    else
        log_error "PostgreSQL: not running"
    fi

    # Uvicorn
    if is_running "uvicorn"; then
        log_ok "Server: running (PID: $(get_pid uvicorn))"
    else
        log_error "Server: not running"
    fi

    # ngrok
    if is_running "ngrok"; then
        local url=$(get_ngrok_url)
        log_ok "ngrok: running ($url)"
    else
        log_error "ngrok: not running"
    fi

    # Webhooks
    echo ""
    echo -e "${BLUE}Tenant Webhooks:${NC}"
    for tenant_id in $ALL_TENANTS; do
        local token_var=$(get_token_var "$tenant_id")
        local bot_token=$(eval echo "\$$token_var")
        if [ -n "$bot_token" ]; then
            local info=$(curl -s "https://api.telegram.org/bot${bot_token}/getWebhookInfo")
            local webhook_url=$(echo "$info" | python3 -c "import sys,json; print(json.load(sys.stdin).get('result',{}).get('url','(not set)'))" 2>/dev/null)
            echo -e "  $tenant_id: $webhook_url"
        fi
    done
    echo ""
}

# ============================================================
# MAIN
# ============================================================

case "${1:-}" in
    start)
        cmd_start "$2"
        ;;
    stop)
        cmd_stop "$2"
        ;;
    restart)
        cmd_restart "$2"
        ;;
    status)
        cmd_status
        ;;
    *)
        echo ""
        echo "Usage: $0 {start|stop|restart|status} [tenant_id]"
        echo ""
        echo "Commands:"
        echo "  start [tenant]    Start all services (or specific tenant webhook only)"
        echo "  stop [tenant]     Stop all services (or remove specific tenant webhook)"
        echo "  restart [tenant]  Restart all services"
        echo "  status            Show running services status"
        echo ""
        echo "Available tenants: $ALL_TENANTS"
        echo ""
        exit 1
        ;;
esac
