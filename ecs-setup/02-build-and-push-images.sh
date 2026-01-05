#!/bin/bash

# Build and push all Docker images to ECR
# Run after creating ECR repositories

set -e

echo "🔨 Building and Pushing Docker Images to ECR"
echo "============================================="

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

# Create Nginx Dockerfile for ECS
cat > nginx-ecs.dockerfile << 'EOF'
FROM nginx:alpine

# Copy nginx configuration
COPY deployment/nginx/api-only.conf /etc/nginx/conf.d/default.conf

# Update upstream servers for ECS internal networking
RUN sed -i 's/population-analysis:8000/localhost:8002/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/sampling-survey:8000/localhost:8003/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/genetic-diversity:8004/localhost:8004/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/species-assessment:8005/localhost:8005/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/habitat-landscape:8006/localhost:8006/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/climate-impact:8007/localhost:8007/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/conservation-planning:8008/localhost:8008/g' /etc/nginx/conf.d/default.conf

EXPOSE 80
EOF

# Build and push Nginx
docker build -f nginx-ecs.dockerfile -t conservation/nginx .
docker tag conservation/nginx:latest $ECR_REGISTRY/conservation/nginx:latest
docker push $ECR_REGISTRY/conservation/nginx:latest

# Clean up
rm nginx-ecs.dockerfile

echo ""
echo "✅ All images built and pushed successfully!"
echo "📋 Images available at:"
for service in "${SERVICES[@]}" "nginx"; do
    echo "  - $ECR_REGISTRY/conservation/$service:latest"
done

echo ""
echo "📋 Next step: Run ./03-create-ecs-infrastructure.sh"