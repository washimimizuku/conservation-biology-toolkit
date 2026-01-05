#!/bin/bash

# Step 3: Build and Push Lightsail Container to ECR
# Builds single container with all services + nginx

set -e

echo "🚀 Step 3: Building and Pushing Lightsail Container"
echo "=================================================="

REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"
REPOSITORY_NAME="conservation/lightsail-all"

# Login to ECR
echo "🔑 Logging into ECR..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $ECR_REGISTRY

# Build single container with all services
echo "🏗️ Building Lightsail container with all services + nginx..."
docker build --platform linux/amd64 -f Dockerfile.lightsail -t conservation/lightsail-all .

# Tag for ECR
docker tag conservation/lightsail-all:latest $ECR_REGISTRY/$REPOSITORY_NAME:latest

# Push to ECR
echo "📤 Pushing to ECR..."
docker push $ECR_REGISTRY/$REPOSITORY_NAME:latest

echo ""
echo "✅ Step 3 Complete: Lightsail Container in ECR"
echo "📋 Image available at: $ECR_REGISTRY/$REPOSITORY_NAME:latest"
echo ""
echo "📋 Next: Run ./04-create-lightsail-container-service.sh"