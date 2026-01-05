#!/bin/bash

# Create Lightsail Container Service for Conservation Biology Toolkit
set -e

echo "🚀 Creating Lightsail Container Service"
echo "======================================"

SERVICE_NAME="conservation-api"
POWER="nano"  # nano, micro, small, medium, large, xlarge
SCALE=1

# Create the container service
echo "📦 Creating container service: $SERVICE_NAME"
aws lightsail create-container-service \
    --service-name "$SERVICE_NAME" \
    --power "$POWER" \
    --scale "$SCALE" \
    --tags key=Project,value=ConservationBiologyToolkit

echo "⏳ Waiting for service to be ready..."
aws lightsail wait container-service-ready --service-name "$SERVICE_NAME"

echo "✅ Container service created successfully!"
echo "📋 Service details:"
aws lightsail get-container-services --service-name "$SERVICE_NAME" --query 'containerServices[0].{Name:containerServiceName,State:state,Power:power,Scale:scale,Url:url}'

echo ""
echo "📋 Next step: Run ./deploy-to-lightsail.sh"