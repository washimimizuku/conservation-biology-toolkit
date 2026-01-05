# Deployment Setup Guide

This guide explains how to configure your deployment environment securely.

## Security Best Practices

**Never commit sensitive values to Git!** This includes:
- CloudFront Distribution IDs
- Server IP addresses  
- AWS credentials
- SSH keys
- Database passwords

## Configuration Methods

### Method 1: Environment Variables (Recommended for CI/CD)

Set environment variables in your shell or CI/CD system:

```bash
export CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
export LIGHTSAIL_IP="203.0.113.1"
export AWS_PROFILE="default"
```

### Method 2: Local Configuration File (Recommended for Development)

1. **Copy the template:**
   ```bash
   cp .env.deploy.template .env.deploy
   ```

2. **Edit `.env.deploy` with your actual values:**
   ```bash
   # AWS Deployment Configuration
   CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
   LIGHTSAIL_IP=203.0.113.1
   AWS_PROFILE=default
   SSH_KEY_PATH=~/.ssh/id_rsa
   ```

3. **The `.env.deploy` file is automatically gitignored** - it will never be committed.

## Getting Your Configuration Values

### CloudFront Distribution ID

**Via AWS Console:**
1. Go to CloudFront console
2. Find your distribution
3. Copy the ID (format: E1234567890ABC)

**Via AWS CLI:**
```bash
aws cloudfront list-distributions \
    --query 'DistributionList.Items[*].[Id,Comment]' \
    --output table
```

### Lightsail Static IP

**Via Lightsail Console:**
1. Go to Lightsail console
2. Click on your instance
3. Go to "Networking" tab
4. Note the static IP address

**Via AWS CLI:**
```bash
aws lightsail get-static-ips \
    --query 'staticIps[*].[name,ipAddress]' \
    --output table
```

## Deployment Usage

Once configured, deploy with:

```bash
# Using environment variables
export CLOUDFRONT_DISTRIBUTION_ID="E1234567890ABC"
export LIGHTSAIL_IP="203.0.113.1"
./deploy-aws.sh

# Or using .env.deploy file (automatically loaded)
./deploy-aws.sh
```

## CI/CD Configuration

### GitHub Actions Example

```yaml
name: Deploy to AWS
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1
      
      - name: Deploy
        env:
          CLOUDFRONT_DISTRIBUTION_ID: ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }}
          LIGHTSAIL_IP: ${{ secrets.LIGHTSAIL_IP }}
        run: ./deploy-aws.sh
```

### Required GitHub Secrets

Add these to your repository secrets (Settings → Secrets and variables → Actions):

- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY` 
- `CLOUDFRONT_DISTRIBUTION_ID`
- `LIGHTSAIL_IP`

## Troubleshooting

### Error: "CLOUDFRONT_DISTRIBUTION_ID not set"

**Solution:** Set the environment variable or create `.env.deploy` file:
```bash
cp .env.deploy.template .env.deploy
# Edit .env.deploy with your values
```

### Error: "LIGHTSAIL_IP not set"

**Solution:** Get your Lightsail static IP and set it:
```bash
aws lightsail get-static-ips
# Add IP to .env.deploy or export as environment variable
```

### Error: "Permission denied (publickey)"

**Solution:** Check SSH key configuration:
```bash
# Test SSH connection
ssh -i ~/.ssh/id_rsa ubuntu@YOUR_LIGHTSAIL_IP

# If fails, check key permissions
chmod 600 ~/.ssh/id_rsa
```

## Security Checklist

- [ ] `.env.deploy` is in `.gitignore`
- [ ] No sensitive values in committed files
- [ ] Environment variables used for secrets
- [ ] SSH keys have proper permissions (600)
- [ ] AWS credentials configured securely
- [ ] Repository secrets configured for CI/CD

## File Structure

```
project/
├── .env.deploy.template    # Template (committed)
├── .env.deploy            # Your config (gitignored)
├── deploy-aws.sh          # Deployment script
└── .gitignore            # Includes .env.deploy
```

This approach keeps your repository secure while making deployment easy and reproducible!