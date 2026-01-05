#!/bin/bash

# Step 6: Rebuild and Deploy Locally (Alternative to Step 5)
# Builds images locally and pushes directly to Lightsail to avoid ECR compatibility issues

set -e

# Fix Docker API version compatibility
export DOCKER_API_VERSION=1.41

echo "🚀 Step 6: Rebuild and Deploy Locally to Lightsail"
echo "=================================================="

SERVICE_NAME="conservation-api"

echo "🔨 Building services locally with platform compatibility..."

SERVICES=(
    "population-analysis"
    "sampling-survey"
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
)

for service in "${SERVICES[@]}"; do
    echo ""
    echo "📦 Building $service..."
    
    cd "services/$service"
    
    # Build with specific platform for compatibility
    docker build --platform linux/amd64 -t "conservation/$service:lightsail" .
    
    # Push directly to Lightsail
    echo "📤 Pushing $service to Lightsail..."
    aws lightsail push-container-image \
        --service-name "$SERVICE_NAME" \
        --label "$service" \
        --image "conservation/$service:lightsail"
    
    echo "✅ $service pushed to Lightsail"
    cd ../..
done

echo ""
echo "🌐 Building Nginx..."
# Build nginx with platform compatibility
docker build --platform linux/amd64 -f deployment/nginx/Dockerfile -t conservation/nginx:lightsail .

echo "📤 Pushing nginx to Lightsail..."
aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "nginx" \
    --image "conservation/nginx:lightsail"

echo ""
echo "✅ All images rebuilt and pushed to Lightsail!"
echo ""
echo "📋 Next: Create deployment in Lightsail console:"
echo "1. Go to AWS Console → Lightsail → Container services → conservation-api"
echo "2. Click 'Deployments' tab → 'Create your first deployment'"
echo "3. Configure containers with the pushed images"
echo "4. Set nginx as public endpoint on port 80"
echo ""
echo "✅ Step 6 Complete: Images Ready for Deployment"
echo "📋 Next: Run ./07-deploy-frontend.sh"