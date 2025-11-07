# MeCabal Web App - Deployment Guide

This guide covers deploying the MeCabal web application to production using Docker and CI/CD.

## Prerequisites

- Production server with Docker and Docker Compose installed
- Domain names configured: `mecabal.com` and `api.mecabal.com`
- SSH access to production server
- Backend services running on the same server (or accessible network)
- Docker network `mecabal_mecabal-network` created (shared with backend)

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Production Server                     │
│                                                          │
│  ┌──────────────┐         ┌──────────────┐            │
│  │   Nginx      │────────▶│  Web App     │            │
│  │  (Port 80/443)│         │  (Port 3015) │            │
│  └──────────────┘         └──────────────┘            │
│         │                                                │
│         │                                                │
│         ▼                                                │
│  ┌──────────────┐                                       │
│  │ API Gateway  │                                       │
│  │  (Port 3000) │                                       │
│  └──────────────┘                                       │
│                                                          │
│  mecabal.com → Web App                                  │
│  api.mecabal.com → API Gateway                          │
└─────────────────────────────────────────────────────────┘
```

## Initial Setup

### 1. Server Preparation

```bash
# Install Docker and Docker Compose (if not already installed)
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# Create Docker network (if not exists)
docker network create mecabal_mecabal-network

# Create project directory
sudo mkdir -p /opt/mecabal/web-app
sudo chown $USER:$USER /opt/mecabal/web-app
```

### 2. Clone Repository

```bash
cd /opt/mecabal/web-app
git clone <your-repo-url> .
```

### 3. Configure Environment Variables

```bash
# Copy example environment file
cp .env.production.example .env.production

# Edit with your actual values
nano .env.production
```

Required environment variables:
- `NEXT_PUBLIC_API_URL`: Backend API URL (e.g., `https://api.mecabal.com/api`)
- `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`: Google Maps API key
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`: Google OAuth client ID

### 4. SSL Certificate Setup

```bash
# Make script executable
chmod +x scripts/setup-ssl.sh

# Run SSL setup (requires root/sudo)
sudo CERTBOT_EMAIL=your-email@example.com ./scripts/setup-ssl.sh
```

Or manually:

```bash
# Install certbot
sudo apt-get update
sudo apt-get install certbot

# Obtain certificates
sudo certbot certonly --webroot \
  --webroot-path=/var/www/certbot \
  --email your-email@example.com \
  --agree-tos \
  --no-eff-email \
  -d mecabal.com \
  -d www.mecabal.com \
  -d api.mecabal.com
```

### 5. Configure Nginx

The nginx configuration is in `nginx/mecabal.conf`. Ensure your nginx container or system nginx uses this configuration.

If using Docker nginx (recommended), ensure volumes are mounted:
- `/etc/letsencrypt` → SSL certificates
- `/var/www/certbot` → Certbot webroot
- `nginx/mecabal.conf` → Nginx config

### 6. Initial Deployment

```bash
# Make deployment script executable
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

Or manually:

```bash
# Build and start
docker-compose -f docker-compose.production.yml up -d --build

# Check status
docker ps | grep mecabal-web-app
docker logs mecabal-web-app
```

## CI/CD Setup (GitHub Actions)

### 1. Configure GitHub Secrets

Go to your GitHub repository → Settings → Secrets and variables → Actions, and add:

- `PRODUCTION_HOST`: Your production server IP or hostname
- `PRODUCTION_USER`: SSH username (e.g., `ubuntu`, `root`)
- `PRODUCTION_SSH_KEY`: Private SSH key for server access
- `PRODUCTION_SSH_PORT`: SSH port (default: 22)
- `PRODUCTION_WEB_APP_PATH`: Path to web app on server (default: `/opt/mecabal/web-app`)
- `DOCKER_REGISTRY`: Set to `dockerhub` if using Docker Hub, or leave empty for local builds
- `DOCKER_USERNAME`: Docker Hub username (if using registry)
- `DOCKER_PASSWORD`: Docker Hub password (if using registry)

### 2. SSH Key Setup

On your local machine:

```bash
# Generate SSH key pair (if you don't have one)
ssh-keygen -t ed25519 -C "github-actions" -f ~/.ssh/github_actions

# Copy public key to server
ssh-copy-id -i ~/.ssh/github_actions.pub user@your-server

# Copy private key content
cat ~/.ssh/github_actions
# Add this entire content to GitHub secret PRODUCTION_SSH_KEY
```

### 3. Workflow Triggers

The workflow automatically triggers on:
- Push to `main` branch
- Manual trigger via GitHub Actions UI

## Deployment Process

### Automated (via GitHub Actions)

1. Push code to `main` branch
2. GitHub Actions workflow:
   - Builds Docker image
   - Deploys to production server
   - Performs health checks
   - Cleans up old images

### Manual Deployment

```bash
# On production server
cd /opt/mecabal/web-app
./scripts/deploy.sh
```

Or step-by-step:

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose -f docker-compose.production.yml up -d --build

# Check logs
docker logs -f mecabal-web-app
```

## SSL Certificate Renewal

Certificates are automatically renewed via:
1. **GitHub Actions**: Monthly cron job (1st of month at 2 AM UTC)
2. **Server Cron**: Daily check via certbot

To manually renew:

```bash
# Test renewal (dry run)
sudo certbot renew --dry-run

# Actually renew
sudo certbot renew

# Reload nginx
docker exec mecabal-nginx nginx -s reload
# OR
sudo systemctl reload nginx
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check container status
docker ps | grep mecabal-web-app

# Check container health
docker exec mecabal-web-app node -e "require('http').get('http://localhost:3015', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# View logs
docker logs mecabal-web-app --tail 100 -f
```

### Troubleshooting

**Container won't start:**
```bash
# Check logs
docker logs mecabal-web-app

# Check environment variables
docker exec mecabal-web-app env

# Verify network connectivity
docker network inspect mecabal_mecabal-network
```

**Nginx 502 Bad Gateway:**
```bash
# Check if web app is running
docker ps | grep mecabal-web-app

# Check nginx logs
docker logs mecabal-nginx

# Test web app directly
curl http://localhost:3015
```

**SSL Certificate Issues:**
```bash
# Check certificate expiration
sudo certbot certificates

# Test renewal
sudo certbot renew --dry-run

# Verify nginx can read certificates
sudo nginx -t
```

### Logs

```bash
# Web app logs
docker logs mecabal-web-app -f

# Nginx logs
docker logs mecabal-nginx -f
# OR
sudo tail -f /var/log/nginx/mecabal-access.log
sudo tail -f /var/log/nginx/mecabal-error.log
```

## Port Configuration

- **Web App**: Port 3015 (internal)
- **API Gateway**: Port 3000 (internal)
- **Nginx**: Ports 80 (HTTP) and 443 (HTTPS) (external)

The web app uses port 3015 to avoid conflicts with backend services (3000-3009).

## Network Configuration

Both web app and backend services share the `mecabal_mecabal-network` Docker network for inter-container communication.

```bash
# Verify network exists
docker network inspect mecabal_mecabal-network

# Create if missing
docker network create mecabal_mecabal-network
```

## Backup and Rollback

### Backup

```bash
# Backup environment file
cp .env.production .env.production.backup

# Backup Docker image
docker save mecabal-web-app:latest | gzip > mecabal-web-app-backup.tar.gz
```

### Rollback

```bash
# Stop current container
docker stop mecabal-web-app
docker rm mecabal-web-app

# Load previous image
docker load < mecabal-web-app-backup.tar.gz

# Start with previous image
docker tag mecabal-web-app:backup mecabal-web-app:latest
docker-compose -f docker-compose.production.yml up -d
```

## Security Considerations

1. **Environment Variables**: Never commit `.env.production` to git
2. **SSH Keys**: Use key-based authentication, disable password auth
3. **Firewall**: Only expose ports 80 and 443
4. **SSL**: Use strong SSL/TLS configuration (already in nginx config)
5. **Updates**: Keep Docker and system packages updated
6. **Secrets**: Use GitHub Secrets for sensitive data

## Performance Optimization

1. **Caching**: Nginx is configured to cache static assets
2. **Image Optimization**: Next.js images are optimized in production
3. **Standalone Build**: Uses Next.js standalone output for smaller Docker image
4. **Health Checks**: Automatic container health monitoring

## Support

For issues or questions:
1. Check logs: `docker logs mecabal-web-app`
2. Verify environment variables
3. Check network connectivity
4. Review GitHub Actions workflow logs

