#!/bin/bash

# Setup auto-scaling for ECS services
# Optional: Run after DNS setup for production-ready scaling

set -e

echo "📈 Setting up Auto-Scaling for ECS Services"
echo "==========================================="

# Load configuration
if [ ! -f "ecs-config.env" ]; then
    echo "❌ Error: ecs-config.env not found"
    echo "Run ./03-create-ecs-infrastructure.sh first"
    exit 1
fi

source ecs-config.env

echo "🎯 Cluster: $CLUSTER_NAME"
echo "🌐 Region: $REGION"
echo ""

# Services to configure auto-scaling
SERVICES=(
    "population-analysis"
    "sampling-survey"
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
)

# Auto-scaling configuration
MIN_CAPACITY=1
MAX_CAPACITY=5
TARGET_CPU=70
SCALE_OUT_COOLDOWN=300  # 5 minutes
SCALE_IN_COOLDOWN=300   # 5 minutes

echo "⚙️ Auto-scaling configuration:"
echo "  - Min capacity: $MIN_CAPACITY"
echo "  - Max capacity: $MAX_CAPACITY"
echo "  - Target CPU: $TARGET_CPU%"
echo "  - Scale out cooldown: $SCALE_OUT_COOLDOWN seconds"
echo "  - Scale in cooldown: $SCALE_IN_COOLDOWN seconds"
echo ""

for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    resource_id="service/$CLUSTER_NAME/$service_name"
    
    echo "📈 Setting up auto-scaling for $service_name..."
    
    # Register scalable target
    aws application-autoscaling register-scalable-target \
        --service-namespace ecs \
        --scalable-dimension ecs:service:DesiredCount \
        --resource-id "$resource_id" \
        --min-capacity $MIN_CAPACITY \
        --max-capacity $MAX_CAPACITY \
        --region $REGION >/dev/null
    
    echo "✅ Registered scalable target for $service_name"
    
    # Create scaling policy for scale out (CPU > 70%)
    SCALE_OUT_POLICY_ARN=$(aws application-autoscaling put-scaling-policy \
        --service-namespace ecs \
        --scalable-dimension ecs:service:DesiredCount \
        --resource-id "$resource_id" \
        --policy-name "${service}-scale-out" \
        --policy-type TargetTrackingScaling \
        --target-tracking-scaling-policy-configuration '{
            "TargetValue": '$TARGET_CPU',
            "PredefinedMetricSpecification": {
                "PredefinedMetricType": "ECSServiceAverageCPUUtilization"
            },
            "ScaleOutCooldown": '$SCALE_OUT_COOLDOWN',
            "ScaleInCooldown": '$SCALE_IN_COOLDOWN'
        }' \
        --region $REGION \
        --query 'PolicyARN' \
        --output text)
    
    echo "✅ Created CPU-based scaling policy for $service_name"
    
    # Create CloudWatch alarm for high memory usage (optional)
    aws cloudwatch put-metric-alarm \
        --alarm-name "${service}-high-memory" \
        --alarm-description "High memory usage for $service_name" \
        --metric-name MemoryUtilization \
        --namespace AWS/ECS \
        --statistic Average \
        --period 300 \
        --threshold 80 \
        --comparison-operator GreaterThanThreshold \
        --evaluation-periods 2 \
        --dimensions Name=ServiceName,Value=$service_name Name=ClusterName,Value=$CLUSTER_NAME \
        --region $REGION >/dev/null
    
    echo "✅ Created memory alarm for $service_name"
done

echo ""
echo "📊 Setting up CloudWatch dashboard..."

# Create CloudWatch dashboard for monitoring
cat > dashboard-config.json << EOF
{
    "widgets": [
        {
            "type": "metric",
            "x": 0,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
$(for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    echo "                    [ \"AWS/ECS\", \"CPUUtilization\", \"ServiceName\", \"$service_name\", \"ClusterName\", \"$CLUSTER_NAME\" ],"
done | sed '$ s/,$//')
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "ECS Service CPU Utilization",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 12,
            "y": 0,
            "width": 12,
            "height": 6,
            "properties": {
                "metrics": [
$(for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    echo "                    [ \"AWS/ECS\", \"MemoryUtilization\", \"ServiceName\", \"$service_name\", \"ClusterName\", \"$CLUSTER_NAME\" ],"
done | sed '$ s/,$//')
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "ECS Service Memory Utilization",
                "period": 300
            }
        },
        {
            "type": "metric",
            "x": 0,
            "y": 6,
            "width": 24,
            "height": 6,
            "properties": {
                "metrics": [
$(for service in "${SERVICES[@]}"; do
    service_name="${service}-service"
    echo "                    [ \"AWS/ECS\", \"RunningTaskCount\", \"ServiceName\", \"$service_name\", \"ClusterName\", \"$CLUSTER_NAME\" ],"
done | sed '$ s/,$//')
                ],
                "view": "timeSeries",
                "stacked": false,
                "region": "$REGION",
                "title": "ECS Service Task Count",
                "period": 300
            }
        }
    ]
}
EOF

aws cloudwatch put-dashboard \
    --dashboard-name "ConservationBiologyToolkit" \
    --dashboard-body file://dashboard-config.json \
    --region $REGION >/dev/null

rm dashboard-config.json

echo "✅ Created CloudWatch dashboard: ConservationBiologyToolkit"

echo ""
echo "🔔 Setting up SNS notifications (optional)..."

# Create SNS topic for scaling notifications
SNS_TOPIC_ARN=$(aws sns create-topic \
    --name conservation-biology-alerts \
    --region $REGION \
    --query 'TopicArn' \
    --output text)

echo "✅ Created SNS topic: $SNS_TOPIC_ARN"
echo "💡 To receive notifications, subscribe to this topic with your email:"
echo "   aws sns subscribe --topic-arn $SNS_TOPIC_ARN --protocol email --notification-endpoint your-email@example.com"

# Save auto-scaling configuration
cat >> ecs-config.env << EOF

# Auto-scaling Configuration
MIN_CAPACITY=$MIN_CAPACITY
MAX_CAPACITY=$MAX_CAPACITY
TARGET_CPU=$TARGET_CPU
SNS_TOPIC_ARN=$SNS_TOPIC_ARN
EOF

echo ""
echo "✅ Auto-scaling setup complete!"
echo ""
echo "📈 Auto-scaling Summary:"
echo "  - All services configured for auto-scaling"
echo "  - Scale range: $MIN_CAPACITY - $MAX_CAPACITY tasks per service"
echo "  - Trigger: CPU utilization > $TARGET_CPU%"
echo "  - CloudWatch dashboard: ConservationBiologyToolkit"
echo "  - SNS topic: conservation-biology-alerts"
echo ""
echo "📊 Monitoring:"
echo "  - CloudWatch Dashboard: https://console.aws.amazon.com/cloudwatch/home?region=$REGION#dashboards:name=ConservationBiologyToolkit"
echo "  - ECS Console: https://console.aws.amazon.com/ecs/home?region=$REGION#/clusters/$CLUSTER_NAME/services"
echo ""
echo "🎉 Your Conservation Biology Toolkit is now production-ready with auto-scaling!"
echo ""
echo "💰 Cost Optimization:"
echo "  - Services scale down to 1 task each during low usage"
echo "  - Services scale up to 5 tasks each during high demand"
echo "  - Estimated cost: $49-245/month depending on usage"