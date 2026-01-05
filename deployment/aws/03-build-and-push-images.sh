#!/bin/bash

# Step 3: Build and Push Images to ECR
# Replicates deployment/ecs-setup/02-build-and-push-images.sh

set -e

# Fix Docker API version compatibility
export DOCKER_API_VERSION=1.41

echo "🚀 Step 3: Building and Pushing Images to ECR"
echo "=============================================="

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Ensure we're logged into ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

echo ""
echo "📦 Building and pushing service images..."

# Build and push each FastAPI service
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
    echo "🚀 Building $service..."
    
    cd "services/$service"
    
    # Build image
    docker build -t "conservation/$service" .
    
    # Tag for ECR
    docker tag "conservation/$service:latest" "$ECR_REGISTRY/conservation/$service:latest"
    
    # Push to ECR
    echo "📤 Pushing $service to ECR..."
    docker push "$ECR_REGISTRY/conservation/$service:latest"
    
    echo "✅ $service pushed successfully"
    
    cd ../..
done

echo ""
echo "🌐 Building Nginx API Gateway..."

# Create Nginx Dockerfile for deployment
cat > nginx-deployment.dockerfile << 'EOF'
FROM nginx:alpine

# Copy nginx configuration
COPY deployment/nginx/api-only.conf /etc/nginx/conf.d/default.conf

EXPOSE 80
EOF

# Build and push Nginx
docker build -f nginx-deployment.dockerfile -t conservation/nginx .
docker tag conservation/nginx:latest $ECR_REGISTRY/conservation/nginx:latest
docker push $ECR_REGISTRY/conservation/nginx:latest

# Clean up
rm nginx-deployment.dockerfile

echo ""
echo "✅ Step 3 Complete: All Images in ECR"
echo "📋 Images available at:"
for service in "${SERVICES[@]}" "nginx"; do
    echo "  - $ECR_REGISTRY/conservation/$service:latest"
done

echo ""
echo "📋 Next: Run ./04-create-lightsail-container-service.sh"