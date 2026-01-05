# AWS Setup Guide for Conservation Biology Tools

This guide covers setting up the complete AWS infrastructure for your conservation biology toolkit.

## Prerequisites

- AWS account with appropriate permissions
- Domain registered in Route 53: `conservationbiologytools.org`
- AWS CLI configured (for automated setup)

## Option 1: Automated Setup (Recommended)

Run the automated setup script:

```bash
./setup-aws-infrastructure.sh
```

This script will:
- Create S3 bucket with static website hosting
- Configure bucket policies and CORS
- Request SSL certificate
- Create CloudFront distribution
- Provide next steps for DNS configuration

## Option 2: Manual Setup via AWS Console

### Step 1: Create S3 Bucket

1. **Go to S3 Console**
   - Navigate to AWS S3 service
   - Click "Create bucket"

2. **Bucket Configuration**
   - **Bucket name**: `conservationbiologytools-frontend`
   - **Region**: `us-east-1` (required for CloudFront)
   - **Block Public Access**: Uncheck "Block all public access"
   - **Acknowledge**: Check the warning box
   - Click "Create bucket"

3. **Enable Static Website Hosting**
   - Select your bucket
   - Go to "Properties" tab
   - Scroll to "Static website hosting"
   - Click "Edit"
   - **Enable**: Static website hosting
   - **Index document**: `index.html`
   - **Error document**: `index.html` (for React Router)
   - Click "Save changes"

4. **Set Bucket Policy**
   - Go to "Permissions" tab
   - Click "Bucket policy" → "Edit"
   - Paste this policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::conservationbiologytools-frontend/*"
        }
    ]
}
```

5. **Configure CORS**
   - Still in "Permissions" tab
   - Click "Cross-origin resource sharing (CORS)" → "Edit"
   - Paste this configuration:

```json
[
    {
        "AllowedHeaders": ["*"],
        "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
        "AllowedOrigins": [
            "https://conservationbiologytools.org",
            "https://api.conservationbiologytools.org"
        ],
        "ExposeHeaders": ["ETag"],
        "MaxAgeSeconds": 3000
    }
]
```

### Step 2: Request SSL Certificate

1. **Go to Certificate Manager**
   - Navigate to AWS Certificate Manager
   - Ensure you're in `us-east-1` region (required for CloudFront)
   - Click "Request certificate"

2. **Certificate Configuration**
   - **Certificate type**: Request a public certificate
   - **Domain names**: 
     - `conservationbiologytools.org`
     - `*.conservationbiologytools.org` (wildcard for subdomains)
   - **Validation method**: DNS validation
   - Click "Request"

3. **DNS Validation**
   - Click on your certificate
   - Click "Create records in Route 53" (if domain is in Route 53)
   - Wait for validation (usually 5-10 minutes)

### Step 3: Create CloudFront Distribution

1. **Go to CloudFront Console**
   - Navigate to AWS CloudFront
   - Click "Create distribution"

2. **Origin Configuration**
   - **Origin domain**: Select your S3 bucket website endpoint
     - Format: `conservationbiologytools-frontend.s3-website-us-east-1.amazonaws.com`
   - **Protocol**: HTTP only (S3 website endpoints don't support HTTPS)

3. **Default Cache Behavior**
   - **Viewer protocol policy**: Redirect HTTP to HTTPS
   - **Allowed HTTP methods**: GET, HEAD, OPTIONS, PUT, POST, PATCH, DELETE
   - **Cache policy**: Managed-CachingOptimized
   - **Origin request policy**: Managed-CORS-S3Origin

4. **Distribution Settings**
   - **Alternate domain names (CNAMEs)**:
     - `conservationbiologytools.org`
     - `www.conservationbiologytools.org`
   - **Custom SSL certificate**: Select your validated certificate
   - **Security policy**: TLSv1.2_2021
   - **Default root object**: `index.html`

5. **Custom Error Pages**
   - Click "Create custom error response"
   - **HTTP error code**: 404
   - **Error response page path**: `/index.html`
   - **HTTP response code**: 200
   - **Error caching minimum TTL**: 300

6. **Create Distribution**
   - Click "Create distribution"
   - Wait for deployment (15-20 minutes)

### Step 4: Configure Route 53 DNS

1. **Go to Route 53 Console**
   - Navigate to Route 53 → Hosted zones
   - Click on `conservationbiologytools.org`

2. **Create DNS Records**
   - **Main domain record**:
     - Type: A
     - Name: (leave blank for root domain)
     - Alias: Yes
     - Route traffic to: CloudFront distribution
     - Select your distribution

   - **WWW subdomain**:
     - Type: CNAME
     - Name: www
     - Value: conservationbiologytools.org

   - **API subdomain** (for later Lightsail setup):
     - Type: A
     - Name: api
     - Value: [Lightsail static IP - add after creating instance]

### Step 5: Test S3 Setup

1. **Upload Test File**
   ```bash
   echo "<h1>Test</h1>" > test.html
   aws s3 cp test.html s3://conservationbiologytools-frontend/
   ```

2. **Test URLs**
   - S3 direct: `http://conservationbiologytools-frontend.s3-website-us-east-1.amazonaws.com`
   - CloudFront: `https://[distribution-id].cloudfront.net`
   - Custom domain: `https://conservationbiologytools.org` (after DNS propagation)

## Step 6: Deploy React Application

Once infrastructure is ready:

```bash
# Build React app
cd frontend
npm run build

# Deploy to S3
aws s3 sync build/ s3://conservationbiologytools-frontend --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
    --distribution-id [YOUR-DISTRIBUTION-ID] \
    --paths "/*"
```

## Cost Breakdown

| Service | Monthly Cost |
|---------|-------------|
| S3 Storage (1GB) | $0.50 |
| CloudFront (1TB transfer) | $1.50 |
| Route 53 DNS | $0.50 |
| Domain registration | $1.00 ($12/year) |
| **Total** | **$3.50/month** |

## Troubleshooting

### Common Issues

1. **403 Forbidden Error**
   - Check bucket policy allows public read
   - Verify bucket name in policy matches actual bucket

2. **CloudFront 502/504 Errors**
   - Ensure S3 website endpoint is used (not REST endpoint)
   - Check origin protocol is HTTP only

3. **SSL Certificate Issues**
   - Certificate must be in us-east-1 for CloudFront
   - Ensure DNS validation is complete

4. **DNS Not Resolving**
   - DNS propagation can take up to 48 hours
   - Use `dig` or `nslookup` to check propagation

### Useful Commands

```bash
# Check certificate status
aws acm describe-certificate --certificate-arn [ARN] --region us-east-1

# List CloudFront distributions
aws cloudfront list-distributions --query 'DistributionList.Items[*].[Id,DomainName,Status]'

# Check S3 bucket website configuration
aws s3api get-bucket-website --bucket conservationbiologytools-frontend

# Test DNS resolution
dig conservationbiologytools.org
nslookup conservationbiologytools.org
```

## Next Steps

After completing the S3 + CloudFront setup:

1. **Set up Lightsail instance** for backend APIs
2. **Configure Nginx** reverse proxy on Lightsail
3. **Deploy FastAPI services** using Docker Compose
4. **Update DNS** to point api.conservationbiologytools.org to Lightsail
5. **Test end-to-end** functionality

Your frontend will be globally distributed via CloudFront while your backend APIs run efficiently on Lightsail!