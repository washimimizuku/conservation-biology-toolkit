#!/bin/bash

# Quick API Update Script
# Rebuilds and deploys API changes to Lightsail Container Service

set -e

echo "🚀 Deploying API Updates"
echo "========================"

SERVICE_NAME="conservation-api"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Check if Lightsail service exists
echo "🔍 Checking Lightsail container service..."
if ! aws lightsail get-container-services --service-name "$SERVICE_NAME" >/dev/null 2>&1; then
    echo "❌ Lightsail container service '$SERVICE_NAME' not found"
    echo "📋 Run ./04-create-lightsail-container-service.sh first"
    exit 1
fi

echo "✅ Found Lightsail service: $SERVICE_NAME"

# Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build base image
echo "🏗️ Building base image..."
docker build --platform linux/amd64 -t conservation/base:latest -f Dockerfile.base .

# Build and push updated services
echo "📦 Building and pushing updated services..."

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
    
    # Build using base image
    docker build --platform linux/amd64 \
        --build-arg BASE_IMAGE=conservation/base:latest \
        -f ../../Dockerfile.service \
        -t "conservation/$service" .
    
    # Tag and push to ECR
    docker tag "conservation/$service:latest" "$ECR_REGISTRY/conservation/$service:latest"
    docker push "$ECR_REGISTRY/conservation/$service:latest"
    
    # Push directly to Lightsail
    echo "📤 Pushing $service to Lightsail..."
    aws lightsail push-container-image \
        --service-name "$SERVICE_NAME" \
        --label "$service" \
        --image "conservation/$service:latest"
    
    echo "✅ $service updated"
    cd ../..
done

# Update nginx if needed
echo ""
echo "🌐 Updating Nginx..."
cat > nginx-deployment.dockerfile << 'EOF'
FROM nginx:alpine
COPY deployment/nginx/api-only.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
EOF

docker build --platform linux/amd64 -f nginx-deployment.dockerfile -t conservation/nginx .
docker tag conservation/nginx:latest $ECR_REGISTRY/conservation/nginx:latest
docker push $ECR_REGISTRY/conservation/nginx:latest

aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "nginx" \
    --image "conservation/nginx:latest"

rm nginx-deployment.dockerfile

# Get current deployment version
CURRENT_VERSION=$(aws lightsail get-container-services \
    --service-name "$SERVICE_NAME" \
    --query 'containerServices[0].currentDeployment.version' \
    --output text)

echo ""
echo "✅ API Update Complete!"
echo "📋 Images pushed to Lightsail container service"
echo "🔄 Current deployment version: $CURRENT_VERSION"
echo ""
echo "📋 To deploy the updated images:"
echo "1. Go to AWS Console → Lightsail → Container services → $SERVICE_NAME"
echo "2. Deployments tab → Create new deployment"
echo "3. Use the updated images (they have the same labels)"
echo "4. Or reuse your existing deployment configuration"
echo ""
echo "⏱️ Deployment will take ~5-10 minutes to complete"