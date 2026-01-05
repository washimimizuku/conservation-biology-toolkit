#!/bin/bash

# Master Deployment Script - Single Container Approach
# Runs all deployment steps for Lightsail single container

set -e

echo "🚀 Conservation Biology Toolkit - Lightsail Deployment"
echo "===================================================="
echo ""
echo "This script will deploy:"
echo "✅ Frontend: S3 + CloudFront + SSL"
echo "✅ Backend: Single Container (ECR + Lightsail)"
echo ""

read -p "Continue with deployment? (y/N): " -n 1 -r
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

# Step 2: ECR Repository
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./02-create-ecr-repositories.sh

# Step 3: Build and Push Container
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./03-build-and-push-lightsail.sh

# Step 4: Lightsail Container Service
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./04-create-lightsail-container-service.sh

# Step 5: Deploy Frontend
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
./05-deploy-frontend.sh

echo ""
echo "🎉 Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Frontend: https://conservationbiologytools.org"
echo "🔗 Backend: Check Lightsail console for API URL"
echo ""
echo "📋 Final Steps:"
echo "1. Deploy container in Lightsail console using ECR repository"
echo "2. Configure container with port 80 as public endpoint"
echo "3. Update frontend API configuration with Lightsail URL"
echo "4. Test all endpoints"