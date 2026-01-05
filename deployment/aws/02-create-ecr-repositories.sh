#!/bin/bash

# Step 2: Create ECR Repository for Single Container
# Creates single ECR repository for the unified Lightsail container

set -e

echo "🚀 Step 2: Creating ECR Repository"
echo "=================================="

REGION="us-east-1"
REPOSITORY_NAME="conservation/lightsail-all"

echo "📦 Creating ECR repository: $REPOSITORY_NAME"

if aws ecr describe-repositories --repository-names "$REPOSITORY_NAME" --region $REGION >/dev/null 2>&1; then
    echo "✅ Repository $REPOSITORY_NAME already exists"
else
    aws ecr create-repository \
        --repository-name "$REPOSITORY_NAME" \
        --region $REGION \
        --image-scanning-configuration scanOnPush=true \
        --encryption-configuration encryptionType=AES256 >/dev/null
    echo "✅ Created repository: $REPOSITORY_NAME"
fi

echo ""
echo "🔑 Getting ECR login credentials..."
aws ecr get-login-password --region $REGION | docker login --username AWS --password-stdin $(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com

echo ""
echo "✅ Step 2 Complete: ECR Repository Ready"
echo "📋 Next: Run ./03-build-and-push-lightsail.sh"