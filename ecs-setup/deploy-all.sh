#!/bin/bash

# Complete ECS Fargate deployment script
# Runs all setup scripts in sequence

set -e

echo "🚀 Complete ECS Fargate Deployment for Conservation Biology Toolkit"
echo "=================================================================="
echo ""
echo "This script will:"
echo "1. Create ECR repositories"
echo "2. Build and push Docker images"
echo "3. Create ECS infrastructure (VPC, ALB, Cluster)"
echo "4. Create task definitions"
echo "5. Create target groups and listener rules"
echo "6. Deploy ECS services"
echo "7. Setup DNS"
echo "8. Configure auto-scaling (optional)"
echo ""

read -p "Do you want to proceed with the complete deployment? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Deployment cancelled."
    exit 0
fi

echo ""
echo "⏱️ Estimated deployment time: 20-30 minutes"
echo "💰 Estimated monthly cost: ~$49 (can scale up to ~$245 under load)"
echo ""

# Check prerequisites
echo "🔍 Checking prerequisites..."

# Check AWS CLI
if ! command -v aws &> /dev/null; then
    echo "❌ AWS CLI not found. Please install AWS CLI first."
    exit 1
fi

# Check Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found. Please install Docker first."
    exit 1
fi

# Check AWS credentials
if ! aws sts get-caller-identity >/dev/null 2>&1; then
    echo "❌ AWS credentials not configured. Run 'aws configure' first."
    exit 1
fi

# Check if we're in the right directory
if [ ! -f "services/population-analysis/Dockerfile" ]; then
    echo "❌ Please run this script from the conservation-biology-toolkit root directory."
    exit 1
fi

echo "✅ Prerequisites check passed"
echo ""

# Make all scripts executable
chmod +x ecs-setup/*.sh

# Step 1: Create ECR repositories
echo "📦 Step 1/8: Creating ECR repositories..."
./ecs-setup/01-create-ecr-repositories.sh

echo ""
read -p "Press Enter to continue to image building..."

# Step 2: Build and push images
echo "🔨 Step 2/8: Building and pushing Docker images..."
./ecs-setup/02-build-and-push-images.sh

echo ""
read -p "Press Enter to continue to infrastructure creation..."

# Step 3: Create ECS infrastructure
echo "🏗️ Step 3/8: Creating ECS infrastructure..."
./ecs-setup/03-create-ecs-infrastructure.sh

echo ""
read -p "Press Enter to continue to task definitions..."

# Step 4: Create task definitions
echo "📋 Step 4/8: Creating task definitions..."
./ecs-setup/04-create-task-definitions.sh

echo ""
read -p "Press Enter to continue to target groups..."

# Step 5: Create target groups
echo "🎯 Step 5/8: Creating target groups and listener rules..."
./ecs-setup/05-create-target-groups.sh

echo ""
read -p "Press Enter to continue to service deployment..."

# Step 6: Deploy ECS services
echo "🚀 Step 6/8: Deploying ECS services..."
./ecs-setup/06-deploy-ecs-services.sh

echo ""
read -p "Press Enter to continue to DNS setup..."

# Step 7: Setup DNS
echo "🌐 Step 7/8: Setting up DNS..."
./ecs-setup/07-setup-dns.sh

echo ""
echo "🎉 Core deployment complete!"
echo ""

# Step 8: Auto-scaling (optional)
read -p "Do you want to set up auto-scaling? (recommended for production) (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "📈 Step 8/8: Setting up auto-scaling..."
    ./ecs-setup/08-setup-auto-scaling.sh
else
    echo "⏭️ Skipping auto-scaling setup"
fi

# Load final configuration
source ecs-setup/ecs-config.env

echo ""
echo "🎉 ECS Fargate Deployment Complete!"
echo "=================================="
echo ""
echo "🌐 Your Conservation Biology Toolkit is now live:"
echo "  📚 API Documentation: http://$API_SUBDOMAIN/api/[service]/docs"
echo "  🔗 Load Balancer: http://$ALB_DNS"
echo ""
echo "📋 Available APIs:"
echo "  - Population Analysis: http://$API_SUBDOMAIN/api/population/docs"
echo "  - Sampling Survey: http://$API_SUBDOMAIN/api/sampling/docs"
echo "  - Genetic Diversity: http://$API_SUBDOMAIN/api/genetic/docs"
echo "  - Species Assessment: http://$API_SUBDOMAIN/api/species/docs"
echo "  - Habitat Landscape: http://$API_SUBDOMAIN/api/habitat/docs"
echo "  - Climate Impact: http://$API_SUBDOMAIN/api/climate/docs"
echo "  - Conservation Planning: http://$API_SUBDOMAIN/api/conservation/docs"
echo ""
echo "📊 Monitoring & Management:"
echo "  - ECS Console: https://console.aws.amazon.com/ecs/home?region=$REGION#/clusters/$CLUSTER_NAME"
echo "  - CloudWatch Logs: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#logsV2:log-groups"
if [ ! -z "$SNS_TOPIC_ARN" ]; then
    echo "  - CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=ConservationBiologyToolkit"
fi
echo ""
echo "💰 Cost Information:"
echo "  - Base cost: ~$49/month (1 task per service + ALB)"
echo "  - With auto-scaling: $49-245/month (scales based on demand)"
echo "  - Frontend (S3 + CloudFront): ~$3/month (deploy separately)"
echo ""
echo "🔧 Next Steps:"
echo "  1. Test all API endpoints to ensure they're working"
echo "  2. Deploy your React frontend to S3 + CloudFront"
echo "  3. Set up monitoring alerts and notifications"
echo "  4. Configure CI/CD pipeline for automated deployments"
echo ""
echo "📁 Configuration saved in: ecs-setup/ecs-config.env"