#!/bin/bash

# AWS Infrastructure Setup Script for Conservation Biology Tools
# Creates S3 bucket, CloudFront distribution, and configures DNS

set -e

# Configuration
DOMAIN="conservationbiologytools.org"
BUCKET_NAME="conservationbiologytools-frontend"
REGION="us-east-1"  # Required for CloudFront
PROFILE="default"   # Change if using different AWS profile

echo "🚀 Setting up AWS infrastructure for $DOMAIN..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile $PROFILE > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# 1. Create S3 bucket for static website hosting
echo "📦 Creating S3 bucket: $BUCKET_NAME"
aws s3 mb s3://$BUCKET_NAME --region $REGION --profile $PROFILE

# 2. Configure bucket for static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html \
    --profile $PROFILE

# 3. Create bucket policy for public read access
echo "🔓 Setting bucket policy for public access..."
cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "PublicReadGetObject",
            "Effect": "Allow",
            "Principal": "*",
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*"
        }
    ]
}
EOF

aws s3api put-bucket-policy \
    --bucket $BUCKET_NAME \
    --policy file://bucket-policy.json \
    --profile $PROFILE

# 4. Configure CORS for API calls
echo "🔄 Configuring CORS..."
cat > cors-config.json << EOF
{
    "CORSRules": [
        {
            "AllowedHeaders": ["*"],
            "AllowedMethods": ["GET", "POST", "PUT", "DELETE", "HEAD"],
            "AllowedOrigins": ["https://$DOMAIN", "https://api.$DOMAIN"],
            "ExposeHeaders": ["ETag"],
            "MaxAgeSeconds": 3000
        }
    ]
}
EOF

aws s3api put-bucket-cors \
    --bucket $BUCKET_NAME \
    --cors-configuration file://cors-config.json \
    --profile $PROFILE

# 5. Request SSL certificate (if not exists)
echo "🔒 Checking for SSL certificate..."
CERT_ARN=$(aws acm list-certificates \
    --region $REGION \
    --profile $PROFILE \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
    --output text)

if [ -z "$CERT_ARN" ]; then
    echo "📜 Requesting SSL certificate for $DOMAIN and *.$DOMAIN..."
    CERT_ARN=$(aws acm request-certificate \
        --domain-name $DOMAIN \
        --subject-alternative-names "*.$DOMAIN" \
        --validation-method DNS \
        --region $REGION \
        --profile $PROFILE \
        --query 'CertificateArn' \
        --output text)
    
    echo "⏳ Certificate requested: $CERT_ARN"
    echo "📋 Please validate the certificate in Route 53 DNS before proceeding with CloudFront"
else
    echo "✅ SSL certificate already exists: $CERT_ARN"
fi

# 6. Create CloudFront distribution
echo "☁️ Creating CloudFront distribution..."
cat > cloudfront-config.json << EOF
{
    "CallerReference": "$(date +%s)",
    "Aliases": {
        "Quantity": 2,
        "Items": ["$DOMAIN", "www.$DOMAIN"]
    },
    "DefaultRootObject": "index.html",
    "Comment": "Conservation Biology Tools Frontend",
    "Enabled": true,
    "Origins": {
        "Quantity": 1,
        "Items": [
            {
                "Id": "S3-$BUCKET_NAME",
                "DomainName": "$BUCKET_NAME.s3-website-$REGION.amazonaws.com",
                "CustomOriginConfig": {
                    "HTTPPort": 80,
                    "HTTPSPort": 443,
                    "OriginProtocolPolicy": "http-only"
                }
            }
        ]
    },
    "DefaultCacheBehavior": {
        "TargetOriginId": "S3-$BUCKET_NAME",
        "ViewerProtocolPolicy": "redirect-to-https",
        "TrustedSigners": {
            "Enabled": false,
            "Quantity": 0
        },
        "ForwardedValues": {
            "QueryString": false,
            "Cookies": {
                "Forward": "none"
            }
        },
        "MinTTL": 0,
        "DefaultTTL": 86400,
        "MaxTTL": 31536000,
        "Compress": true
    },
    "CustomErrorResponses": {
        "Quantity": 1,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            }
        ]
    },
    "PriceClass": "PriceClass_100",
    "ViewerCertificate": {
        "ACMCertificateArn": "$CERT_ARN",
        "SSLSupportMethod": "sni-only",
        "MinimumProtocolVersion": "TLSv1.2_2021"
    }
}
EOF

# Only create CloudFront if certificate is validated
if [ ! -z "$CERT_ARN" ]; then
    DISTRIBUTION_ID=$(aws cloudfront create-distribution \
        --distribution-config file://cloudfront-config.json \
        --profile $PROFILE \
        --query 'Distribution.Id' \
        --output text)
    
    echo "✅ CloudFront distribution created: $DISTRIBUTION_ID"
    
    # Get CloudFront domain name
    CF_DOMAIN=$(aws cloudfront get-distribution \
        --id $DISTRIBUTION_ID \
        --profile $PROFILE \
        --query 'Distribution.DomainName' \
        --output text)
    
    echo "🌍 CloudFront domain: $CF_DOMAIN"
else
    echo "⚠️  Skipping CloudFront creation - validate SSL certificate first"
fi

# 7. Clean up temporary files
rm -f bucket-policy.json cors-config.json cloudfront-config.json

# 8. Output summary
echo ""
echo "✅ AWS Infrastructure Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 S3 Bucket: $BUCKET_NAME"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
if [ ! -z "$CERT_ARN" ]; then
    echo "🔒 SSL Certificate: $CERT_ARN"
fi
if [ ! -z "$DISTRIBUTION_ID" ]; then
    echo "☁️ CloudFront Distribution: $DISTRIBUTION_ID"
    echo "🌍 CloudFront Domain: $CF_DOMAIN"
fi
echo ""
echo "📋 Next Steps:"
echo "1. Validate SSL certificate in Route 53 (if not done)"
echo "2. Create DNS records in Route 53:"
echo "   - A record: $DOMAIN → $CF_DOMAIN (alias)"
echo "   - CNAME: www.$DOMAIN → $DOMAIN"
echo "3. Deploy your React app: npm run build && aws s3 sync build/ s3://$BUCKET_NAME"
echo "4. Set up Lightsail instance for API backend"
echo ""