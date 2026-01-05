#!/bin/bash

# Deploy ECR images to Lightsail Container Service
set -e

echo "🚀 Deploying to Lightsail Container Service"
echo "=========================================="

SERVICE_NAME="conservation-api"
REGION="us-east-1"
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$ACCOUNT_ID.dkr.ecr.$REGION.amazonaws.com"

# Services to deploy
SERVICES=(
    "population-analysis:8002"
    "sampling-survey:8003" 
    "genetic-diversity:8004"
    "species-assessment:8005"
    "habitat-landscape:8006"
    "climate-impact:8007"
    "conservation-planning:8008"
)

echo "📤 Pushing images from ECR to Lightsail..."

# Push each service image
for service_port in "${SERVICES[@]}"; do
    service=$(echo $service_port | cut -d: -f1)
    echo "📦 Pushing $service..."
    
    aws lightsail push-container-image \
        --service-name "$SERVICE_NAME" \
        --label "$service" \
        --image "$ECR_REGISTRY/conservation/$service:latest"
done

# Push nginx
echo "📦 Pushing nginx..."
aws lightsail push-container-image \
    --service-name "$SERVICE_NAME" \
    --label "nginx" \
    --image "$ECR_REGISTRY/conservation/nginx:latest"

echo "✅ All images pushed to Lightsail!"

# Create deployment configuration
echo "⚙️ Creating deployment configuration..."

cat > lightsail-deployment.json << EOF
{
  "containers": {
    "population-analysis": {
      "image": ":conservation-api.$service.latest",
      "ports": {
        "8002": "HTTP"
      }
    },
    "sampling-survey": {
      "image": ":conservation-api.sampling-survey.latest", 
      "ports": {
        "8003": "HTTP"
      }
    },
    "genetic-diversity": {
      "image": ":conservation-api.genetic-diversity.latest",
      "ports": {
        "8004": "HTTP"
      }
    },
    "species-assessment": {
      "image": ":conservation-api.species-assessment.latest",
      "ports": {
        "8005": "HTTP"
      }
    },
    "habitat-landscape": {
      "image": ":conservation-api.habitat-landscape.latest",
      "ports": {
        "8006": "HTTP"
      }
    },
    "climate-impact": {
      "image": ":conservation-api.climate-impact.latest",
      "ports": {
        "8007": "HTTP"
      }
    },
    "conservation-planning": {
      "image": ":conservation-api.conservation-planning.latest",
      "ports": {
        "8008": "HTTP"
      }
    },
    "nginx": {
      "image": ":conservation-api.nginx.latest",
      "ports": {
        "80": "HTTP"
      }
    }
  },
  "publicEndpoint": {
    "containerName": "nginx",
    "containerPort": 80,
    "healthCheck": {
      "healthyThreshold": 2,
      "unhealthyThreshold": 2,
      "timeoutSeconds": 5,
      "intervalSeconds": 30,
      "path": "/health",
      "successCodes": "200"
    }
  }
}
EOF

# Deploy the configuration
echo "🚀 Deploying containers..."
aws lightsail create-container-service-deployment \
    --service-name "$SERVICE_NAME" \
    --cli-input-json file://lightsail-deployment.json

echo "⏳ Waiting for deployment..."
aws lightsail wait container-service-deployment-ready --service-name "$SERVICE_NAME"

# Get the public URL
echo "✅ Deployment complete!"
echo "📋 Service URL:"
aws lightsail get-container-services \
    --service-name "$SERVICE_NAME" \
    --query 'containerServices[0].url' \
    --output text

# Clean up
rm lightsail-deployment.json

echo ""
echo "🔗 Update your frontend to use this API URL"