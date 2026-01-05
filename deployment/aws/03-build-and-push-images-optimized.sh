#!/bin/bash

# Optimized Build Script - Build base image once, then build services
set -e

echo "🚀 Optimized Build: Base Image + Services"
echo "========================================"

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build base image once
echo "🏗️ Building base image with common dependencies..."
docker build --platform linux/amd64 -t conservation/base:latest -f Dockerfile.base .

echo "📦 Building and pushing service images..."

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
    echo "🚀 Building $service (using base image)..."
    
    cd "services/$service"
    
    # Build using base image and service-specific Dockerfile
    docker build --platform linux/amd64 \
        --build-arg BASE_IMAGE=conservation/base:latest \
        -f ../../Dockerfile.service \
        -t "conservation/$service" .
    
    # Tag for ECR
    docker tag "conservation/$service:latest" "$ECR_REGISTRY/conservation/$service:latest"
    
    # Push to ECR
    echo "📤 Pushing $service to ECR..."
    docker push "$ECR_REGISTRY/conservation/$service:latest"
    
    echo "✅ $service pushed successfully"
    cd ../..
done

# Build nginx (unchanged)
echo ""
echo "🌐 Building Nginx API Gateway..."
cat > nginx-deployment.dockerfile << 'EOF'
FROM nginx:alpine
COPY deployment/nginx/api-only.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EOF

docker build --platform linux/amd64 -f nginx-deployment.dockerfile -t conservation/nginx .
docker tag conservation/nginx:latest $ECR_REGISTRY/conservation/nginx:latest
docker push $ECR_REGISTRY/conservation/nginx:latest
rm nginx-deployment.dockerfile

echo ""
echo "✅ Optimized Build Complete!"
echo "📊 Benefits: Faster builds, smaller total size, shared layers"
echo "📋 Next: Run ./05-deploy-images-to-lightsail.sh"