#!/bin/bash

# MeCabal Web App - SSL Certificate Diagnostic Script
# This script helps diagnose ACME challenge issues

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Determine webroot directory based on nginx container mount
WEBROOT="/var/www/certbot"
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  # Get the actual host path from nginx container mount
  # Try to extract from docker inspect JSON output
  MOUNT_PATH=$(docker inspect mecabal-nginx 2>/dev/null | \
    grep -A 10 "Mounts" | \
    grep -A 5 "/var/www/certbot" | \
    grep '"Source"' | \
    head -1 | \
    sed 's/.*"Source": *"\([^"]*\)".*/\1/' || echo "")
  
  # Alternative: try to parse the mount string directly
  if [ -z "$MOUNT_PATH" ]; then
    MOUNT_INFO=$(docker inspect mecabal-nginx 2>/dev/null | grep -A 2 "/var/www/certbot" | grep -o '"[^"]*:/var/www/certbot' | head -1 | sed 's/":\/var\/www\/certbot//' | tr -d '"' || echo "")
    if [ -n "$MOUNT_INFO" ]; then
      MOUNT_PATH="$MOUNT_INFO"
    fi
  fi
  
  if [ -n "$MOUNT_PATH" ] && [ -d "$MOUNT_PATH" ]; then
    WEBROOT="$MOUNT_PATH"
  else
    # Try common backend paths
    if [ -d "/root/mecabal/backend/ssl" ]; then
      WEBROOT="/root/mecabal/backend/ssl"
    elif [ -d "$(pwd)/../mecabal/backend/ssl" ]; then
      WEBROOT="$(cd "$(pwd)/../mecabal/backend" && pwd)/ssl"
    fi
  fi
fi

TEST_FILE="test-$(date +%s).txt"
TEST_PATH="$WEBROOT/.well-known/acme-challenge/$TEST_FILE"

echo -e "${GREEN}=== SSL Certificate Diagnostic Tool ===${NC}\n"

# 1. Check if webroot directory exists
echo -e "${GREEN}1. Checking webroot directory...${NC}"
if [ -d "$WEBROOT" ]; then
  echo -e "${GREEN}   ✓ Directory exists: $WEBROOT${NC}"
  ls -la "$WEBROOT" | head -5
else
  echo -e "${RED}   ✗ Directory does not exist: $WEBROOT${NC}"
  echo -e "${YELLOW}   Creating directory...${NC}"
  mkdir -p "$WEBROOT"
  chmod 755 "$WEBROOT"
fi

# 2. Check nginx container
echo -e "\n${GREEN}2. Checking nginx container...${NC}"
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  echo -e "${GREEN}   ✓ Nginx container is running${NC}"
  docker ps -f name=mecabal-nginx --format "   Container: {{.Names}} ({{.Status}})"
  
  # Check volume mounts
  echo -e "\n   Checking volume mounts:"
  if docker inspect mecabal-nginx 2>/dev/null | grep -q "/var/www/certbot"; then
    echo -e "${GREEN}   ✓ /var/www/certbot volume is mounted${NC}"
    docker inspect mecabal-nginx 2>/dev/null | grep -A 2 "/var/www/certbot" | head -3
  else
    echo -e "${RED}   ✗ /var/www/certbot volume is NOT mounted${NC}"
    echo -e "${YELLOW}   This is likely the problem!${NC}"
  fi
else
  echo -e "${RED}   ✗ Nginx container is not running${NC}"
fi

# 3. Check nginx config
echo -e "\n${GREEN}3. Checking nginx configuration...${NC}"
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  if docker exec mecabal-nginx nginx -t 2>&1 | grep -q "successful"; then
    echo -e "${GREEN}   ✓ Nginx configuration is valid${NC}"
  else
    echo -e "${RED}   ✗ Nginx configuration has errors:${NC}"
    docker exec mecabal-nginx nginx -t 2>&1
  fi
  
  # Check if ACME challenge location exists
  echo -e "\n   Checking for ACME challenge location block:"
  if docker exec mecabal-nginx nginx -T 2>/dev/null | grep -A 3 "location.*\.well-known/acme-challenge" | head -4; then
    echo -e "${GREEN}   ✓ ACME challenge location block found${NC}"
  else
    echo -e "${RED}   ✗ ACME challenge location block NOT found${NC}"
  fi
fi

# 4. Test file creation and access
echo -e "\n${GREEN}4. Testing file creation and HTTP access...${NC}"

# Create .well-known/acme-challenge directory structure
mkdir -p "$WEBROOT/.well-known/acme-challenge"
chmod -R 755 "$WEBROOT/.well-known"

# Create test file
echo "diagnostic-test" > "$TEST_PATH"
chmod 644 "$TEST_PATH"
echo -e "${GREEN}   ✓ Created test file: $TEST_PATH${NC}"

# Wait a moment
sleep 2

# Test HTTP access
echo -e "\n   Testing HTTP access to challenge file:"
for domain in "mecabal.com" "www.mecabal.com" "api.mecabal.com"; do
  echo -n "   Testing $domain... "
  if curl -f -s -o /dev/null -w "%{http_code}" "http://$domain/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null | grep -q "200"; then
    echo -e "${GREEN}✓ Accessible (200)${NC}"
    curl -s "http://$domain/.well-known/acme-challenge/$TEST_FILE"
  else
    HTTP_CODE=$(curl -f -s -o /dev/null -w "%{http_code}" "http://$domain/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null || echo "000")
    echo -e "${RED}✗ Not accessible (HTTP $HTTP_CODE)${NC}"
    
    # Try from inside nginx container if it's Docker
    if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
      echo -n "     Testing from inside nginx container... "
      if docker exec mecabal-nginx curl -f -s -o /dev/null -w "%{http_code}" "http://localhost/.well-known/acme-challenge/$TEST_FILE" 2>/dev/null | grep -q "200"; then
        echo -e "${GREEN}✓ Works from container${NC}"
        echo -e "${YELLOW}     Issue: External access blocked or DNS not pointing to server${NC}"
      else
        echo -e "${RED}✗ Also fails from container${NC}"
        echo -e "${YELLOW}     Issue: Nginx not serving the files correctly${NC}"
      fi
    fi
  fi
done

# 5. Check file permissions
echo -e "\n${GREEN}5. Checking file permissions...${NC}"
ls -la "$TEST_PATH"
if [ -r "$TEST_PATH" ]; then
  echo -e "${GREEN}   ✓ File is readable${NC}"
else
  echo -e "${RED}   ✗ File is not readable${NC}"
fi

# 6. Check DNS
echo -e "\n${GREEN}6. Checking DNS resolution...${NC}"
for domain in "mecabal.com" "www.mecabal.com" "api.mecabal.com"; do
  DNS_IP=$(dig +short "$domain" 2>/dev/null | head -1)
  SERVER_IP=$(curl -s ifconfig.me 2>/dev/null || curl -s icanhazip.com 2>/dev/null || echo "unknown")
  echo -n "   $domain: "
  if [ -n "$DNS_IP" ]; then
    echo -e "DNS → $DNS_IP"
    if [ "$DNS_IP" = "$SERVER_IP" ] || [ "$SERVER_IP" = "unknown" ]; then
      echo -e "${GREEN}     ✓ DNS appears correct${NC}"
    else
      echo -e "${YELLOW}     ⚠ Server IP: $SERVER_IP (may not match)${NC}"
    fi
  else
    echo -e "${RED}     ✗ DNS resolution failed${NC}"
  fi
done

# 7. Check nginx logs
echo -e "\n${GREEN}7. Recent nginx error logs:${NC}"
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  docker logs mecabal-nginx --tail 20 2>&1 | grep -i "error\|acme\|challenge" || echo "   No relevant errors found"
else
  if [ -f "/var/log/nginx/error.log" ]; then
    tail -20 /var/log/nginx/error.log | grep -i "error\|acme\|challenge" || echo "   No relevant errors found"
  fi
fi

# Cleanup
echo -e "\n${GREEN}8. Cleaning up test file...${NC}"
rm -f "$TEST_PATH"
echo -e "${GREEN}   ✓ Test file removed${NC}"

echo -e "\n${GREEN}=== Diagnostic Complete ===${NC}"
echo -e "${YELLOW}If HTTP access tests failed, check:${NC}"
echo -e "${YELLOW}1. Nginx volume mounts (especially /var/www/certbot)${NC}"
echo -e "${YELLOW}2. Nginx configuration is loaded correctly${NC}"
echo -e "${YELLOW}3. DNS points to this server${NC}"
echo -e "${YELLOW}4. Port 80 is open and accessible${NC}"

