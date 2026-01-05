#!/bin/bash

# Test ECR access from Lightsail
# Run this ON your Lightsail instance after attaching IAM role

set -e

echo "🧪 Testing ECR Access from Lightsail"
echo "===================================="

# Test 1: Check if AWS CLI is available
echo "1. Checking AWS CLI..."
if command -v aws &> /dev/null; then
    echo "✅ AWS CLI is available"
else
    echo "❌ AWS CLI not found. Installing..."
    sudo apt update
    sudo apt install -y awscli
    echo "✅ AWS CLI installed"
fi

# Test 2: Check IAM role
echo ""
echo "2. Checking IAM role..."
INSTANCE_IDENTITY=$(curl -s http://169.254.169.254/latest/meta-data/iam/security-credentials/ || echo "")
if [ -n "$INSTANCE_IDENTITY" ]; then
    echo "✅ IAM role attached: $INSTANCE_IDENTITY"
else
    echo "❌ No IAM role attached to this instance"
    echo "Please attach the LightsailECRProfile role in Lightsail console"
    exit 1
fi

# Test 3: Test ECR authentication
echo ""
echo "3. Testing ECR authentication..."
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text 2>/dev/null || echo "")
if [ -n "$ACCOUNT_ID" ]; then
    echo "✅ AWS credentials working. Account ID: $ACCOUNT_ID"
else
    echo "❌ Cannot get AWS account ID"
    exit 1
fi

# Test 4: Test ECR login
echo ""
echo "4. Testing ECR login..."
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"
if aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY; then
    echo "✅ ECR login successful"
else
    echo "❌ ECR login failed"
    exit 1
fi

# Test 5: List ECR repositories
echo ""
echo "5. Testing ECR repository access..."
if aws ecr describe-repositories --region us-east-1 --repository-names conservation/population-analysis >/dev/null 2>&1; then
    echo "✅ Can access ECR repositories"
else
    echo "❌ Cannot access ECR repositories"
    echo "Make sure repositories are created with: ./ecs-setup/01-create-ecr-repositories.sh"
    exit 1
fi

echo ""
echo "🎉 All tests passed! Lightsail can access ECR."
echo "You can now run the deployment from your local machine."