# New Computer Setup Guide

This guide ensures you can deploy the Conservation Biology Toolkit from any computer.

## Prerequisites Checklist

### 1. System Requirements
- **Operating System**: macOS, Linux, or Windows (with WSL2)
- **Internet Connection**: Required for downloading dependencies and AWS access
- **Admin Access**: Needed to install software

### 2. Required Software Installation

#### Git
```bash
# macOS (with Homebrew)
brew install git

# Ubuntu/Debian
sudo apt update && sudo apt install git

# Windows
# Download from https://git-scm.com/download/win
```

#### AWS CLI v2
```bash
# macOS
brew install awscli

# Linux x86_64
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Windows
# Download from https://awscli.amazonaws.com/AWSCLIV2.msi
```

#### Node.js (v18+)
```bash
# macOS
brew install node

# Linux (using NodeSource)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Windows
# Download from https://nodejs.org/
```

#### Python 3.9+ and Poetry
```bash
# macOS
brew install python poetry

# Linux
sudo apt install python3 python3-pip
curl -sSL https://install.python-poetry.org | python3 -

# Windows (PowerShell)
(Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -
```

#### Docker and Docker Compose
```bash
# macOS
brew install docker docker-compose

# Linux
sudo apt install docker.io docker-compose-v2
sudo usermod -aG docker $USER  # Add user to docker group
newgrp docker  # Refresh group membership

# Windows
# Install Docker Desktop from https://www.docker.com/products/docker-desktop
```

### 3. Verify Installations
Run these commands to verify everything is installed correctly:

```bash
# Check versions
git --version                    # Should be 2.30+
aws --version                    # Should be aws-cli/2.x
node --version                   # Should be v18+
npm --version                    # Should be 8+
python3 --version               # Should be 3.9+
poetry --version                # Should be 1.4+
docker --version                # Should be 20+
docker compose version          # Should be 2.x
```

## AWS Configuration

### 1. AWS Account Setup
- Ensure you have an AWS account with appropriate permissions
- You need permissions for: S3, CloudFront, Route 53, Certificate Manager, Lightsail

### 2. Configure AWS CLI
```bash
aws configure
```

Enter your credentials:
- **AWS Access Key ID**: Your access key
- **AWS Secret Access Key**: Your secret key  
- **Default region**: `eu-central-1` (or your preferred region)
- **Default output format**: `json`

**Important**: While you can use any region for S3 and other services, SSL certificates for CloudFront must be created in `us-east-1`. The setup script handles this automatically.

### 3. Test AWS Access
```bash
# Test AWS connectivity
aws sts get-caller-identity

# Should return your account info
```

## Project Setup

### 1. Clone Repository
```bash
git clone https://github.com/washimimizuku/conservation-biology-toolkit.git
cd conservation-biology-toolkit
```

### 2. Install Dependencies

#### Backend Dependencies
```bash
# Install root dependencies
poetry install

# Install service dependencies (optional for deployment)
cd services/population-analysis && poetry install && cd ../..
cd services/sampling-survey && poetry install && cd ../..
cd services/genetic-diversity && poetry install && cd ../..
cd services/species-assessment && poetry install && cd ../..
cd services/habitat-landscape && poetry install && cd ../..
cd services/climate-impact && poetry install && cd ../..
cd services/conservation-planning && poetry install && cd ../..
```

#### Frontend Dependencies
```bash
cd frontend
npm install
cd ..
```

### 3. Verify Project Setup
```bash
# Test frontend build
cd frontend
npm run build
cd ..

# Test Docker setup (optional)
docker compose up --build -d
docker compose down
```

## Deployment Configuration

### 1. Domain Registration
If not already done:
```bash
# Register domain in Route 53
# Go to AWS Console > Route 53 > Register domain
# Domain: conservationbiologytools.org
```

### 2. Create Deployment Configuration
```bash
# Copy template
cp .env.deploy.template .env.deploy

# Edit with your values (use nano, vim, or any text editor)
nano .env.deploy
```

Fill in these values in `.env.deploy`:
```bash
# Get these from AWS Console after infrastructure setup
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
LIGHTSAIL_IP=203.0.113.1
AWS_PROFILE=default
SSH_KEY_PATH=~/.ssh/id_rsa
```

### 3. SSH Key Setup (for Lightsail)
```bash
# Generate SSH key if you don't have one
ssh-keygen -t rsa -b 4096 -C "your-email@example.com"

# Add public key to Lightsail instance
# (Done through Lightsail console when creating instance)
```

## Infrastructure Deployment

### 1. Run Infrastructure Setup
```bash
# Make scripts executable
chmod +x setup-aws-infrastructure.sh
chmod +x deploy-aws.sh

# Create AWS infrastructure
./setup-aws-infrastructure.sh
```

This script will:
- Create S3 bucket for frontend
- Request SSL certificate
- Create CloudFront distribution
- Provide configuration values for .env.deploy

### 2. Create Lightsail Instance
```bash
# Via AWS Console (easier) or CLI
aws lightsail create-instances \
    --instance-names conservation-api \
    --availability-zone us-east-1a \
    --blueprint-id ubuntu_22_04 \
    --bundle-id nano_2_0
```

### 3. Configure Lightsail
```bash
# Get static IP
aws lightsail allocate-static-ip --static-ip-name conservation-api-ip
aws lightsail attach-static-ip \
    --static-ip-name conservation-api-ip \
    --instance-name conservation-api

# Get the IP address
aws lightsail get-static-ip --static-ip-name conservation-api-ip
```

### 4. Update DNS Records
In Route 53, create:
- A record: `conservationbiologytools.org` → CloudFront (alias)
- CNAME: `www.conservationbiologytools.org` → `conservationbiologytools.org`
- A record: `api.conservationbiologytools.org` → Lightsail IP

## Application Deployment

### 1. Deploy Backend to Lightsail
```bash
# SSH to Lightsail and setup Docker
ssh ubuntu@YOUR_LIGHTSAIL_IP

# On Lightsail instance:
sudo apt update
sudo apt install docker.io docker-compose-v2
sudo usermod -aG docker ubuntu
exit

# Deploy from local machine
./deploy-aws.sh
```

### 2. Verify Deployment
```bash
# Test endpoints
curl https://conservationbiologytools.org
curl https://api.conservationbiologytools.org/api/population/docs
```

## Troubleshooting Checklist

### Common Issues and Solutions

#### AWS CLI Not Working
```bash
# Check configuration
aws configure list
aws sts get-caller-identity

# Reconfigure if needed
aws configure
```

#### Docker Permission Denied
```bash
# Add user to docker group
sudo usermod -aG docker $USER
newgrp docker

# Or use sudo
sudo docker compose up
```

#### Node.js Build Fails
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### SSH Connection Fails
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa

# Test connection
ssh -v ubuntu@YOUR_LIGHTSAIL_IP
```

#### SSL Certificate Issues
```bash
# Check certificate status
aws acm list-certificates --region us-east-1
aws acm describe-certificate --certificate-arn YOUR_CERT_ARN --region us-east-1
```

## Quick Setup Script

For experienced users, here's a one-liner setup:

```bash
# Install everything (macOS with Homebrew)
brew install git awscli node python poetry docker docker-compose

# Clone and setup
git clone https://github.com/washimimizuku/conservation-biology-toolkit.git
cd conservation-biology-toolkit
poetry install
cd frontend && npm install && cd ..
cp .env.deploy.template .env.deploy

echo "✅ Setup complete! Edit .env.deploy and run ./setup-aws-infrastructure.sh"
```

## Verification Checklist

Before deploying, ensure:

- [ ] All software installed and versions verified
- [ ] AWS CLI configured and tested
- [ ] Repository cloned and dependencies installed
- [ ] Domain registered in Route 53
- [ ] `.env.deploy` configured with actual values
- [ ] SSH key generated and added to Lightsail
- [ ] Infrastructure setup script completed successfully

## Support

If you encounter issues:

1. **Check the logs** in each script for specific error messages
2. **Verify prerequisites** using the verification commands above
3. **Review AWS Console** for resource status
4. **Check documentation** in `docs/AWS_SETUP_GUIDE.md` for detailed steps

The deployment should work on any computer with these prerequisites installed!