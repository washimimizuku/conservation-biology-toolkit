#!/bin/bash

# Create ALB target groups and listener rules for all services
# Run after creating task definitions

set -e

echo "🎯 Creating ALB Target Groups and Listener Rules"
echo "==============================================="

# Load configuration
if [ ! -f "ecs-config.env" ]; then
    echo "❌ Error: ecs-config.env not found"
    echo "Run ./03-create-ecs-infrastructure.sh first"
    exit 1
fi

source ecs-config.env

echo "⚖️ Load Balancer: $ALB_DNS"
echo "🌐 VPC: $VPC_ID"
echo ""

# Services configuration: name, path, port
declare -A SERVICES=(
    ["population-analysis"]="/api/population/*"
    ["sampling-survey"]="/api/sampling/*"
    ["genetic-diversity"]="/api/genetic/*"
    ["species-assessment"]="/api/species/*"
    ["habitat-landscape"]="/api/habitat/*"
    ["climate-impact"]="/api/climate/*"
    ["conservation-planning"]="/api/conservation/*"
)

echo "🎯 Creating target groups..."

# Create target groups
declare -A TARGET_GROUPS
for service in "${!SERVICES[@]}"; do
    TG_NAME="${service}-tg"
    
    # Check if target group exists
    if aws elbv2 describe-target-groups --names $TG_NAME >/dev/null 2>&1; then
        TG_ARN=$(aws elbv2 describe-target-groups --names $TG_NAME --query 'TargetGroups[0].TargetGroupArn' --output text)
        echo "✅ Target group $TG_NAME already exists"
    else
        TG_ARN=$(aws elbv2 create-target-group \
            --name $TG_NAME \
            --protocol HTTP \
            --port 8000 \
            --vpc-id $VPC_ID \
            --target-type ip \
            --health-check-enabled \
            --health-check-path /health \
            --health-check-protocol HTTP \
            --health-check-interval-seconds 30 \
            --health-check-timeout-seconds 5 \
            --healthy-threshold-count 2 \
            --unhealthy-threshold-count 3 \
            --matcher HttpCode=200 \
            --tags Key=Name,Value=$TG_NAME Key=Service,Value=$service \
            --query 'TargetGroups[0].TargetGroupArn' \
            --output text)
        echo "✅ Created target group: $TG_NAME"
    fi
    
    TARGET_GROUPS[$service]=$TG_ARN
done

echo ""
echo "🎧 Setting up ALB listener..."

# Create or get listener
if aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN | grep -q "Port.*80"; then
    LISTENER_ARN=$(aws elbv2 describe-listeners --load-balancer-arn $ALB_ARN --query 'Listeners[?Port==`80`].ListenerArn' --output text)
    echo "✅ Using existing listener"
else
    # Create default listener with a default response
    LISTENER_ARN=$(aws elbv2 create-listener \
        --load-balancer-arn $ALB_ARN \
        --protocol HTTP \
        --port 80 \
        --default-actions Type=fixed-response,FixedResponseConfig='{MessageBody="Conservation Biology Toolkit API - Use /api/[service]/* endpoints",StatusCode="200",ContentType="text/plain"}' \
        --query 'Listeners[0].ListenerArn' \
        --output text)
    echo "✅ Created ALB listener"
fi

echo ""
echo "📋 Creating listener rules..."

# Create listener rules for each service
PRIORITY=100
for service in "${!SERVICES[@]}"; do
    path_pattern="${SERVICES[$service]}"
    tg_arn="${TARGET_GROUPS[$service]}"
    
    # Check if rule already exists
    EXISTING_RULE=$(aws elbv2 describe-rules --listener-arn $LISTENER_ARN --query "Rules[?Conditions[0].Values[0]=='$path_pattern'].RuleArn" --output text)
    
    if [ ! -z "$EXISTING_RULE" ]; then
        echo "✅ Rule for $service ($path_pattern) already exists"
    else
        aws elbv2 create-rule \
            --listener-arn $LISTENER_ARN \
            --priority $PRIORITY \
            --conditions Field=path-pattern,Values="$path_pattern" \
            --actions Type=forward,TargetGroupArn=$tg_arn \
            --tags Key=Service,Value=$service >/dev/null
        echo "✅ Created rule: $service -> $path_pattern (priority $PRIORITY)"
    fi
    
    ((PRIORITY+=10))
done

# Save target group ARNs to config
echo "" >> ecs-config.env
echo "# Target Group ARNs" >> ecs-config.env
for service in "${!SERVICES[@]}"; do
    tg_arn="${TARGET_GROUPS[$service]}"
    echo "TG_${service^^}_ARN=${tg_arn}" | tr '-' '_' >> ecs-config.env
done

echo "LISTENER_ARN=$LISTENER_ARN" >> ecs-config.env

echo ""
echo "✅ Target groups and listener rules created successfully!"
echo ""
echo "🎯 Target Groups Created:"
for service in "${!SERVICES[@]}"; do
    path_pattern="${SERVICES[$service]}"
    echo "  - $service: ${path_pattern} -> ${TARGET_GROUPS[$service]}"
done

echo ""
echo "🌐 API Endpoints (after deployment):"
echo "  Base URL: http://$ALB_DNS"
for service in "${!SERVICES[@]}"; do
    path_pattern="${SERVICES[$service]}"
    # Convert path pattern to example URL
    example_path=$(echo "$path_pattern" | sed 's/\*/docs/')
    echo "  - $service: http://$ALB_DNS$example_path"
done

echo ""
echo "📋 Next step: Run ./06-deploy-ecs-services.sh"