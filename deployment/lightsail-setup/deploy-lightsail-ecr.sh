#!/bin/bash

# Deploy to Lightsail using ECR images
# Run this script from your local machine

set -e

echo "🚀 Deploying Conservation Biology Toolkit to Lightsail using ECR"
echo "=============================================================="

# Configuration
REGION="us-east-1"
LIGHTSAIL_IP="35.158.27.131"  # Your Lightsail IP
LIGHTSAIL_USER="ubuntu"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "📋 Configuration:"
echo "  Region: $REGION"
echo "  Account ID: $ACCOUNT_ID"
echo "  Lightsail IP: $LIGHTSAIL_IP"
echo ""

# Step 1: Create environment file for Lightsail
echo "📝 Creating environment file..."
cat > .env.lightsail << EOF
ACCOUNT_ID=$ACCOUNT_ID
REGION=$REGION
EOF

echo "✅ Environment file created"

# Step 2: Copy files to Lightsail
echo "📦 Copying deployment files to Lightsail..."

# Copy docker-compose and environment files
scp docker-compose.lightsail-ecr.yml $LIGHTSAIL_USER@$LIGHTSAIL_IP:~/docker-compose.yml
scp .env.lightsail $LIGHTSAIL_USER@$LIGHTSAIL_IP:~/.env
scp deployment/nginx/api-only.conf $LIGHTSAIL_USER@$LIGHTSAIL_IP:~/nginx.conf

echo "✅ Files copied to Lightsail"

# Step 3: Deploy on Lightsail
echo "🚀 Deploying on Lightsail..."

ssh $LIGHTSAIL_USER@$LIGHTSAIL_IP << 'ENDSSH'
set -e

echo "🔑 Logging into ECR..."
# Use IAM role attached to instance (no AWS CLI config needed)
ACCOUNT_ID=$(cat .env | grep ACCOUNT_ID | cut -d'=' -f2)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com"

# Get ECR login token using instance IAM role
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin $ECR_REGISTRY

echo "🛑 Stopping existing services..."
docker compose down || true

echo "📥 Pulling latest images from ECR..."
docker compose pull

echo "🚀 Starting services..."
docker compose up -d

echo "⏳ Waiting for services to start..."
sleep 30

echo "🔍 Checking service health..."
docker compose ps

echo "✅ Testing API endpoints..."
curl -f http://localhost/api/population/ || echo "⚠️ Population API not ready yet"
curl -f http://localhost/api/sampling/ || echo "⚠️ Sampling API not ready yet"

echo "✅ Deployment complete!"
ENDSSH

# Step 4: Test from external
echo ""
echo "🧪 Testing external access..."
sleep 10

echo "Testing Population Analysis API..."
curl -f http://$LIGHTSAIL_IP/api/population/ && echo "✅ Population API working" || echo "❌ Population API failed"

echo "Testing Sampling Survey API..."
curl -f http://$LIGHTSAIL_IP/api/sampling/ && echo "✅ Sampling API working" || echo "❌ Sampling API failed"

# Cleanup
rm -f .env.lightsail

echo ""
echo "🎉 Deployment Complete!"
echo "=============================="
echo ""
echo "🌐 Your APIs are available at:"
echo "  Population Analysis: http://$LIGHTSAIL_IP/api/population/docs"
echo "  Sampling Survey: http://$LIGHTSAIL_IP/api/sampling/docs"
echo "  Genetic Diversity: http://$LIGHTSAIL_IP/api/genetic/docs"
echo "  Species Assessment: http://$LIGHTSAIL_IP/api/species/docs"
echo "  Habitat Landscape: http://$LIGHTSAIL_IP/api/habitat/docs"
echo "  Climate Impact: http://$LIGHTSAIL_IP/api/climate/docs"
echo "  Conservation Planning: http://$LIGHTSAIL_IP/api/conservation/docs"
echo ""
echo "💡 To update images:"
echo "  1. Build and push new images: ./ecs-setup/02-build-and-push-images.sh"
echo "  2. Redeploy: ./deploy-lightsail-ecr.sh"
echo ""
echo "💰 Monthly cost: ~$5 (Lightsail) + $0.10 (ECR storage) = $5.10/month"