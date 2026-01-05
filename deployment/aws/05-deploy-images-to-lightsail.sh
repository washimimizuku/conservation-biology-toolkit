#!/bin/bash

# Step 5: Deploy Images to Lightsail Container Service
# Uses AWS Console approach to avoid Docker API version issues

set -e

echo "🚀 Step 5: Deploy Images to Lightsail"
echo "====================================="

SERVICE_NAME="conservation-api"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

echo "⚠️  Due to Docker API version compatibility issues, this step requires manual action in AWS Console"
echo ""
echo "📋 Manual Steps Required:"
echo ""
echo "1. Go to AWS Console → Lightsail → Container services → conservation-api"
echo ""
echo "2. Click 'Images' tab → 'Push and manage images'"
echo ""
echo "3. Run these commands one by one:"
echo ""

SERVICES=(
    "population-analysis"
    "sampling-survey"
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
    "nginx"
)

for service in "${SERVICES[@]}"; do
    echo "aws lightsail push-container-image \\"
    echo "    --service-name conservation-api \\"
    echo "    --label $service \\"
    echo "    --image $ECR_REGISTRY/conservation/$service:latest \\"
    echo "    --region $REGION"
    echo ""
done

echo "4. After all images are pushed, go to 'Deployments' tab → 'Create your first deployment'"
echo ""
echo "5. Configure containers:"

for service in "${SERVICES[@]}"; do
    if [ "$service" = "nginx" ]; then
        echo "   - $service: :conservation-api.$service.latest, Port 80"
    else
        case $service in
            "population-analysis") port="8002" ;;
            "sampling-survey") port="8003" ;;
            "genetic-diversity") port="8004" ;;
            "species-assessment") port="8005" ;;
            "habitat-landscape") port="8006" ;;
            "climate-impact") port="8007" ;;
            "conservation-planning") port="8008" ;;
        esac
        echo "   - $service: :conservation-api.$service.latest, Port $port"
    fi
done

echo ""
echo "6. Set Public endpoint:"
echo "   - Container: nginx"
echo "   - Port: 80"
echo "   - Health check path: /health"
echo ""
echo "7. Click 'Save and deploy'"
echo ""
echo "📋 Alternative: Use rebuild script to build locally and push directly:"
echo "   ./06-rebuild-and-deploy-locally.sh"
echo ""
echo "✅ Step 5 Instructions Provided"
echo "📋 Next: Manual deployment or run ./06-rebuild-and-deploy-locally.sh"