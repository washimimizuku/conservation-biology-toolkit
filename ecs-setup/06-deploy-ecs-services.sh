#!/bin/bash

# Deploy ECS services for all conservation biology microservices
# Run after creating target groups

set -e

echo "🚀 Deploying ECS Services"
echo "========================"

# Load configuration
if [ ! -f "ecs-config.env" ]; then
    echo "❌ Error: ecs-config.env not found"
    echo "Run ./03-create-ecs-infrastructure.sh first"
    exit 1
fi

source ecs-config.env

echo "🎯 Cluster: $CLUSTER_NAME"
echo "🌐 Region: $REGION"
echo "⚖️ Load Balancer: $ALB_DNS"
echo ""

# Services to deploy
SERVICES=(
    "population-analysis"
    "sampling-survey"
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
)

echo "🚀 Creating ECS services..."

for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    
    # Get target group ARN (convert service name to env var format)
    tg_var="TG_${service^^}_ARN"
    tg_var=$(echo "$tg_var" | tr '-' '_')
    tg_arn="${!tg_var}"
    
    if [ -z "$tg_arn" ]; then
        echo "❌ Error: Target group ARN not found for $service"
        echo "Run ./05-create-target-groups.sh first"
        exit 1
    fi
    
    # Check if service already exists
    if aws ecs describe-services --cluster $CLUSTER_NAME --services $service_name --region $REGION >/dev/null 2>&1; then
        echo "✅ Service $service_name already exists, updating..."
        
        # Update service to latest task definition
        aws ecs update-service \
            --cluster $CLUSTER_NAME \
            --service $service_name \
            --task-definition $service \
            --region $REGION >/dev/null
        echo "🔄 Updated service: $service_name"
    else
        echo "🚀 Creating service: $service_name"
        
        # Create new service
        aws ecs create-service \
            --cluster $CLUSTER_NAME \
            --service-name $service_name \
            --task-definition $service \
            --desired-count 1 \
            --launch-type FARGATE \
            --platform-version LATEST \
            --network-configuration "awsvpcConfiguration={subnets=[$SUBNET1_ID,$SUBNET2_ID],securityGroups=[$SG_ID],assignPublicIp=ENABLED}" \
            --load-balancers "targetGroupArn=$tg_arn,containerName=$service,containerPort=8000" \
            --health-check-grace-period-seconds 60 \
            --tags "key=Name,value=$service_name" "key=Project,value=ConservationBiology" \
            --enable-execute-command \
            --region $REGION >/dev/null
        
        echo "✅ Created service: $service_name"
    fi
done

echo ""
echo "⏳ Waiting for services to stabilize..."
echo "This may take 5-10 minutes for initial deployment..."

# Wait for services to become stable
for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    echo "⏳ Waiting for $service_name to stabilize..."
    
    aws ecs wait services-stable \
        --cluster $CLUSTER_NAME \
        --services $service_name \
        --region $REGION
    
    echo "✅ $service_name is stable"
done

echo ""
echo "🔍 Checking service status..."

# Check service status
for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    
    # Get service status
    status=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $service_name \
        --region $REGION \
        --query 'services[0].status' \
        --output text)
    
    running_count=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $service_name \
        --region $REGION \
        --query 'services[0].runningCount' \
        --output text)
    
    desired_count=$(aws ecs describe-services \
        --cluster $CLUSTER_NAME \
        --services $service_name \
        --region $REGION \
        --query 'services[0].desiredCount' \
        --output text)
    
    if [ "$status" = "ACTIVE" ] && [ "$running_count" = "$desired_count" ]; then
        echo "✅ $service_name: $status ($running_count/$desired_count tasks)"
    else
        echo "⚠️  $service_name: $status ($running_count/$desired_count tasks)"
    fi
done

echo ""
echo "🧪 Testing API endpoints..."

# Wait a bit for load balancer to register targets
sleep 30

# Test each endpoint
for service in "${SERVICES[@]}"; do
    endpoint="http://$ALB_DNS/api/${service//-/}/docs"
    
    if curl -s -f "$endpoint" >/dev/null; then
        echo "✅ $service: $endpoint"
    else
        echo "⚠️  $service: $endpoint (may still be starting up)"
    fi
done

echo ""
echo "✅ ECS Services deployment complete!"
echo ""
echo "🌐 Your Conservation Biology Toolkit APIs are available at:"
echo "  Base URL: http://$ALB_DNS"
echo ""
echo "📚 API Documentation:"
echo "  - Population Analysis: http://$ALB_DNS/api/population/docs"
echo "  - Sampling Survey: http://$ALB_DNS/api/sampling/docs"
echo "  - Genetic Diversity: http://$ALB_DNS/api/genetic/docs"
echo "  - Species Assessment: http://$ALB_DNS/api/species/docs"
echo "  - Habitat Landscape: http://$ALB_DNS/api/habitat/docs"
echo "  - Climate Impact: http://$ALB_DNS/api/climate/docs"
echo "  - Conservation Planning: http://$ALB_DNS/api/conservation/docs"
echo ""
echo "📋 Next step: Run ./07-setup-dns.sh to configure your domain"