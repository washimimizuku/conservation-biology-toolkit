#!/bin/bash

# AWS Infrastructure Setup Script for Conservation Biology Tools
# Creates S3 bucket, CloudFront distribution, and configures DNS

set -e

# Configuration
DOMAIN="conservationbiologytools.org"
BUCKET_NAME="conservationbiologytools-frontend"
REGION="us-east-1"  # Keep simple - same region as SSL cert
CERT_REGION="us-east-1"  # CloudFront requires certificates in us-east-1
PROFILE="default"   # Change if using different AWS profile

echo "🚀 Setting up AWS infrastructure for $DOMAIN..."

# Check if AWS CLI is configured
if ! aws sts get-caller-identity --profile $PROFILE > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# 1. Create S3 bucket for static website hosting
echo "📦 Creating S3 bucket: $BUCKET_NAME"

# Check if bucket already exists
if aws s3api head-bucket --bucket "$BUCKET_NAME" --profile $PROFILE 2>/dev/null; then
    echo "✅ S3 bucket already exists: $BUCKET_NAME"
else
    aws s3 mb s3://$BUCKET_NAME --region $REGION --profile $PROFILE
    echo "✅ Created S3 bucket: $BUCKET_NAME"
fi

# 2. Configure bucket for static website hosting (for direct S3 access if needed)
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html \
    --profile $PROFILE

# Note: We'll use CloudFront Origin Access Control instead of public bucket policy
# This is more secure as S3 bucket remains private, only CloudFront can access it

# 3. Configure CORS for API calls (optional, mainly for direct S3 access)
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

# 4. Create Origin Access Control for CloudFront
echo "🔐 Creating Origin Access Control..."

# Check if OAC already exists
EXISTING_OAC=$(aws cloudfront list-origin-access-controls \
    --profile $PROFILE \
    --query "OriginAccessControlList.Items[?Name=='S3-$BUCKET_NAME-OAC'].Id" \
    --output text 2>/dev/null)

if [ ! -z "$EXISTING_OAC" ]; then
    echo "✅ Using existing Origin Access Control: $EXISTING_OAC"
    OAC_ID="$EXISTING_OAC"
else
    OAC_ID=$(aws cloudfront create-origin-access-control \
        --origin-access-control-config \
            "Name=S3-$BUCKET_NAME-OAC,Description=OAC for $BUCKET_NAME,OriginAccessControlOriginType=s3,SigningBehavior=always,SigningProtocol=sigv4" \
        --profile $PROFILE \
        --query 'OriginAccessControl.Id' \
        --output text)
    
    echo "✅ Created new Origin Access Control: $OAC_ID"
fi

# 5. Request SSL certificate (if not exists)
echo "🔒 Checking for SSL certificate..."
CERT_ARN=$(aws acm list-certificates \
    --region $CERT_REGION \
    --profile $PROFILE \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
    --output text)

if [ -z "$CERT_ARN" ]; then
    echo "📜 Requesting SSL certificate for $DOMAIN and *.$DOMAIN..."
    echo "⚠️  Note: CloudFront requires SSL certificates in us-east-1 region"
    CERT_ARN=$(aws acm request-certificate \
        --domain-name $DOMAIN \
        --subject-alternative-names "*.$DOMAIN" \
        --validation-method DNS \
        --region $CERT_REGION \
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
                "DomainName": "$BUCKET_NAME.s3.$REGION.amazonaws.com",
                "S3OriginConfig": {
                    "OriginAccessIdentity": ""
                },
                "OriginAccessControlId": "$OAC_ID"
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
    # Check certificate status
    CERT_STATUS=$(aws acm describe-certificate \
        --certificate-arn "$CERT_ARN" \
        --region $CERT_REGION \
        --profile $PROFILE \
        --query 'Certificate.Status' \
        --output text 2>/dev/null)
    
    if [ "$CERT_STATUS" != "ISSUED" ]; then
        echo "⚠️  Certificate status: $CERT_STATUS"
        echo "📋 Please validate the certificate in Route 53 before creating CloudFront"
        echo "   Go to Certificate Manager → Click certificate → Create records in Route 53"
        echo "   Then re-run this script once certificate shows 'ISSUED' status"
    else
        echo "✅ Certificate validated, creating CloudFront distribution..."
        
        # Check if CloudFront distribution already exists
        EXISTING_DIST=$(aws cloudfront list-distributions \
            --profile $PROFILE \
            --query "DistributionList.Items[?Comment=='Conservation Biology Tools Frontend'].Id" \
            --output text 2>/dev/null)
        
        if [ ! -z "$EXISTING_DIST" ]; then
            echo "✅ Using existing CloudFront distribution: $EXISTING_DIST"
            DISTRIBUTION_ID="$EXISTING_DIST"
        else
            DISTRIBUTION_ID=$(aws cloudfront create-distribution \
                --distribution-config file://cloudfront-config.json \
                --profile $PROFILE \
                --query 'Distribution.Id' \
                --output text)
            
            echo "✅ Created new CloudFront distribution: $DISTRIBUTION_ID"
        fi
        
        # Get CloudFront domain name
        CF_DOMAIN=$(aws cloudfront get-distribution \
            --id $DISTRIBUTION_ID \
            --profile $PROFILE \
            --query 'Distribution.DomainName' \
            --output text)
        
        echo "🌍 CloudFront domain: $CF_DOMAIN"
        
        # Create bucket policy to allow CloudFront OAC access
        echo "🔐 Setting up S3 bucket policy for CloudFront OAC..."
        cat > bucket-policy.json << EOF
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Sid": "AllowCloudFrontServicePrincipal",
            "Effect": "Allow",
            "Principal": {
                "Service": "cloudfront.amazonaws.com"
            },
            "Action": "s3:GetObject",
            "Resource": "arn:aws:s3:::$BUCKET_NAME/*",
            "Condition": {
                "StringEquals": {
                    "AWS:SourceArn": "arn:aws:cloudfront::$(aws sts get-caller-identity --query Account --output text --profile $PROFILE):distribution/$DISTRIBUTION_ID"
                }
            }
        }
    ]
}
EOF
        
        aws s3api put-bucket-policy \
            --bucket $BUCKET_NAME \
            --policy file://bucket-policy.json \
            --profile $PROFILE
        
        echo "✅ S3 bucket policy configured for CloudFront access"
    fi
else
    echo "⚠️  Skipping CloudFront creation - validate SSL certificate first"
fi

# 7. Clean up temporary files
rm -f bucket-policy.json cors-config.json cloudfront-config.json

# 8. Output summary
echo ""
echo "✅ AWS Infrastructure Setup Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📦 S3 Bucket: $BUCKET_NAME (Region: $REGION)"
echo "🌐 Website URL: http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"
if [ ! -z "$CERT_ARN" ]; then
    echo "🔒 SSL Certificate: $CERT_ARN (Region: $CERT_REGION)"
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
echo "⚠️  Important Notes:"
echo "- S3 bucket is in $REGION region"
echo "- SSL certificate must be in us-east-1 for CloudFront"
echo "- DNS propagation may take up to 48 hours"
echo ""