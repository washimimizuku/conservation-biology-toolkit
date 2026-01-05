# ECS Fargate Deployment Scripts

This directory contains scripts to deploy the Conservation Biology Toolkit to AWS ECS Fargate.

## Overview

ECS Fargate provides serverless container hosting with automatic scaling, high availability, and zero server management. This deployment approach is ideal for production workloads that need to scale based on demand.

## Architecture

```
Internet → Route 53 → Application Load Balancer → ECS Fargate Services
                                                ├── Population Analysis
                                                ├── Sampling Survey
                                                ├── Genetic Diversity
                                                ├── Species Assessment
                                                ├── Habitat Landscape
                                                ├── Climate Impact
                                                └── Conservation Planning
```

## Cost Estimate

- **Base cost**: ~$49/month (7 services × 0.25 vCPU × 0.5GB + ALB)
- **With auto-scaling**: $49-245/month (scales 1-5 tasks per service)
- **Frontend**: ~$3/month (S3 + CloudFront, deploy separately)

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **Docker** installed locally
3. **Domain registered** in Route 53 (`conservationbiologytools.org`)
4. **Repository cloned** and in root directory

## Quick Start

### Option 1: Complete Automated Deployment
```bash
# Run from conservation-biology-toolkit root directory
./ecs-setup/deploy-all.sh
```

### Option 2: Step-by-Step Deployment
```bash
# 1. Create ECR repositories
./ecs-setup/01-create-ecr-repositories.sh

# 2. Build and push Docker images
./ecs-setup/02-build-and-push-images.sh

# 3. Create ECS infrastructure
./ecs-setup/03-create-ecs-infrastructure.sh

# 4. Create task definitions
./ecs-setup/04-create-task-definitions.sh

# 5. Create target groups and ALB rules
./ecs-setup/05-create-target-groups.sh

# 6. Deploy ECS services
./ecs-setup/06-deploy-ecs-services.sh

# 7. Setup DNS
./ecs-setup/07-setup-dns.sh

# 8. Configure auto-scaling (optional)
./ecs-setup/08-setup-auto-scaling.sh
```

## Script Details

### 01-create-ecr-repositories.sh
- Creates ECR repositories for all 7 services + nginx
- Enables image scanning and encryption
- Configures Docker login to ECR

### 02-build-and-push-images.sh
- Builds Docker images for all FastAPI services
- Creates optimized nginx image for ECS
- Pushes all images to ECR

### 03-create-ecs-infrastructure.sh
- Creates VPC with public subnets in 2 AZs
- Sets up Internet Gateway and routing
- Creates security groups
- Creates ECS cluster
- Creates Application Load Balancer
- Sets up IAM roles

### 04-create-task-definitions.sh
- Creates ECS task definitions for each service
- Configures resource allocation (256 CPU, 512MB RAM)
- Sets up CloudWatch logging
- Configures health checks

### 05-create-target-groups.sh
- Creates ALB target groups for each service
- Sets up listener rules for API routing
- Configures health checks

### 06-deploy-ecs-services.sh
- Deploys ECS services for all microservices
- Configures auto-scaling targets
- Waits for services to stabilize
- Tests API endpoints

### 07-setup-dns.sh
- Creates Route 53 DNS records
- Points api.conservationbiologytools.org to ALB
- Tests DNS resolution and API endpoints

### 08-setup-auto-scaling.sh
- Configures auto-scaling policies (1-5 tasks per service)
- Sets up CloudWatch alarms
- Creates monitoring dashboard
- Sets up SNS notifications

## Configuration

All configuration is saved in `ecs-config.env`:

```bash
# Infrastructure
REGION=us-east-1
CLUSTER_NAME=conservation-biology-cluster
VPC_ID=vpc-xxxxx
ALB_DNS=conservation-alb-xxxxx.us-east-1.elb.amazonaws.com

# DNS
DOMAIN=conservationbiologytools.org
API_SUBDOMAIN=api.conservationbiologytools.org

# Auto-scaling
MIN_CAPACITY=1
MAX_CAPACITY=5
TARGET_CPU=70
```

## API Endpoints

After deployment, your APIs will be available at:

- **Population Analysis**: http://api.conservationbiologytools.org/api/population/docs
- **Sampling Survey**: http://api.conservationbiologytools.org/api/sampling/docs
- **Genetic Diversity**: http://api.conservationbiologytools.org/api/genetic/docs
- **Species Assessment**: http://api.conservationbiologytools.org/api/species/docs
- **Habitat Landscape**: http://api.conservationbiologytools.org/api/habitat/docs
- **Climate Impact**: http://api.conservationbiologytools.org/api/climate/docs
- **Conservation Planning**: http://api.conservationbiologytools.org/api/conservation/docs

## Monitoring

### CloudWatch Dashboard
- CPU and memory utilization for all services
- Task count and scaling events
- Available at: CloudWatch → Dashboards → ConservationBiologyToolkit

### ECS Console
- Service status and task health
- Deployment history and rollbacks
- Available at: ECS → Clusters → conservation-biology-cluster

### CloudWatch Logs
- Application logs for each service
- Available at: CloudWatch → Log groups → /ecs/[service-name]

## Scaling Behavior

### Automatic Scaling
- **Trigger**: CPU utilization > 70%
- **Scale out**: Add tasks (up to 5 per service)
- **Scale in**: Remove tasks (down to 1 per service)
- **Cooldown**: 5 minutes between scaling events

### Manual Scaling
```bash
# Scale a specific service
aws ecs update-service \
    --cluster conservation-biology-cluster \
    --service population-analysis-service \
    --desired-count 3
```

## Troubleshooting

### Service Won't Start
```bash
# Check service events
aws ecs describe-services \
    --cluster conservation-biology-cluster \
    --services population-analysis-service

# Check task logs
aws logs tail /ecs/population-analysis --follow
```

### High Costs
```bash
# Check running task count
aws ecs list-tasks --cluster conservation-biology-cluster

# Scale down services manually
aws ecs update-service \
    --cluster conservation-biology-cluster \
    --service population-analysis-service \
    --desired-count 1
```

### DNS Issues
```bash
# Check Route 53 records
aws route53 list-resource-record-sets \
    --hosted-zone-id YOUR_ZONE_ID

# Test DNS resolution
nslookup api.conservationbiologytools.org
```

## Cleanup

To remove all ECS resources:

```bash
# Delete services
aws ecs update-service --cluster conservation-biology-cluster --service population-analysis-service --desired-count 0
aws ecs delete-service --cluster conservation-biology-cluster --service population-analysis-service

# Delete cluster
aws ecs delete-cluster --cluster conservation-biology-cluster

# Delete ALB, target groups, VPC, etc. via AWS Console
```

## Benefits vs Lightsail

| Feature | Lightsail | ECS Fargate |
|---------|-----------|-------------|
| **Server Management** | Manual | None |
| **Scaling** | Manual upgrade | Automatic |
| **High Availability** | Single AZ | Multi-AZ |
| **Monitoring** | Basic | Advanced |
| **Cost (low traffic)** | $5/month | $49/month |
| **Cost (high traffic)** | Fixed | Scales with usage |
| **Deployment** | SSH + Docker | CI/CD ready |

## Next Steps

1. **Deploy Frontend**: Use existing S3 + CloudFront setup
2. **CI/CD Pipeline**: Set up automated deployments
3. **SSL Certificate**: Add HTTPS support to ALB
4. **Monitoring**: Configure alerts and notifications
5. **Backup**: Set up automated backups if needed