#!/bin/bash
# Rebuild Docker container with environment variables from .env.production

set -e  # Exit on error

echo "🔨 Rebuilding Docker container with environment variables..."

# Check if .env.production exists
if [ ! -f ".env.production" ]; then
    echo "❌ Error: .env.production file not found!"
    exit 1
fi

# Load environment variables from .env.production
echo "📋 Loading environment variables from .env.production..."
set -a
source .env.production
set +a

# Verify required variables are set
if [ -z "$NEXT_PUBLIC_GOOGLE_CLIENT_ID" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_GOOGLE_CLIENT_ID is not set in .env.production"
fi

if [ -z "$NEXT_PUBLIC_API_URL" ]; then
    echo "⚠️  Warning: NEXT_PUBLIC_API_URL is not set in .env.production"
fi

# Build the Docker image
echo "🏗️  Building Docker image..."
docker-compose -f docker-compose.production.yml build --no-cache web-app

# Start the container
echo "🚀 Starting container..."
docker-compose -f docker-compose.production.yml up -d web-app

echo "✅ Rebuild complete!"
echo ""
echo "To check logs: docker logs mecabal-web-app --tail 50"
echo "To verify env vars: docker exec mecabal-web-app env | grep NEXT_PUBLIC"

