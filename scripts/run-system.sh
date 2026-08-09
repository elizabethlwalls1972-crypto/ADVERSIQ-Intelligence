#!/usr/bin/env bash
# ADVERSIQ System Startup & Live Training Script
# Runs backend, frontend, and training data collector with live monitoring
# Usage: bash scripts/run-system.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║      ADVERSIQ AI SYSTEM - LIVE TRAINING LAUNCHER          ║${NC}"
echo -e "${BLUE}║        Multi-Layer Autonomous Learning Platform          ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

# Check if ports are available
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    return 1  # Port is in use
  fi
  return 0  # Port is available
}

# Function to cleanup on exit
cleanup() {
  echo -e "\n${YELLOW}🛑 Shutting down...${NC}"
  pkill -f "tsx watch server/index.ts" 2>/dev/null || true
  pkill -f "vite --port 3002" 2>/dev/null || true
  echo -e "${GREEN}✅ Shutdown complete${NC}"
  exit 0
}

trap cleanup SIGINT SIGTERM

# Step 1: Verify dependencies
echo -e "${BLUE}Step 1: Checking dependencies...${NC}"
if ! command -v node &> /dev/null; then
  echo -e "${RED}❌ Node.js not found${NC}"
  exit 1
fi
if ! command -v npm &> /dev/null; then
  echo -e "${RED}❌ npm not found${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Node.js and npm found${NC}\n"

# Step 2: Install dependencies
echo -e "${BLUE}Step 2: Installing dependencies...${NC}"
if [ ! -d "node_modules" ]; then
  npm install
else
  echo -e "${GREEN}✅ Dependencies already installed${NC}"
fi
echo ""

# Step 3: Check ports
echo -e "${BLUE}Step 3: Checking ports...${NC}"
if ! check_port 3004; then
  echo -e "${YELLOW}⚠️  Port 3004 is in use. Freeing...${NC}"
  lsof -ti:3004 | xargs kill -9 2>/dev/null || true
  sleep 1
fi
if ! check_port 3002; then
  echo -e "${YELLOW}⚠️  Port 3002 is in use. Freeing...${NC}"
  lsof -ti:3002 | xargs kill -9 2>/dev/null || true
  sleep 1
fi
echo -e "${GREEN}✅ Ports 3002 and 3004 available${NC}\n"

# Step 4: Start backend server
echo -e "${BLUE}Step 4: Starting backend server (port 3004)...${NC}"
npm run dev:server > /tmp/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend process started (PID: $BACKEND_PID)${NC}"
sleep 3

# Check if backend started successfully
if ! kill -0 $BACKEND_PID 2>/dev/null; then
  echo -e "${RED}❌ Backend failed to start. Check logs:${NC}"
  cat /tmp/backend.log
  exit 1
fi
echo ""

# Step 5: Start frontend dev server
echo -e "${BLUE}Step 5: Starting frontend (port 3002)...${NC}"
npm run dev:vite > /tmp/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend process started (PID: $FRONTEND_PID)${NC}"
sleep 3
echo ""

# Step 6: Wait for system to be ready
echo -e "${BLUE}Step 6: Waiting for system to be ready...${NC}"
MAX_RETRIES=30
RETRY=0
while [ $RETRY -lt $MAX_RETRIES ]; do
  if curl -s http://localhost:3004/api/health > /dev/null 2>&1; then
    echo -e "${GREEN}✅ Backend is ready${NC}"
    break
  fi
  echo -n "."
  sleep 1
  RETRY=$((RETRY + 1))
done

if [ $RETRY -eq $MAX_RETRIES ]; then
  echo -e "${RED}❌ Backend failed to respond${NC}"
  exit 1
fi
echo ""

# Step 7: Display system status
echo -e "${BLUE}Step 7: System Status${NC}"
HEALTH=$(curl -s http://localhost:3004/api/health)
echo -e "${GREEN}Backend Response:${NC}"
echo "$HEALTH" | jq '.' 2>/dev/null || echo "$HEALTH"
echo ""

# Step 8: Start monitoring dashboard
echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║              🚀 SYSTEM IS LIVE & READY                   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Access Points:${NC}"
echo -e "  📱 Frontend:         ${BLUE}http://localhost:3002${NC}"
echo -e "  🔌 Backend API:      ${BLUE}http://localhost:3004${NC}"
echo -e "  📊 Learning Status:  ${BLUE}http://localhost:3004/api/learning-dashboard/metrics${NC}"
echo ""

echo -e "${GREEN}Monitoring URLs:${NC}"
echo -e "  💡 System Health:    ${BLUE}curl http://localhost:3004/api/health${NC}"
echo -e "  📈 Learn Metrics:    ${BLUE}curl http://localhost:3004/api/learning-dashboard/metrics${NC}"
echo -e "  🧠 Learn State:      ${BLUE}curl http://localhost:3004/api/learning-dashboard/state${NC}"
echo -e "  📊 Telemetry (50):   ${BLUE}curl http://localhost:3004/api/learning-dashboard/telemetry?limit=50${NC}"
echo -e "  🎮 Self-Play:        ${BLUE}curl http://localhost:3004/api/learning-dashboard/scenarios?limit=20${NC}"
echo -e "  💭 Insights:         ${BLUE}curl http://localhost:3004/api/learning-dashboard/insights${NC}"
echo ""

echo -e "${GREEN}Training & Testing:${NC}"
echo -e "  🚀 Start Training:   ${BLUE}tsx scripts/collect-training-data.ts${NC}"
echo -e "  📁 View Data:        ${BLUE}cat data/training_scenarios.jsonl${NC}"
echo -e "  📊 View Telemetry:   ${BLUE}tail -f data/omni_node_telemetry.jsonl${NC}"
echo -e "  🔄 Continuous Learn: ${BLUE}tail -f data/memory/conversations.jsonl${NC}"
echo ""

echo -e "${YELLOW}Press Ctrl+C to stop the system${NC}\n"

# Step 9: Live monitoring loop
echo -e "${BLUE}Monitoring system...${NC}\n"

MONITOR_INTERVAL=30
while true; do
  # Every 30 seconds, show learning progress
  clear
  echo -e "${BLUE}╔════════════════════════════════════════════════════════════╗${NC}"
  echo -e "${BLUE}║        ADVERSIQ LIVE MONITORING - $(date '+%H:%M:%S')                   ║${NC}"
  echo -e "${BLUE}╚════════════════════════════════════════════════════════════╝${NC}\n"

  echo -e "${GREEN}System Status:${NC}"
  if kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "  ✅ Backend (PID $BACKEND_PID): RUNNING"
  else
    echo -e "  ❌ Backend: STOPPED"
  fi
  if kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "  ✅ Frontend (PID $FRONTEND_PID): RUNNING"
  else
    echo -e "  ❌ Frontend: STOPPED"
  fi

  echo -e "\n${GREEN}Learning Metrics:${NC}"
  METRICS=$(curl -s http://localhost:3004/api/learning-dashboard/metrics)
  if [ ! -z "$METRICS" ]; then
    echo "$METRICS" | jq '{
      conversations: .totalConversations,
      problems: .totalProblems,
      solutions: .totalSolutions,
      success_rate: .successRate,
      confidence: .averageConfidence
    }' 2>/dev/null || echo "  (metrics loading...)"
  fi

  echo -e "\n${GREEN}System Insights:${NC}"
  INSIGHTS=$(curl -s http://localhost:3004/api/learning-dashboard/insights)
  if [ ! -z "$INSIGHTS" ]; then
    echo "$INSIGHTS" | jq '.recommendedActions[0:2]' 2>/dev/null || echo "  (insights loading...)"
  fi

  echo -e "\n${GREEN}Logs:${NC}"
  echo -e "  Backend:  $(tail -1 /tmp/backend.log | head -c 60)"
  echo -e "  Frontend: $(tail -1 /tmp/frontend.log | head -c 60)"

  echo -e "\n${YELLOW}Next update in ${MONITOR_INTERVAL}s (Press Ctrl+C to stop)${NC}\n"
  sleep $MONITOR_INTERVAL
done
