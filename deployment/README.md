# Deployment Guide

This directory contains the production deployment configuration for the Conservation Biology Toolkit.

## Current Architecture

**✅ Production Setup:**
- **Frontend**: S3 + CloudFront → `https://conservationbiologytools.org`
- **API**: Lightsail Container Service → `https://api.conservationbiologytools.org`
- **Container**: Single container with all 7 FastAPI services + nginx

## Quick Deployment

### Automated (Recommended)
```bash
cd deployment/aws/
./deploy-all.sh
```

### Manual Steps
```bash
# 1. Setup frontend infrastructure
./01-setup-frontend-infrastructure.sh

# 2. Create ECR repository
./02-create-ecr-repositories.sh

# 3. Build and push API container
./03-build-and-push-lightsail.sh

# 4. Create Lightsail service
./04-create-lightsail-container-service.sh

# 5. Deploy frontend
./07-deploy-frontend.sh
```

## Updates

### Update API
```bash
./update-lightsail.sh
```

### Update Frontend
```bash
./update-frontend.sh
```

## File Structure

```
deployment/
├── aws/                    # Main deployment scripts
│   ├── deploy-all.sh      # Complete automated deployment
│   ├── update-*.sh        # Update scripts
│   └── 0*-*.sh           # Individual deployment steps
└── nginx/
    └── lightsail.conf     # Nginx configuration for container
```

## Services

**API Endpoints:**
- Population Analysis: `/population-analysis`
- Sampling & Survey: `/sampling-survey`
- Genetic Diversity: `/genetic-diversity`
- Species Assessment: `/species-assessment`
- Habitat & Landscape: `/habitat-landscape`
- Climate Impact: `/climate-impact`
- Conservation Planning: `/conservation-planning`

**Documentation:**
- Swagger UI: `https://api.conservationbiologytools.org/{service}/docs`
- OpenAPI: `https://api.conservationbiologytools.org/{service}/openapi.json`

## Cost Estimate

- **Lightsail Container (nano)**: ~$7/month
- **S3 + CloudFront**: ~$1-5/month
- **Route 53 Hosted Zone**: $0.50/month
- **Total**: ~$8.50-12.50/month

## Prerequisites

- AWS CLI configured
- Docker installed
- Domain configured in Route 53 (for custom domains)

## Troubleshooting

### Check Service Status
```bash
aws lightsail get-container-services --service-name conservation-api
```

### Test API Endpoints
```bash
curl https://api.conservationbiologytools.org/health
curl https://api.conservationbiologytools.org/population-analysis/
```

### View Logs
Check Lightsail Console → Container Services → conservation-api → Logs