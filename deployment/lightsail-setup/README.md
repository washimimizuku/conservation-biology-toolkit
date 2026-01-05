# Lightsail + ECR Deployment

This directory contains scripts to deploy the Conservation Biology Toolkit to AWS Lightsail using ECR (Elastic Container Registry) for image storage.

## Overview

This approach combines the simplicity and low cost of Lightsail with the professional image management of ECR:

- **Build images locally** (no resource constraints)
- **Store images in ECR** (versioned, secure)
- **Deploy to Lightsail** (simple, cost-effective)

## Cost

- **Lightsail**: $5/month (512MB RAM, 1 vCPU)
- **ECR**: ~$0.10/month (image storage)
- **Total**: ~$5.10/month

## Architecture

```
Local Machine → ECR → Lightsail Instance
     ↓            ↓         ↓
  Build Images  Store    Pull & Run
```

## Quick Start

### 1. Setup IAM Role for ECR Access
```bash
cd deployment/lightsail-setup/
./setup-lightsail-iam.sh
```

### 2. Attach IAM Role to Lightsail
1. Go to [Lightsail Console](https://lightsail.aws.amazon.com/ls/webapp/home/instances)
2. Select your instance → Networking tab
3. Click "Attach IAM role" → Select "LightsailECRProfile"
4. **Restart your Lightsail instance**

### 3. Test ECR Access (on Lightsail)
```bash
# SSH into Lightsail and run:
./test-lightsail-ecr.sh
```

### 4. Create ECR Repositories
```bash
cd ../../  # Go back to project root
./deployment/ecs-setup/01-create-ecr-repositories.sh
```

### 5. Build and Push Images
```bash
./deployment/ecs-setup/02-build-and-push-images.sh
```

### 6. Deploy to Lightsail
```bash
./deploy-lightsail-ecr.sh
```

## Files

- **setup-lightsail-iam.sh**: Creates IAM role for ECR access
- **deploy-lightsail-ecr.sh**: Main deployment script
- **test-lightsail-ecr.sh**: Tests ECR access from Lightsail
- **docker-compose.lightsail-ecr.yml**: Docker Compose file using ECR images

## Benefits vs Other Approaches

| Feature | Lightsail+ECR | Pure Lightsail | ECS Fargate |
|---------|---------------|----------------|-------------|
| **Cost** | $5.10/month | $5/month | $49/month |
| **Build Speed** | Fast (local) | Slow (limited resources) | Fast (local) |
| **Image Management** | Professional | Basic | Professional |
| **Scaling** | Manual | Manual | Automatic |
| **Complexity** | Medium | Low | High |

## Troubleshooting

### ECR Login Fails
```bash
# Check IAM role is attached
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/

# Test AWS CLI access
aws sts get-caller-identity
```

### Images Won't Pull
```bash
# Check ECR repositories exist
aws ecr describe-repositories --region us-east-1

# Check image exists
aws ecr list-images --repository-name conservation/population-analysis --region us-east-1
```

### Services Won't Start
```bash
# Check Docker Compose logs
docker compose logs

# Check individual service
docker compose logs population-analysis
```

## Updating Deployment

To update your deployment with new code:

```bash
# 1. Build and push new images (from project root)
./deployment/ecs-setup/02-build-and-push-images.sh

# 2. Redeploy to Lightsail (from lightsail-setup directory)
cd deployment/lightsail-setup/
./deploy-lightsail-ecr.sh
```

## Alternative: AWS CLI Configuration

If IAM roles don't work, you can use AWS CLI configuration instead:

```bash
# On Lightsail instance
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

Then run the deployment script normally.