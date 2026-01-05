#!/bin/bash

# Step 7: Deploy Frontend to S3 + CloudFront
# Replicates frontend deployment from deployment/scripts/deploy-aws.sh

set -e

echo "🚀 Step 7: Deploying Frontend"
echo "============================="

BUCKET_NAME="conservationbiologytools-frontend"

# Get CloudFront distribution ID
CLOUDFRONT_DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --query "DistributionList.Items[?Comment=='Conservation Biology Tools Frontend'].Id" \
    --output text)

if [ -z "$CLOUDFRONT_DISTRIBUTION_ID" ]; then
    echo "❌ CloudFront distribution not found. Run ./01-setup-frontend-infrastructure.sh first"
    exit 1
fi

echo "✅ Found CloudFront distribution: $CLOUDFRONT_DISTRIBUTION_ID"
echo "📦 S3 Bucket: $BUCKET_NAME"

# Build React frontend
echo ""
echo "📦 Building React frontend..."
cd frontend
npm run build

# Deploy to S3
echo "☁️ Deploying frontend to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete --cache-control "public, max-age=31536000"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
aws cloudfront create-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --paths "/*"

cd ..

echo ""
echo "✅ Step 7 Complete: Frontend Deployed"
echo "🌐 Frontend URL: https://conservationbiologytools.org"
echo ""
echo "📋 Next: Configure DNS and test the full application"