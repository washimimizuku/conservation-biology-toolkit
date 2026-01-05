#!/bin/bash

# Create ECR repositories for all conservation biology services
# Run this first to set up container registries

set -e

echo "🐳 Creating ECR Repositories for Conservation Biology Toolkit"
echo "============================================================"

REGION="us-east-1"
SERVICES=(
    "conservation/population-analysis"
    "conservation/sampling-survey"
    "conservation/genetic-diversity"
    "conservation/species-assessment"
    "conservation/habitat-landscape"
    "conservation/climate-impact"
    "conservation/conservation-planning"
    "conservation/nginx"
)

echo "📦 Creating ECR repositories in region: $REGION"
echo ""

for service in "${SERVICES[@]}"; do
    echo "Creating repository: $service"
    
    if aws ecr describe-repositories --repository-names "$service" --region $REGION >/dev/null 2>&1; then
        echo "✅ Repository $service already exists"
    else
        aws ecr create-repository \
            --repository-name "$service" \
            --region $REGION \
            --image-scanning-configuration scanOnPush=true \
            --encryption-configuration encryptionType=AES256 >/dev/null
        echo "✅ Created repository: $service"
    fi
done

echo ""
echo "🔑 Getting ECR login credentials..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com

echo ""
echo "✅ ECR repositories created successfully!"
echo "📋 Next step: Run ./02-build-and-push-images.sh"