#!/bin/bash

# Rebuild and push images with platform compatibility for Lightsail
set -e

# Fix Docker API version compatibility
export DOCKER_API_VERSION=1.41

echo "🔨 Rebuilding images for Lightsail compatibility"
echo "==============================================="

SERVICE_NAME="conservation-api"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Services to rebuild
SERVICES=(
    "population-analysis"
    "sampling-survey" 
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
)

echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

echo "🔨 Rebuilding services with linux/amd64 platform..."

for service in "${SERVICES[@]}"; do
    echo "📦 Building $service..."
    
    cd "services/$service"
    
    # Build with specific platform
    docker build --platform linux/amd64 -t "conservation/$service:lightsail" .
    
    # Push directly to Lightsail
    aws lightsail push-container-image \
        --service-name "$SERVICE_NAME" \
        --label "$service" \
        --image "conservation/$service:lightsail"
    
    echo "✅ $service pushed to Lightsail"
    cd ../..
done

echo "🌐 Building Nginx..."
# Build nginx with platform compatibility
docker build --platform linux/amd64 -f deployment/nginx/Dockerfile -t conservation/nginx:lightsail .

aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "nginx" \
    --image "conservation/nginx:lightsail"

echo "✅ All images rebuilt and pushed to Lightsail!"
echo "📋 Next: Create deployment in Lightsail console"