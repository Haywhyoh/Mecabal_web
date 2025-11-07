#!/bin/bash

# MeCabal Web App - Production Deployment Script
# This script can be run manually on the production server for deployments

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
# Determine project directory: use PROJECT_DIR env var, or script's parent directory, or current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ -n "$PROJECT_DIR" ]; then
  # Use explicitly set PROJECT_DIR
  PROJECT_DIR="$PROJECT_DIR"
elif [ -f "$SCRIPT_DIR/../docker-compose.production.yml" ] || [ -f "$SCRIPT_DIR/../Dockerfile" ]; then
  # Script is in scripts/ subdirectory, go up one level
  PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
else
  # Fall back to current directory
  PROJECT_DIR="$(pwd)"
fi

DOCKER_IMAGE_NAME="mecabal-web-app"
DOCKER_IMAGE_TAG="${1:-latest}"
COMPOSE_FILE="docker-compose.production.yml"

echo -e "${GREEN}Starting deployment of MeCabal Web App...${NC}"
echo -e "${GREEN}Project directory: $PROJECT_DIR${NC}"

# Navigate to project directory
cd "$PROJECT_DIR" || {
  echo -e "${RED}Error: Project directory not found: $PROJECT_DIR${NC}"
  exit 1
}

# Verify we're in the right directory
if [ ! -f "Dockerfile" ] && [ ! -f "$COMPOSE_FILE" ]; then
  echo -e "${RED}Error: Does not appear to be a valid project directory${NC}"
  echo -e "${RED}Missing Dockerfile or $COMPOSE_FILE${NC}"
  exit 1
fi

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
  echo -e "${YELLOW}Warning: .env.production not found. Creating from example...${NC}"
  if [ -f ".env.production.example" ]; then
    cp .env.production.example .env.production
    echo -e "${YELLOW}Please edit .env.production with your actual values!${NC}"
  else
    echo -e "${RED}Error: .env.production.example not found!${NC}"
    exit 1
  fi
fi

# Ensure Docker network exists
echo -e "${GREEN}Ensuring Docker network exists...${NC}"
docker network inspect mecabal_mecabal-network >/dev/null 2>&1 || \
  docker network create mecabal_mecabal-network

# Pull latest code (if using git)
if [ -d ".git" ]; then
  echo -e "${GREEN}Pulling latest code...${NC}"
  git fetch origin
  git reset --hard origin/main || git reset --hard HEAD
fi

# Stop existing container gracefully
if [ "$(docker ps -q -f name=mecabal-web-app)" ]; then
  echo -e "${YELLOW}Stopping existing container...${NC}"
  docker stop mecabal-web-app || true
  docker rm mecabal-web-app || true
fi

# Build Docker image
echo -e "${GREEN}Building Docker image...${NC}"
docker build -t "$DOCKER_IMAGE_NAME:$DOCKER_IMAGE_TAG" -t "$DOCKER_IMAGE_NAME:latest" -f Dockerfile .

# Start new container
echo -e "${GREEN}Starting new container...${NC}"
docker-compose -f "$COMPOSE_FILE" up -d

# Wait for health check
echo -e "${GREEN}Waiting for container to be healthy...${NC}"
timeout=60
counter=0
while [ $counter -lt $timeout ]; do
  if docker exec mecabal-web-app node -e "require('http').get('http://localhost:3015', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})" 2>/dev/null; then
    echo -e "${GREEN}Container is healthy!${NC}"
    break
  fi
  sleep 2
  counter=$((counter + 2))
  echo -n "."
done
echo ""

if [ $counter -ge $timeout ]; then
  echo -e "${RED}Container health check failed!${NC}"
  echo -e "${YELLOW}Container logs:${NC}"
  docker logs mecabal-web-app --tail 50
  exit 1
fi

# Clean up old images (keep last 3)
echo -e "${GREEN}Cleaning up old Docker images...${NC}"
docker image prune -f
docker images "$DOCKER_IMAGE_NAME" --format "{{.ID}} {{.Tag}}" | \
  grep -v latest | \
  tail -n +4 | \
  awk '{print $1}' | \
  xargs -r docker rmi -f || true

# Reload nginx if it exists
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  echo -e "${GREEN}Reloading nginx...${NC}"
  docker exec mecabal-nginx nginx -s reload || true
fi

echo -e "${GREEN}Deployment completed successfully!${NC}"
echo -e "${GREEN}Container status:${NC}"
docker ps | grep mecabal-web-app

