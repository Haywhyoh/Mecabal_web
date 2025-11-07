#!/bin/bash

# MeCabal Web App - SSL Certificate Setup Script
# This script sets up SSL certificates using Certbot for Let's Encrypt

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
EMAIL="${CERTBOT_EMAIL:-your-email@example.com}"
DOMAINS=("mecabal.com" "www.mecabal.com" "api.mecabal.com")

echo -e "${GREEN}Setting up SSL certificates for MeCabal...${NC}"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
  echo -e "${RED}Please run as root or with sudo${NC}"
  exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
  echo -e "${YELLOW}Certbot not found. Installing...${NC}"
  if command -v apt-get &> /dev/null; then
    apt-get update
    apt-get install -y certbot
  elif command -v yum &> /dev/null; then
    yum install -y certbot
  else
    echo -e "${RED}Unable to install certbot. Please install it manually.${NC}"
    exit 1
  fi
fi

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
    echo -e "${GREEN}Detected nginx webroot mount: $WEBROOT${NC}"
  else
    # Try common backend paths
    if [ -d "/root/mecabal/backend/ssl" ]; then
      WEBROOT="/root/mecabal/backend/ssl"
      echo -e "${GREEN}Using backend SSL directory: $WEBROOT${NC}"
    elif [ -d "$(pwd)/../mecabal/backend/ssl" ]; then
      WEBROOT="$(cd "$(pwd)/../mecabal/backend" && pwd)/ssl"
      echo -e "${GREEN}Using relative backend SSL directory: $WEBROOT${NC}"
    else
      echo -e "${YELLOW}Warning: Could not detect nginx webroot mount path${NC}"
      echo -e "${YELLOW}Using default: $WEBROOT${NC}"
      echo -e "${YELLOW}If this fails, manually set WEBROOT to match nginx mount${NC}"
    fi
  fi
fi

echo -e "${GREEN}Creating webroot directory: $WEBROOT${NC}"
mkdir -p "$WEBROOT/.well-known/acme-challenge"
chmod -R 755 "$WEBROOT"

# Ensure nginx is running and can serve certbot challenges
echo -e "${GREEN}Verifying nginx configuration...${NC}"

NGINX_RUNNING=false
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  NGINX_RUNNING=true
  echo -e "${GREEN}Docker nginx container found${NC}"
  # Check if volume is mounted
  if docker inspect mecabal-nginx 2>/dev/null | grep -q "/var/www/certbot"; then
    echo -e "${GREEN}Certbot webroot volume is mounted in nginx container${NC}"
  else
    echo -e "${YELLOW}Warning: /var/www/certbot may not be mounted in nginx container${NC}"
    echo -e "${YELLOW}Make sure nginx container has volume: -v /var/www/certbot:/var/www/certbot${NC}"
  fi
elif systemctl is-active --quiet nginx 2>/dev/null || service nginx status >/dev/null 2>&1; then
  NGINX_RUNNING=true
  echo -e "${GREEN}System nginx service is running${NC}"
  # Ensure nginx can read the webroot
  chown -R www-data:www-data "$WEBROOT" 2>/dev/null || \
  chown -R nginx:nginx "$WEBROOT" 2>/dev/null || \
  chown -R "$(stat -c '%U:%G' /var/www 2>/dev/null || echo 'root:root')" "$WEBROOT"
  chmod 755 "$WEBROOT"
else
  echo -e "${RED}Error: Nginx is not running!${NC}"
  echo -e "${YELLOW}Please start nginx before running certbot:${NC}"
  echo -e "${YELLOW}  - Docker: docker start mecabal-nginx${NC}"
  echo -e "${YELLOW}  - System: sudo systemctl start nginx${NC}"
  exit 1
fi

# Test if nginx can serve files from webroot
echo -e "${GREEN}Testing nginx access to webroot...${NC}"
mkdir -p "$WEBROOT/.well-known/acme-challenge"
TEST_FILE="$WEBROOT/.well-known/acme-challenge/test-$(date +%s).txt"
echo "test" > "$TEST_FILE"
chmod 644 "$TEST_FILE"

# Test HTTP access to the test file
sleep 2
if curl -f -s "http://localhost/.well-known/acme-challenge/$(basename $TEST_FILE)" >/dev/null 2>&1 || \
   curl -f -s "http://mecabal.com/.well-known/acme-challenge/$(basename $TEST_FILE)" >/dev/null 2>&1; then
  echo -e "${GREEN}Nginx can serve files from webroot${NC}"
  rm -f "$TEST_FILE"
else
  echo -e "${YELLOW}Warning: Could not verify nginx can serve webroot files${NC}"
  echo -e "${YELLOW}This might be okay if nginx is behind a firewall or not accessible from localhost${NC}"
  rm -f "$TEST_FILE"
  
  # Verify nginx config has the location block
  if [ "$NGINX_RUNNING" = true ]; then
    if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
      echo -e "${GREEN}Reloading nginx to ensure latest config is active...${NC}"
      docker exec mecabal-nginx nginx -s reload 2>/dev/null || true
      sleep 2
      
      if docker exec mecabal-nginx nginx -T 2>/dev/null | grep -q "location.*\.well-known/acme-challenge"; then
        echo -e "${GREEN}Nginx config includes ACME challenge location block${NC}"
        # Show the actual config being used
        echo -e "${YELLOW}Active nginx config for ACME challenge:${NC}"
        docker exec mecabal-nginx nginx -T 2>/dev/null | grep -A 3 "location.*\.well-known/acme-challenge" | head -4
      else
        echo -e "${RED}Error: Nginx config missing ACME challenge location block!${NC}"
        echo -e "${YELLOW}Make sure your nginx config includes:${NC}"
        echo -e "${YELLOW}  location /.well-known/acme-challenge/ {${NC}"
        echo -e "${YELLOW}      root /var/www/certbot;${NC}"
        echo -e "${YELLOW}  }${NC}"
        echo -e "${YELLOW}And that the config file is mounted/loaded in the nginx container${NC}"
        exit 1
      fi
    elif [ -f "/etc/nginx/sites-available/mecabal" ] || [ -f "/etc/nginx/conf.d/mecabal.conf" ]; then
      echo -e "${GREEN}Reloading nginx to ensure latest config is active...${NC}"
      systemctl reload nginx 2>/dev/null || service nginx reload 2>/dev/null || true
      sleep 2
      
      if grep -q "location.*\.well-known/acme-challenge" /etc/nginx/sites-available/mecabal /etc/nginx/conf.d/mecabal.conf 2>/dev/null; then
        echo -e "${GREEN}Nginx config includes ACME challenge location block${NC}"
      else
        echo -e "${RED}Error: Nginx config missing ACME challenge location block!${NC}"
        exit 1
      fi
    fi
  fi
fi

# Obtain certificates - combine all domains in one request (recommended)
echo -e "${GREEN}Obtaining certificates for all domains...${NC}"

# Check if any certificates already exist
EXISTING_DOMAINS=()
for domain in "${DOMAINS[@]}"; do
  if [ -d "/etc/letsencrypt/live/$domain" ]; then
    EXISTING_DOMAINS+=("$domain")
  fi
done

if [ ${#EXISTING_DOMAINS[@]} -gt 0 ]; then
  echo -e "${YELLOW}Certificates already exist for: ${EXISTING_DOMAINS[*]}${NC}"
  echo -e "${YELLOW}To renew existing certificates, use: sudo certbot renew${NC}"
  echo -e "${YELLOW}Continuing with certificate request...${NC}"
fi

# Build domain list for certbot
DOMAIN_ARGS=()
for domain in "${DOMAINS[@]}"; do
  DOMAIN_ARGS+=("-d" "$domain")
done

# Obtain certificate for all domains at once
echo -e "${GREEN}Requesting certificate for: ${DOMAINS[*]}${NC}"
if certbot certonly \
  --webroot \
  --webroot-path="$WEBROOT" \
  --email "$EMAIL" \
  --agree-tos \
  --no-eff-email \
  --non-interactive \
  --verbose \
  "${DOMAIN_ARGS[@]}"; then
  echo -e "${GREEN}Successfully obtained certificates!${NC}"
else
  echo -e "${RED}Failed to obtain certificates${NC}"
  echo -e "${YELLOW}Troubleshooting steps:${NC}"
  echo -e "${YELLOW}1. Verify nginx is running and accessible:${NC}"
  echo -e "${YELLOW}   curl -I http://mecabal.com${NC}"
  echo -e "${YELLOW}2. Verify domain DNS points to this server:${NC}"
  echo -e "${YELLOW}   dig mecabal.com +short${NC}"
  echo -e "${YELLOW}3. Test webroot access manually:${NC}"
  echo -e "${YELLOW}   echo 'test' > $WEBROOT/test.txt${NC}"
  echo -e "${YELLOW}   curl http://mecabal.com/.well-known/acme-challenge/test.txt${NC}"
  echo -e "${YELLOW}4. Check nginx logs:${NC}"
  if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
    echo -e "${YELLOW}   docker logs mecabal-nginx${NC}"
  else
    echo -e "${YELLOW}   tail -f /var/log/nginx/error.log${NC}"
  fi
  echo -e "${YELLOW}5. Verify nginx config includes ACME challenge location block${NC}"
  exit 1
fi

# Set up auto-renewal
echo -e "${GREEN}Setting up certificate auto-renewal...${NC}"

# Create renewal hook script
HOOK_SCRIPT="/etc/letsencrypt/renewal-hooks/deploy/reload-nginx.sh"
mkdir -p "$(dirname "$HOOK_SCRIPT")"
cat > "$HOOK_SCRIPT" << 'EOF'
#!/bin/bash
# Reload nginx after certificate renewal

if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  docker exec mecabal-nginx nginx -s reload
else
  systemctl reload nginx || service nginx reload
fi
EOF

chmod +x "$HOOK_SCRIPT"

# Test renewal (dry run)
echo -e "${GREEN}Testing certificate renewal (dry run)...${NC}"
certbot renew --dry-run

# Set up cron job for auto-renewal (if not already set)
CRON_JOB="0 2 1 * * certbot renew --quiet --deploy-hook $HOOK_SCRIPT"
if ! crontab -l 2>/dev/null | grep -q "certbot renew"; then
  (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
  echo -e "${GREEN}Added cron job for automatic certificate renewal${NC}"
else
  echo -e "${YELLOW}Cron job for certificate renewal already exists${NC}"
fi

echo -e "${GREEN}SSL certificate setup completed!${NC}"
echo -e "${GREEN}Certificates are located in: /etc/letsencrypt/live/${NC}"
echo -e "${YELLOW}Make sure your nginx configuration points to these certificate paths${NC}"

