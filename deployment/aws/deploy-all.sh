#!/bin/bash

# Master Deployment Script
# Runs all deployment steps in sequence

set -e

echo "🚀 Conservation Biology Toolkit - Complete AWS Deployment"
echo "========================================================="
echo ""
echo "This script will deploy:"
echo "✅ Frontend: S3 + CloudFront + SSL"
echo "✅ Backend: ECR + Lightsail Container Service"
echo ""

read -p "Continue with full deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled"
    exit 1
fi

echo ""
echo "🎯 Starting deployment process..."

# Step 1: Frontend Infrastructure
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./01-setup-frontend-infrastructure.sh

# Step 2: ECR Repositories
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./02-create-ecr-repositories.sh

# Step 3: Build and Push Images
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./03-build-and-push-images.sh

# Step 4: Lightsail Container Service
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./04-create-lightsail-container-service.sh

# Step 5: Deploy Images (Manual or Local)
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⚠️  Choose deployment method for backend images:"
echo "1. Manual (AWS Console) - Recommended due to Docker API issues"
echo "2. Local rebuild - Alternative automated approach"
echo ""
read -p "Choose method (1 for manual, 2 for local): " -n 1 -r
echo

if [[ $REPLY =~ ^[1]$ ]]; then
    ./05-deploy-images-to-lightsail.sh
    echo ""
    echo "⏸️  Deployment paused for manual steps"
    echo "📋 Complete the manual steps above, then run:"
    echo "   ./07-deploy-frontend.sh"
    exit 0
elif [[ $REPLY =~ ^[2]$ ]]; then
    ./06-rebuild-and-deploy-locally.sh
    echo ""
    echo "⏸️  Backend images pushed. Complete deployment in Lightsail console, then continue."
    read -p "Press Enter when Lightsail deployment is complete..."
else
    echo "Invalid choice. Run individual scripts manually."
    exit 1
fi

# Step 7: Deploy Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./07-deploy-frontend.sh

echo ""
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend: https://conservationbiologytools.org"
echo "🔗 Backend: Check Lightsail console for API URL"
echo ""
echo "📋 Final Steps:"
echo "1. Configure DNS records in Route 53"
echo "2. Update frontend API configuration with Lightsail URL"
echo "3. Test all endpoints"