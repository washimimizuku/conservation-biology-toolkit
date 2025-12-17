#!/bin/bash

# AWS Deployment Script
# Frontend to S3 + CloudFront, Backend to Lightsail

set -e

echo "🚀 Deploying Conservation Biology Toolkit to AWS..."

# Configuration
BUCKET_NAME="conservation-toolkit-frontend"
CLOUDFRONT_DISTRIBUTION_ID="your-distribution-id"
LIGHTSAIL_IP="your-lightsail-ip"

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
docker-compose -f docker-compose.production.yml down
docker-compose -f docker-compose.production.yml up -d --build
EOF

echo "✅ Deployment complete!"
echo "Frontend: https://yourdomain.com"
echo "API: https://api.yourdomain.com"