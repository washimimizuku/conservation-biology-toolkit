# AWS Deployment Scripts

Unified deployment approach for the Conservation Biology Toolkit using S3, CloudFront, ECR, and Lightsail Container Services.

## Overview

This deployment combines the working parts from different deployment methods:
- **Frontend**: S3 + CloudFront (from `deployment/scripts/`)
- **Backend Images**: ECR (from `deployment/ecs-setup/`)
- **Backend Runtime**: Lightsail Container Service (from `deployment/lightsail-setup/`)

## Quick Start

```bash
cd deployment/aws
chmod +x *.sh
./deploy-all.sh
```

## Individual Steps

### 1. Frontend Infrastructure
```bash
./01-setup-frontend-infrastructure.sh
```
- Creates S3 bucket for static hosting
- Sets up CloudFront distribution
- Requests SSL certificate
- Configures Origin Access Control

### 2. ECR Repositories
```bash
./02-create-ecr-repositories.sh
```
- Creates ECR repositories for all services
- Configures image scanning and encryption

### 3. Build and Push Images
```bash
./03-build-and-push-images.sh
```
- Builds all Docker images
- Pushes to ECR repositories
- Includes Nginx API gateway

### 4. Lightsail Container Service
```bash
./04-create-lightsail-container-service.sh
```
- Creates Lightsail container service
- Configures nano instance (7$/month)

### 5. Deploy Images to Lightsail
**Option A: Manual (Recommended)**
```bash
./05-deploy-images-to-lightsail.sh
```
Provides console instructions due to Docker API compatibility issues.

**Option B: Local Rebuild**
```bash
./06-rebuild-and-deploy-locally.sh
```
Rebuilds images locally and pushes directly to Lightsail.

### 6. Deploy Frontend
```bash
./07-deploy-frontend.sh
```
- Builds React application
- Deploys to S3
- Invalidates CloudFront cache

## Architecture

```
Frontend (React)
├── S3 Bucket (Static Hosting)
├── CloudFront (CDN + SSL)
└── Route 53 (DNS)

Backend (FastAPI Services)
├── ECR (Container Registry)
├── Lightsail Container Service
│   ├── population-analysis:8002
│   ├── sampling-survey:8003
│   ├── genetic-diversity:8004
│   ├── species-assessment:8005
│   ├── habitat-landscape:8006
│   ├── climate-impact:8007
│   ├── conservation-planning:8008
│   └── nginx:80 (API Gateway)
└── Public URL for API access
```

## Cost Estimate

- **S3**: ~$1/month (storage + requests)
- **CloudFront**: ~$1/month (data transfer)
- **ECR**: ~$1/month (image storage)
- **Lightsail Container Service**: $7/month (nano instance)
- **Route 53**: $0.50/month (hosted zone)

**Total**: ~$10.50/month

## Troubleshooting

### Docker API Version Issues
If you encounter "Docker daemon API version is 1.41" errors:
1. Use the manual deployment option (Step 5A)
2. Or use the local rebuild script (Step 6)

### SSL Certificate Validation
1. Go to AWS Certificate Manager
2. Click on the certificate
3. Click "Create records in Route 53"
4. Wait for validation (5-30 minutes)

### Lightsail Deployment
1. Go to Lightsail Console → Container services → conservation-api
2. Images tab: Verify all images are pushed
3. Deployments tab: Create deployment with proper container configuration
4. Set nginx as public endpoint on port 80

## Next Steps After Deployment

1. **Configure DNS**: Point your domain to CloudFront distribution
2. **Update Frontend**: Configure API base URL to use Lightsail endpoint
3. **Test**: Verify all services are accessible
4. **Monitor**: Set up CloudWatch alarms and logging

## Support

This approach combines the working elements from:
- `deployment/scripts/` (Frontend - ✅ Working)
- `deployment/ecs-setup/` (ECR - ✅ Working)  
- `deployment/lightsail-setup/` (Container Service - ✅ Working)

Each step is based on proven working scripts with Docker API compatibility fixes.