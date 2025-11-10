# Rebuilding Docker Container with Environment Variables

## Problem
`NEXT_PUBLIC_*` environment variables are not available because Next.js requires them at **build time**, not just runtime.

## Solution
Rebuild the Docker image with build arguments from `.env.production`.

---

## Quick Fix (On Server)

### Option 1: Using docker-compose with env file (Recommended)
```bash
cd ~/Mecabal_web  # or wherever your web app is

# Source the .env.production file to load variables into shell
set -a
source .env.production
set +a

# Build with the environment variables
docker-compose -f docker-compose.production.yml build --no-cache web-app

# Start the container
docker-compose -f docker-compose.production.yml up -d web-app
```

**Or use a one-liner:**
```bash
cd ~/Mecabal_web && set -a && source .env.production && set +a && docker-compose -f docker-compose.production.yml build --no-cache web-app && docker-compose -f docker-compose.production.yml up -d web-app
```

### Option 2: Manual Docker Build
```bash
cd ~/Mecabal_web  # or wherever your web app is

# Load environment variables
set -a
source .env.production
set +a

# Rebuild with build args
docker build \
  --build-arg NEXT_PUBLIC_GOOGLE_CLIENT_ID="${NEXT_PUBLIC_GOOGLE_CLIENT_ID}" \
  --build-arg NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL}" \
  --build-arg NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL}" \
  --build-arg NEXT_PUBLIC_ENVIRONMENT="${NEXT_PUBLIC_ENVIRONMENT:-production}" \
  -t mecabal-web-app:latest \
  -f Dockerfile .

# Restart container
docker-compose -f docker-compose.production.yml up -d web-app
```

**Note:** The `set -a` command exports all variables automatically, and `set +a` turns it off. This ensures docker-compose can access the variables.

---

## Verify Environment Variables

### Check if variables are in the built image:
```bash
# Check build args were used
docker inspect mecabal-web-app | grep -i "NEXT_PUBLIC"

# Or check the running container
docker exec mecabal-web-app env | grep NEXT_PUBLIC
```

### Check browser console:
After rebuilding, check the browser console - the warning should be gone.

---

## Important Notes

1. **Build Time vs Runtime:**
   - `NEXT_PUBLIC_*` variables are embedded into JavaScript at build time
   - They must be available when `npm run build` runs
   - Runtime environment variables won't work for `NEXT_PUBLIC_*`

2. **After Changes:**
   - If you change `NEXT_PUBLIC_*` variables in `.env.production`, you MUST rebuild the image
   - Just restarting the container won't work

3. **CI/CD:**
   - The GitHub Actions workflow now passes build args automatically
   - Make sure secrets are set in GitHub repository settings

---

## GitHub Secrets Required

If using CI/CD, ensure these secrets are set:
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_API_URL`
- `NEXT_PUBLIC_APP_URL`

Set them in: Repository Settings → Secrets and variables → Actions

