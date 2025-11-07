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

# Create webroot directory for certbot challenges
WEBROOT="/var/www/certbot"
mkdir -p "$WEBROOT"

# Ensure nginx is running and can serve certbot challenges
echo -e "${GREEN}Ensuring nginx can serve certbot challenges...${NC}"
if docker ps -q -f name=mecabal-nginx >/dev/null 2>&1; then
  # If using Docker nginx, ensure volume is mounted
  echo -e "${YELLOW}Make sure nginx container has /var/www/certbot volume mounted${NC}"
else
  # If using system nginx, ensure webroot is accessible
  if [ ! -d "/etc/nginx/sites-available" ]; then
    echo -e "${YELLOW}Nginx configuration directory not found. Skipping nginx setup.${NC}"
  fi
fi

# Obtain certificates for each domain
for domain in "${DOMAINS[@]}"; do
  echo -e "${GREEN}Obtaining certificate for $domain...${NC}"
  
  # Check if certificate already exists
  if [ -d "/etc/letsencrypt/live/$domain" ]; then
    echo -e "${YELLOW}Certificate for $domain already exists. Skipping...${NC}"
    continue
  fi
  
  # Obtain certificate
  certbot certonly \
    --webroot \
    --webroot-path="$WEBROOT" \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    --non-interactive \
    -d "$domain" || {
      echo -e "${RED}Failed to obtain certificate for $domain${NC}"
      exit 1
    }
done

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

