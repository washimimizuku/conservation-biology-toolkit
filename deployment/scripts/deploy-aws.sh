#!/bin/bash

# AWS Deployment Script
# Frontend to S3 + CloudFront, Backend to Lightsail

set -e

echo "🚀 Deploying Conservation Biology Toolkit to AWS..."

# Configuration - Load from environment variables or config file
BUCKET_NAME="conservationbiologytools-frontend"
CLOUDFRONT_DISTRIBUTION_ID="${CLOUDFRONT_DISTRIBUTION_ID:-}"
LIGHTSAIL_IP="${LIGHTSAIL_IP:-}"

# Load from local config file if it exists (not committed to git)
if [ -f ".env.deploy" ]; then
    echo "📋 Loading configuration from .env.deploy..."
    source .env.deploy
fi

# Validate required variables
if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "❌ Error: CLOUDFRONT_DISTRIBUTION_ID not set"
    echo ""
    echo "💡 Setup options:"
    echo "1. Create .env.deploy file: cp .env.deploy.template .env.deploy"
    echo "2. Set environment variable: export CLOUDFRONT_DISTRIBUTION_ID=your-id"
    echo "3. See docs/DEPLOYMENT_SETUP.md for detailed instructions"
    exit 1
fi

if [ -z "$LIGHTSAIL_IP" ]; then
    echo "❌ Error: LIGHTSAIL_IP not set"
    echo ""
    echo "💡 Setup options:"
    echo "1. Create .env.deploy file: cp .env.deploy.template .env.deploy"
    echo "2. Set environment variable: export LIGHTSAIL_IP=your-ip"
    echo "3. See docs/DEPLOYMENT_SETUP.md for detailed instructions"
    exit 1
fi

echo "✅ Configuration loaded successfully"
echo "📦 S3 Bucket: $BUCKET_NAME"
echo "☁️ CloudFront: $CLOUDFRONT_DISTRIBUTION_ID"
echo "🖥️ Lightsail: $LIGHTSAIL_IP"
echo ""

# Build and deploy frontend to S3
echo "📦 Building React frontend..."
cd frontend
npm run build

echo "☁️ Deploying frontend to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete --cache-control "public, max-age=31536000"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

# Deploy backend to Lightsail
echo "🐳 Deploying backend to Lightsail..."
cd ..

# Copy files to Lightsail (assumes SSH key configured)
rsync -avz --exclude 'frontend/' --exclude '.git/' . ubuntu@$LIGHTSAIL_IP:~/conservation-toolkit/

# SSH and restart services
ssh ubuntu@$LIGHTSAIL_IP << 'EOF'
cd ~/conservation-toolkit
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build
EOF

echo "✅ Deployment complete!"
echo "Frontend: https://conservationbiologytools.org"
echo "API: https://api.conservationbiologytools.org"