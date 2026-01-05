#!/bin/bash

# Configure Route 53 DNS to point to ECS ALB
# Run after deploying ECS services

set -e

echo "🌐 Setting up DNS for Conservation Biology Toolkit"
echo "================================================="

# Load configuration
if [ ! -f "ecs-config.env" ]; then
    echo "❌ Error: ecs-config.env not found"
    echo "Run ./03-create-ecs-infrastructure.sh first"
    exit 1
fi

source ecs-config.env

DOMAIN="conservationbiologytools.org"
API_SUBDOMAIN="api.conservationbiologytools.org"

echo "🌍 Domain: $DOMAIN"
echo "🔗 API Subdomain: $API_SUBDOMAIN"
echo "⚖️ ALB DNS: $ALB_DNS"
echo ""

# Get hosted zone ID
echo "🔍 Finding Route 53 hosted zone..."
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
    --query "HostedZones[?Name=='$DOMAIN.'].Id" \
    --output text | cut -d'/' -f3)

if [ -z "$HOSTED_ZONE_ID" ]; then
    echo "❌ Error: Hosted zone for $DOMAIN not found"
    echo "Please ensure the domain is registered and hosted in Route 53"
    exit 1
fi

echo "✅ Found hosted zone: $HOSTED_ZONE_ID"

# Get ALB hosted zone ID (for alias records)
ALB_ZONE_ID=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query 'LoadBalancers[0].CanonicalHostedZoneId' \
    --output text)

echo "✅ ALB hosted zone ID: $ALB_ZONE_ID"

echo ""
echo "📝 Creating DNS records..."

# Create API subdomain record (ALIAS to ALB)
cat > api-dns-record.json << EOF
{
  "Changes": [
    {
      "Action": "UPSERT",
      "ResourceRecordSet": {
        "Name": "$API_SUBDOMAIN",
        "Type": "A",
        "AliasTarget": {
          "DNSName": "$ALB_DNS",
          "EvaluateTargetHealth": true,
          "HostedZoneId": "$ALB_ZONE_ID"
        }
      }
    }
  ]
}
EOF

# Apply DNS change
CHANGE_ID=$(aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch file://api-dns-record.json \
    --query 'ChangeInfo.Id' \
    --output text)

echo "✅ Created DNS record for $API_SUBDOMAIN"
echo "🔄 Change ID: $CHANGE_ID"

# Clean up
rm api-dns-record.json

echo ""
echo "⏳ Waiting for DNS propagation..."
aws route53 wait resource-record-sets-changed --id $CHANGE_ID

echo "✅ DNS propagation complete!"

echo ""
echo "🧪 Testing DNS resolution..."

# Test DNS resolution
if nslookup $API_SUBDOMAIN >/dev/null 2>&1; then
    echo "✅ DNS resolution working for $API_SUBDOMAIN"
else
    echo "⚠️  DNS resolution may take a few more minutes to propagate globally"
fi

echo ""
echo "🧪 Testing API endpoints..."

# Test API endpoints
sleep 10  # Give a moment for everything to settle

ENDPOINTS=(
    "/api/population/docs"
    "/api/sampling/docs"
    "/api/genetic/docs"
    "/api/species/docs"
    "/api/habitat/docs"
    "/api/climate/docs"
    "/api/conservation/docs"
)

echo "Testing via ALB directly:"
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -s -f "http://$ALB_DNS$endpoint" >/dev/null; then
        echo "✅ http://$ALB_DNS$endpoint"
    else
        echo "⚠️  http://$ALB_DNS$endpoint (may still be starting)"
    fi
done

echo ""
echo "Testing via custom domain (may take a few minutes for DNS):"
for endpoint in "${ENDPOINTS[@]}"; do
    if curl -s -f "http://$API_SUBDOMAIN$endpoint" >/dev/null; then
        echo "✅ http://$API_SUBDOMAIN$endpoint"
    else
        echo "⚠️  http://$API_SUBDOMAIN$endpoint (DNS may still be propagating)"
    fi
done

# Save final configuration
cat >> ecs-config.env << EOF

# DNS Configuration
DOMAIN=$DOMAIN
API_SUBDOMAIN=$API_SUBDOMAIN
HOSTED_ZONE_ID=$HOSTED_ZONE_ID
ALB_ZONE_ID=$ALB_ZONE_ID
EOF

echo ""
echo "✅ DNS setup complete!"
echo ""
echo "🌐 Your Conservation Biology Toolkit is now available at:"
echo "  📚 API Documentation: http://$API_SUBDOMAIN/api/[service]/docs"
echo "  🔗 Load Balancer: http://$ALB_DNS"
echo ""
echo "📋 API Endpoints:"
echo "  - Population Analysis: http://$API_SUBDOMAIN/api/population/docs"
echo "  - Sampling Survey: http://$API_SUBDOMAIN/api/sampling/docs"
echo "  - Genetic Diversity: http://$API_SUBDOMAIN/api/genetic/docs"
echo "  - Species Assessment: http://$API_SUBDOMAIN/api/species/docs"
echo "  - Habitat Landscape: http://$API_SUBDOMAIN/api/habitat/docs"
echo "  - Climate Impact: http://$API_SUBDOMAIN/api/climate/docs"
echo "  - Conservation Planning: http://$API_SUBDOMAIN/api/conservation/docs"
echo ""
echo "🎉 ECS Fargate deployment complete!"
echo "💰 Estimated monthly cost: ~$49 (7 services × 0.25 vCPU × 0.5GB + ALB)"
echo ""
echo "📋 Optional: Run ./08-setup-auto-scaling.sh to configure auto-scaling"