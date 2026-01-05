#!/bin/bash

# Setup IAM role for Lightsail ECR access
# Run this from your local machine

set -e

echo "🔐 Setting up IAM Role for Lightsail ECR Access"
echo "=============================================="

ROLE_NAME="LightsailECRAccess"
POLICY_NAME="ECRReadOnlyPolicy"
INSTANCE_PROFILE_NAME="LightsailECRProfile"

# Step 1: Create trust policy for EC2 (Lightsail uses EC2 under the hood)
echo "📝 Creating trust policy..."
cat > trust-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "Service": "ec2.amazonaws.com"
            },
            "Action": "sts:AssumeRole"
        }
    ]
}
EOF

# Step 2: Create ECR access policy
echo "📝 Creating ECR access policy..."
cat > ecr-policy.json << 'EOF'
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "ecr:GetAuthorizationToken",
                "ecr:BatchCheckLayerAvailability",
                "ecr:GetDownloadUrlForLayer",
                "ecr:BatchGetImage"
            ],
            "Resource": "*"
        }
    ]
}
EOF

# Step 3: Create IAM role
echo "🔑 Creating IAM role..."
aws iam create-role \
    --role-name $ROLE_NAME \
    --assume-role-policy-document file://trust-policy.json \
    --description "Role for Lightsail to access ECR repositories" || echo "Role may already exist"

# Step 4: Create and attach policy
echo "📋 Creating and attaching ECR policy..."
aws iam put-role-policy \
    --role-name $ROLE_NAME \
    --policy-name $POLICY_NAME \
    --policy-document file://ecr-policy.json

# Step 5: Create instance profile
echo "👤 Creating instance profile..."
aws iam create-instance-profile \
    --instance-profile-name $INSTANCE_PROFILE_NAME || echo "Instance profile may already exist"

# Step 6: Add role to instance profile
echo "🔗 Adding role to instance profile..."
aws iam add-role-to-instance-profile \
    --instance-profile-name $INSTANCE_PROFILE_NAME \
    --role-name $ROLE_NAME || echo "Role may already be added"

# Wait for IAM propagation
echo "⏳ Waiting for IAM propagation..."
sleep 10

# Cleanup temporary files
rm -f trust-policy.json ecr-policy.json

echo ""
echo "✅ IAM Role Setup Complete!"
echo "=========================="
echo ""
echo "📋 Created Resources:"
echo "  - IAM Role: $ROLE_NAME"
echo "  - IAM Policy: $POLICY_NAME"
echo "  - Instance Profile: $INSTANCE_PROFILE_NAME"
echo ""
echo "🔧 Next Steps:"
echo "1. Go to AWS Lightsail Console"
echo "2. Select your instance"
echo "3. Go to 'Networking' tab"
echo "4. Click 'Attach IAM role'"
echo "5. Select: $INSTANCE_PROFILE_NAME"
echo "6. Click 'Attach'"
echo ""
echo "🌐 Lightsail Console: https://lightsail.aws.amazon.com/ls/webapp/home/instances"
echo ""
echo "⚠️  After attaching the role, restart your Lightsail instance for changes to take effect"