#!/bin/bash

# Fix SPA routing by updating CloudFront custom error responses
# This handles both 404 and 403 errors by serving index.html

set -e

DOMAIN="conservationbiologytools.org"
PROFILE="default"

echo "🔧 Fixing SPA routing for CloudFront distribution"
echo "================================================"

# Find the CloudFront distribution
DISTRIBUTION_ID=$(aws cloudfront list-distributions \
    --profile $PROFILE \
    --query "DistributionList.Items[?Comment=='Conservation Biology Tools Frontend'].Id" \
    --output text 2>/dev/null)

if [ -z "$DISTRIBUTION_ID" ]; then
    echo "❌ CloudFront distribution not found"
    exit 1
fi

echo "📡 Found CloudFront distribution: $DISTRIBUTION_ID"

# Get current distribution config
echo "📋 Getting current distribution configuration..."
aws cloudfront get-distribution-config \
    --id $DISTRIBUTION_ID \
    --profile $PROFILE > current-config.json

# Extract ETag and config
ETAG=$(jq -r '.ETag' current-config.json)
jq '.DistributionConfig' current-config.json > distribution-config.json

# Update custom error responses to handle both 404 and 403
echo "🔄 Updating custom error responses..."
jq '.CustomErrorResponses = {
    "Quantity": 2,
    "Items": [
        {
            "ErrorCode": 404,
            "ResponsePagePath": "/index.html",
            "ResponseCode": "200",
            "ErrorCachingMinTTL": 300
        },
        {
            "ErrorCode": 403,
            "ResponsePagePath": "/index.html",
            "ResponseCode": "200",
            "ErrorCachingMinTTL": 300
        }
    ]
}' distribution-config.json > updated-config.json

# Update the distribution
echo "☁️ Updating CloudFront distribution..."
aws cloudfront update-distribution \
    --id $DISTRIBUTION_ID \
    --distribution-config file://updated-config.json \
    --if-match $ETAG \
    --profile $PROFILE > /dev/null

echo "⏳ Creating invalidation to clear cache..."
INVALIDATION_ID=$(aws cloudfront create-invalidation \
    --distribution-id $DISTRIBUTION_ID \
    --paths "/*" \
    --profile $PROFILE \
    --query 'Invalidation.Id' \
    --output text)

echo "✅ Invalidation created: $INVALIDATION_ID"

# Clean up
rm -f current-config.json distribution-config.json updated-config.json

echo ""
echo "✅ SPA routing fix applied successfully!"
echo "⏳ Changes will take 5-15 minutes to propagate globally"
echo "🧪 Test by refreshing a page like: https://$DOMAIN/population-tools"
echo ""
echo "📊 Monitor invalidation status:"
echo "aws cloudfront get-invalidation --distribution-id $DISTRIBUTION_ID --id $INVALIDATION_ID --profile $PROFILE"