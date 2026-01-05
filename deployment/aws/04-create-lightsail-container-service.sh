#!/bin/bash

# Step 4: Create Lightsail Container Service
# Replicates deployment/lightsail-setup/create-container-service.sh

set -e

echo "🚀 Step 4: Creating Lightsail Container Service"
echo "==============================================="

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
echo "✅ Step 4 Complete: Lightsail Container Service Ready"
echo "📋 Next: Run ./05-deploy-images-to-lightsail.sh"