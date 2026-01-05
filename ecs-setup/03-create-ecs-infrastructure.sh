#!/bin/bash

# Create ECS infrastructure: VPC, subnets, security groups, cluster, ALB
# Run after pushing images to ECR

set -e

echo "🏗️ Creating ECS Infrastructure for Conservation Biology Toolkit"
echo "=============================================================="

REGION="us-east-1"
CLUSTER_NAME="conservation-biology-cluster"
VPC_NAME="conservation-vpc"

echo "📍 Region: $REGION"
echo "🏗️ Cluster: $CLUSTER_NAME"
echo ""

# Create ECS Cluster
echo "🎯 Creating ECS Cluster..."
if aws ecs describe-clusters --clusters $CLUSTER_NAME --region $REGION >/dev/null 2>&1; then
    echo "✅ ECS Cluster $CLUSTER_NAME already exists"
else
    aws ecs create-cluster \
        --cluster-name $CLUSTER_NAME \
        --capacity-providers FARGATE \
        --default-capacity-provider-strategy capacityProvider=FARGATE,weight=1 \
        --region $REGION >/dev/null
    echo "✅ Created ECS Cluster: $CLUSTER_NAME"
fi

# Create VPC
echo ""
echo "🌐 Creating VPC and networking..."
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications "ResourceType=vpc,Tags=[{Key=Name,Value=$VPC_NAME}]" \
    --query 'Vpc.VpcId' \
    --output text)
echo "✅ Created VPC: $VPC_ID"

# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications "ResourceType=internet-gateway,Tags=[{Key=Name,Value=$VPC_NAME-igw}]" \
    --query 'InternetGateway.InternetGatewayId' \
    --output text)
aws ec2 attach-internet-gateway --vpc-id $VPC_ID --internet-gateway-id $IGW_ID
echo "✅ Created Internet Gateway: $IGW_ID"

# Create Subnets in different AZs
SUBNET1_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-subnet-1a}]" \
    --query 'Subnet.SubnetId' \
    --output text)

SUBNET2_ID=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications "ResourceType=subnet,Tags=[{Key=Name,Value=$VPC_NAME-subnet-1b}]" \
    --query 'Subnet.SubnetId' \
    --output text)

echo "✅ Created Subnets: $SUBNET1_ID, $SUBNET2_ID"

# Create Route Table
ROUTE_TABLE_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=route-table,Tags=[{Key=Name,Value=$VPC_NAME-rt}]" \
    --query 'RouteTable.RouteTableId' \
    --output text)

aws ec2 create-route \
    --route-table-id $ROUTE_TABLE_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID >/dev/null

aws ec2 associate-route-table --subnet-id $SUBNET1_ID --route-table-id $ROUTE_TABLE_ID >/dev/null
aws ec2 associate-route-table --subnet-id $SUBNET2_ID --route-table-id $ROUTE_TABLE_ID >/dev/null

# Enable auto-assign public IP
aws ec2 modify-subnet-attribute --subnet-id $SUBNET1_ID --map-public-ip-on-launch
aws ec2 modify-subnet-attribute --subnet-id $SUBNET2_ID --map-public-ip-on-launch

echo "✅ Configured routing and public IP assignment"

# Create Security Group
SG_ID=$(aws ec2 create-security-group \
    --group-name conservation-ecs-sg \
    --description "Security group for Conservation Biology ECS services" \
    --vpc-id $VPC_ID \
    --tag-specifications "ResourceType=security-group,Tags=[{Key=Name,Value=conservation-ecs-sg}]" \
    --query 'GroupId' \
    --output text)

# Allow HTTP traffic
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0 >/dev/null

# Allow HTTPS traffic
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0 >/dev/null

# Allow API ports
aws ec2 authorize-security-group-ingress \
    --group-id $SG_ID \
    --protocol tcp \
    --port 8000-8008 \
    --cidr 10.0.0.0/16 >/dev/null

echo "✅ Created Security Group: $SG_ID"

# Create Application Load Balancer
echo ""
echo "⚖️ Creating Application Load Balancer..."
ALB_ARN=$(aws elbv2 create-load-balancer \
    --name conservation-alb \
    --subnets $SUBNET1_ID $SUBNET2_ID \
    --security-groups $SG_ID \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --tags Key=Name,Value=conservation-alb \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

# Get ALB DNS name
ALB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $ALB_ARN \
    --query 'LoadBalancers[0].DNSName' \
    --output text)

echo "✅ Created Application Load Balancer"
echo "🌐 ALB DNS: $ALB_DNS"

# Create IAM role for ECS tasks (if it doesn't exist)
echo ""
echo "🔐 Setting up IAM roles..."
if ! aws iam get-role --role-name ecsTaskExecutionRole >/dev/null 2>&1; then
    # Create trust policy
    cat > trust-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Service": "ecs-tasks.amazonaws.com"
      },
      "Action": "sts:AssumeRole"
    }
  ]
}
EOF

    # Create role
    aws iam create-role \
        --role-name ecsTaskExecutionRole \
        --assume-role-policy-document file://trust-policy.json >/dev/null

    # Attach policy
    aws iam attach-role-policy \
        --role-name ecsTaskExecutionRole \
        --policy-arn arn:aws:iam::aws:policy/service-role/AmazonECSTaskExecutionRolePolicy >/dev/null

    rm trust-policy.json
    echo "✅ Created ECS Task Execution Role"
else
    echo "✅ ECS Task Execution Role already exists"
fi

# Save configuration for next scripts
cat > ecs-config.env << EOF
# ECS Infrastructure Configuration
# Generated by 03-create-ecs-infrastructure.sh

REGION=$REGION
CLUSTER_NAME=$CLUSTER_NAME
VPC_ID=$VPC_ID
SUBNET1_ID=$SUBNET1_ID
SUBNET2_ID=$SUBNET2_ID
SG_ID=$SG_ID
ALB_ARN=$ALB_ARN
ALB_DNS=$ALB_DNS
ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY=$(aws sts get-caller-identity --query Account --output text).dkr.ecr.$REGION.amazonaws.com
EOF

echo ""
echo "✅ ECS Infrastructure created successfully!"
echo "📋 Configuration saved to: ecs-config.env"
echo ""
echo "📊 Infrastructure Summary:"
echo "  - ECS Cluster: $CLUSTER_NAME"
echo "  - VPC: $VPC_ID"
echo "  - Subnets: $SUBNET1_ID, $SUBNET2_ID"
echo "  - Security Group: $SG_ID"
echo "  - Load Balancer: $ALB_DNS"
echo ""
echo "📋 Next step: Run ./04-create-task-definitions.sh"