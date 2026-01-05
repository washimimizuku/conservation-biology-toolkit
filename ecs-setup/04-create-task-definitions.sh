#!/bin/bash

# Create ECS task definitions for all services
# Run after creating ECS infrastructure

set -e

echo "📋 Creating ECS Task Definitions"
echo "==============================="

# Load configuration
if [ ! -f "ecs-config.env" ]; then
    echo "❌ Error: ecs-config.env not found"
    echo "Run ./03-create-ecs-infrastructure.sh first"
    exit 1
fi

source ecs-config.env

echo "📦 Account ID: $ACCOUNT_ID"
echo "🌍 Region: $REGION"
echo "📋 ECR Registry: $ECR_REGISTRY"
echo ""

# Create CloudWatch log groups
echo "📊 Creating CloudWatch log groups..."
SERVICES=(
    "population-analysis"
    "sampling-survey"
    "genetic-diversity"
    "species-assessment"
    "habitat-landscape"
    "climate-impact"
    "conservation-planning"
)

for service in "${SERVICES[@]}"; do
    if aws logs describe-log-groups --log-group-name-prefix "/ecs/$service" --region $REGION | grep -q "$service"; then
        echo "✅ Log group /ecs/$service already exists"
    else
        aws logs create-log-group --log-group-name "/ecs/$service" --region $REGION
        echo "✅ Created log group: /ecs/$service"
    fi
done

echo ""
echo "📋 Creating task definitions..."

# Function to create task definition
create_task_definition() {
    local service_name=$1
    local port=${2:-8000}
    
    cat > "${service_name}-task.json" << EOF
{
  "family": "$service_name",
  "networkMode": "awsvpc",
  "requiresCompatibilities": ["FARGATE"],
  "cpu": "256",
  "memory": "512",
  "executionRoleArn": "arn:aws:iam::$ACCOUNT_ID:role/ecsTaskExecutionRole",
  "containerDefinitions": [
    {
      "name": "$service_name",
      "image": "$ECR_REGISTRY/conservation/$service_name:latest",
      "portMappings": [
        {
          "containerPort": $port,
          "protocol": "tcp"
        }
      ],
      "essential": true,
      "logConfiguration": {
        "logDriver": "awslogs",
        "options": {
          "awslogs-group": "/ecs/$service_name",
          "awslogs-region": "$REGION",
          "awslogs-stream-prefix": "ecs"
        }
      },
      "healthCheck": {
        "command": ["CMD-SHELL", "curl -f http://localhost:$port/health || exit 1"],
        "interval": 30,
        "timeout": 5,
        "retries": 3,
        "startPeriod": 60
      },
      "environment": [
        {
          "name": "PORT",
          "value": "$port"
        }
      ]
    }
  ]
}
EOF

    # Register task definition
    aws ecs register-task-definition \
        --cli-input-json file://${service_name}-task.json \
        --region $REGION >/dev/null
    
    echo "✅ Created task definition: $service_name"
    rm ${service_name}-task.json
}

# Create task definitions for all services
create_task_definition "population-analysis" 8000
create_task_definition "sampling-survey" 8000
create_task_definition "genetic-diversity" 8000
create_task_definition "species-assessment" 8000
create_task_definition "habitat-landscape" 8000
create_task_definition "climate-impact" 8000
create_task_definition "conservation-planning" 8000

echo ""
echo "✅ All task definitions created successfully!"
echo ""
echo "📋 Task Definitions:"
for service in "${SERVICES[@]}"; do
    echo "  - $service (256 CPU, 512 MB RAM, port 8000)"
done

echo ""
echo "📋 Next step: Run ./05-create-target-groups.sh"