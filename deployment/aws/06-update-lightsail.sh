#!/bin/bash

# Update Lightsail Container
# Rebuilds and pushes single container to ECR

set -e

echo "🚀 Updating Lightsail Container"
echo "==============================="

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
REPOSITORY_NAME="conservation/lightsail-all"

# Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build updated container
echo "🏗️ Building updated container..."
docker build --platform linux/amd64 -f Dockerfile.lightsail -t conservation/lightsail-all .

# Tag and push to ECR
docker tag conservation/lightsail-all:latest $ECR_REGISTRY/$REPOSITORY_NAME:latest
docker push $ECR_REGISTRY/$REPOSITORY_NAME:latest

echo ""
echo "✅ Container Updated in ECR!"
echo "📋 Image: $ECR_REGISTRY/$REPOSITORY_NAME:latest"
echo ""
echo "📋 Next Steps:"
echo "1. Go to Lightsail Console → Container services → conservation-api"
echo "2. Deployments tab → 'Modify and redeploy' existing deployment"
echo "3. Lightsail will pull the updated image from ECR"
echo ""
echo "⏱️ Deployment will take ~5-10 minutes to complete"