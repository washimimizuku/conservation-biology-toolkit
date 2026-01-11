#!/bin/bash

# Step 1: Setup Frontend Infrastructure (S3 + CloudFront + SSL)
# Replicates deployment/scripts/setup-aws-infrastructure.sh

set -e

DOMAIN="conservationbiologytools.org"
BUCKET_NAME="conservationbiologytools-frontend"
REGION="us-east-1"
CERT_REGION="us-east-1"
PROFILE="default"

echo "🚀 Step 1: Setting up Frontend Infrastructure"
echo "============================================="

# Check AWS CLI
if ! aws sts get-caller-identity --profile $PROFILE > /dev/null 2>&1; then
    echo "❌ AWS CLI not configured. Run 'aws configure' first."
    exit 1
fi

# Create S3 bucket
echo "📦 Creating S3 bucket: $BUCKET_NAME"
if aws s3api head-bucket --bucket "$BUCKET_NAME" --profile $PROFILE 2>/dev/null; then
    echo "✅ S3 bucket already exists: $BUCKET_NAME"
else
    aws s3 mb s3://$BUCKET_NAME --region $REGION --profile $PROFILE
    echo "✅ Created S3 bucket: $BUCKET_NAME"
fi

# Configure static website hosting
echo "🌐 Configuring static website hosting..."
aws s3 website s3://$BUCKET_NAME \
    --index-document index.html \
    --error-document index.html \
    --profile $PROFILE

# Configure CORS
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

# Create Origin Access Control
echo "🔐 Creating Origin Access Control..."
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

# Request SSL certificate
echo "🔒 Checking for SSL certificate..."
CERT_ARN=$(aws acm list-certificates \
    --region $CERT_REGION \
    --profile $PROFILE \
    --query "CertificateSummaryList[?DomainName=='$DOMAIN'].CertificateArn" \
    --output text)

if [ -z "$CERT_ARN" ]; then
    echo "📜 Requesting SSL certificate for $DOMAIN and *.$DOMAIN..."
    CERT_ARN=$(aws acm request-certificate \
        --domain-name $DOMAIN \
        --subject-alternative-names "*.$DOMAIN" \
        --validation-method DNS \
        --region $CERT_REGION \
        --profile $PROFILE \
        --query 'CertificateArn' \
        --output text)
    echo "⏳ Certificate requested: $CERT_ARN"
    echo "📋 Please validate the certificate in Route 53 DNS before proceeding"
else
    echo "✅ SSL certificate already exists: $CERT_ARN"
fi

# Create CloudFront distribution
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
        "Quantity": 2,
        "Items": [
            {
                "ErrorCode": 404,
                "ResponsePagePath": "/index.html",
                "ResponseCode": "200",
                "ErrorCachingMinTTL": 300
            },
            {
                "ErrorCode": 403,
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

# Check certificate status and create CloudFront
CERT_STATUS=$(aws acm describe-certificate \
    --certificate-arn "$CERT_ARN" \
    --region $CERT_REGION \
    --profile $PROFILE \
    --query 'Certificate.Status' \
    --output text 2>/dev/null)

if [ "$CERT_STATUS" != "ISSUED" ]; then
    echo "⚠️  Certificate status: $CERT_STATUS"
    echo "📋 Please validate the certificate in Route 53 before creating CloudFront"
else
    echo "✅ Certificate validated, creating CloudFront distribution..."
    
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
    
    # Create bucket policy
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
fi

# Clean up
rm -f bucket-policy.json cors-config.json cloudfront-config.json

echo ""
echo "✅ Step 1 Complete: Frontend Infrastructure Ready"
echo "📋 Next: Run ./02-create-ecr-repositories.sh"