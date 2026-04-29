#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Ports used by the application
FRONTEND_PORT=3000
BACKEND_PORT=3001

echo -e "${YELLOW}🔧 NutriGuide Development Server Startup${NC}"
echo "==========================================="

# Function to kill process on a specific port
kill_port() {
    local port=$1
    local pid=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pid" ]; then
        echo -e "${YELLOW}⚠️  Port $port is in use by PID $pid. Killing...${NC}"
        kill -9 $pid 2>/dev/null
        sleep 1
        echo -e "${GREEN}✓ Port $port is now free${NC}"
    else
        echo -e "${GREEN}✓ Port $port is available${NC}"
    fi
}

# Kill existing processes on required ports
echo -e "\n${YELLOW}Checking ports...${NC}"
kill_port $FRONTEND_PORT
kill_port $BACKEND_PORT

echo -e "\n${GREEN}🚀 Starting development servers...${NC}\n"

# Start both servers concurrently
# Backend runs with tsx watch (auto-restarts on changes)
# Frontend runs with Vite (HMR enabled)
cd "$(dirname "$0")/.."

# Run backend and frontend in parallel
(cd server && npm run dev) &
BACKEND_PID=$!

sleep 2

npm run dev &
FRONTEND_PID=$!

echo -e "\n${GREEN}✓ Backend running on http://localhost:$BACKEND_PORT (PID: $BACKEND_PID)${NC}"
echo -e "${GREEN}✓ Frontend running on http://localhost:$FRONTEND_PORT (PID: $FRONTEND_PID)${NC}"
echo -e "\n${YELLOW}Press Ctrl+C to stop both servers${NC}\n"

# Handle cleanup on exit
cleanup() {
    echo -e "\n${YELLOW}Shutting down servers...${NC}"
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    kill_port $FRONTEND_PORT
    kill_port $BACKEND_PORT
    echo -e "${GREEN}✓ Servers stopped${NC}"
    exit 0
}

trap cleanup SIGINT SIGTERM

# Wait for both processes
wait
