#!/bin/bash

# Quick Frontend Update Script
# Builds and deploys frontend changes to S3 + CloudFront

set -e

echo "🚀 Deploying Frontend Updates"
echo "============================="

BUCKET_NAME="conservationbiologytools-frontend"

# Get CloudFront distribution ID
echo "🔍 Finding CloudFront distribution..."
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
echo "☁️ Uploading to S3..."
aws s3 sync build/ s3://$BUCKET_NAME --delete --cache-control "public, max-age=31536000"

# Invalidate CloudFront cache
echo "🔄 Invalidating CloudFront cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*" \
    --query 'Invalidation.Id' \
    --output text)

echo "⏳ Invalidation created: $INVALIDATION_ID"

cd ..

echo ""
echo "✅ Frontend Update Complete!"
echo "🌐 URL: https://conservationbiologytools.org"
echo "⏱️ Changes will be live in 1-5 minutes (CloudFront propagation)"
echo ""
echo "📋 To check invalidation status:"
echo "aws cloudfront get-invalidation --distribution-id $CLOUDFRONT_DISTRIBUTION_ID --id $INVALIDATION_ID"