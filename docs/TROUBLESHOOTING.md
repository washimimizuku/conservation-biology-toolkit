# Troubleshooting Guide

Common issues and solutions for deploying the Conservation Biology Toolkit.

## S3 Access Issues

**Modern Approach**: The setup script now uses **Origin Access Control (OAC)** instead of public bucket policies. This is more secure:

- ✅ S3 bucket remains private
- ✅ Only CloudFront can access the bucket
- ✅ No need to disable Block Public Access
- ✅ Follows AWS security best practices

**If you see S3 access errors**: The script automatically configures OAC and the appropriate bucket policy.

## SSL Certificate Validation Issues

**Error**: Certificate stuck in "Pending validation" status

**Solution**:
1. Go to Certificate Manager in AWS Console (**us-east-1 region** - important!)
2. Click on your certificate
3. Click "Create records in Route 53"
4. Wait 5-10 minutes for DNS validation

**Important**: CloudFront requires SSL certificates to be in the `us-east-1` region, regardless of where your other resources are located.

## Region Configuration

**Multi-Region Setup**:
- **S3 Bucket**: Can be in any region (e.g., `eu-central-1`)
- **SSL Certificate**: Must be in `us-east-1` for CloudFront
- **CloudFront**: Global service, uses `us-east-1` certificates
- **Route 53**: Global service
- **Lightsail**: Can be in any region (recommend same as S3 for lower latency)

The setup script automatically handles the region requirements.

## CloudFront Distribution Creation Fails

**Error**: Invalid certificate or domain configuration

**Solution**:
1. Ensure SSL certificate is validated first
2. Verify domain is registered in Route 53
3. Check certificate is in us-east-1 region (required for CloudFront)

## Lightsail SSH Connection Issues

**Error**: Permission denied (publickey)

**Solutions**:
```bash
# Check SSH key permissions
chmod 600 ~/.ssh/id_rsa

# Test connection with verbose output
ssh -v ubuntu@YOUR_LIGHTSAIL_IP

# Use Lightsail browser-based SSH as alternative
# Go to Lightsail Console → Instance → Connect using SSH
```

## DNS Not Resolving

**Issue**: Domain doesn't load after setup

**Solutions**:
1. **Check DNS propagation**: Use `dig conservationbiologytools.org` or online DNS checkers
2. **Verify CloudFront status**: Should be "Deployed" in AWS Console
3. **Wait for propagation**: DNS changes can take up to 48 hours
4. **Clear browser cache**: Try incognito/private browsing

## Docker Issues on Lightsail

**Error**: Permission denied when running docker commands

**Solution**:
```bash
# Add user to docker group
sudo usermod -aG docker ubuntu

# Log out and back in, or run:
newgrp docker

# Test docker access
docker --version
```

## Deployment Script Fails

**Error**: CLOUDFRONT_DISTRIBUTION_ID or LIGHTSAIL_IP not set

**Solution**:
```bash
# Check .env.deploy file exists and has correct values
cat .env.deploy

# If missing, copy template and edit:
cp .env.deploy.template .env.deploy
nano .env.deploy
```

## Getting Help

If you encounter other issues:
1. Run `./check-prerequisites.sh` to verify setup
2. Check AWS Console for resource status
3. Review error messages carefully
4. Consult the detailed guides in the docs/ folder