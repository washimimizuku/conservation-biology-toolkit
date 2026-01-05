# Deployment Options

This directory contains all deployment configurations and scripts for the Conservation Biology Toolkit.

## Available Deployment Methods

### 1. Lightsail + ECR (Recommended for Low Traffic)
**Cost**: ~$5.10/month | **Traffic**: Up to 1,000 requests/day

```bash
cd lightsail-setup/
./setup-lightsail-iam.sh
./deploy-lightsail-ecr.sh
```

**Best for**: Development, testing, low-traffic production

### 2. ECS Fargate (Recommended for Production)
**Cost**: $49-245/month | **Traffic**: Unlimited with auto-scaling

```bash
cd ecs-setup/
./deploy-all.sh
```

**Best for**: Production workloads, high availability, auto-scaling

### 3. S3 + CloudFront + Lightsail (Legacy)
**Cost**: ~$8.50/month | **Traffic**: Up to 2,000 requests/day

```bash
cd scripts/
./setup-aws-infrastructure.sh
./deploy-aws.sh
```

**Best for**: Static frontend + simple backend

## Directory Structure

```
deployment/
├── README.md                    # This file
├── nginx/                       # Nginx configurations
│   └── api-only.conf           # API-only nginx config
├── scripts/                     # Legacy deployment scripts
│   ├── deploy-aws.sh           # S3 + CloudFront deployment
│   ├── setup-aws-infrastructure.sh
│   └── setup-dev.sh            # Development setup
├── lightsail-setup/            # Lightsail + ECR deployment
│   ├── README.md
│   ├── setup-lightsail-iam.sh
│   ├── deploy-lightsail-ecr.sh
│   ├── test-lightsail-ecr.sh
│   └── docker-compose.lightsail-ecr.yml
└── ecs-setup/                  # ECS Fargate deployment
    ├── README.md
    ├── deploy-all.sh
    └── 01-08-*.sh              # Individual setup scripts
```

## Choosing the Right Deployment

| Use Case | Method | Cost/Month | Complexity |
|----------|--------|------------|------------|
| **Development** | Lightsail + ECR | $5.10 | Low |
| **Small Production** | Lightsail + ECR | $5.10 | Low |
| **Growing Production** | ECS Fargate | $49-245 | Medium |
| **Enterprise** | ECS Fargate | $245+ | Medium |

## Migration Path

1. **Start**: Lightsail + ECR ($5.10/month)
2. **Growth**: ECS Fargate ($49+/month)
3. **Scale**: Add auto-scaling, monitoring, CI/CD

Each method uses the same Docker images, making migration straightforward.