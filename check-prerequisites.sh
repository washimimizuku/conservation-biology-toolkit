#!/bin/bash

# Prerequisites Check Script for Conservation Biology Toolkit
# Run this on any new computer to verify deployment readiness

echo "🔍 Checking Prerequisites for Conservation Biology Toolkit Deployment"
echo "=================================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track overall status
ALL_GOOD=true

# Function to check command existence and version
check_command() {
    local cmd=$1
    local min_version=$2
    local version_flag=$3
    
    if command -v $cmd &> /dev/null; then
        local version=$(eval "$cmd $version_flag" 2>/dev/null | head -n1)
        echo -e "${GREEN}✅ $cmd${NC} - $version"
        return 0
    else
        echo -e "${RED}❌ $cmd${NC} - Not installed"
        ALL_GOOD=false
        return 1
    fi
}

# Function to check AWS configuration
check_aws_config() {
    if aws sts get-caller-identity &> /dev/null; then
        local account=$(aws sts get-caller-identity --query 'Account' --output text 2>/dev/null)
        local region=$(aws configure get region 2>/dev/null)
        echo -e "${GREEN}✅ AWS CLI${NC} - Configured (Account: $account, Region: $region)"
        return 0
    else
        echo -e "${RED}❌ AWS CLI${NC} - Not configured or no access"
        echo -e "${YELLOW}   Run: aws configure${NC}"
        ALL_GOOD=false
        return 1
    fi
}

# Function to check Docker daemon
check_docker_daemon() {
    if docker info &> /dev/null; then
        echo -e "${GREEN}✅ Docker Daemon${NC} - Running"
        return 0
    else
        echo -e "${RED}❌ Docker Daemon${NC} - Not running or no permission"
        echo -e "${YELLOW}   Try: sudo systemctl start docker${NC}"
        echo -e "${YELLOW}   Or: sudo usermod -aG docker \$USER && newgrp docker${NC}"
        ALL_GOOD=false
        return 1
    fi
}

# Function to check project dependencies
check_project_deps() {
    if [ -f "package.json" ] || [ -f "frontend/package.json" ]; then
        if [ -d "frontend/node_modules" ]; then
            echo -e "${GREEN}✅ Frontend Dependencies${NC} - Installed"
        else
            echo -e "${YELLOW}⚠️  Frontend Dependencies${NC} - Run: cd frontend && npm install"
        fi
    fi
    
    if [ -f "pyproject.toml" ]; then
        if poetry check &> /dev/null; then
            echo -e "${GREEN}✅ Backend Dependencies${NC} - Poetry project valid"
        else
            echo -e "${YELLOW}⚠️  Backend Dependencies${NC} - Run: poetry install"
        fi
    fi
}

echo ""
echo "📋 System Requirements:"
echo "----------------------"

# Check basic tools
check_command "git" "2.30" "--version"
check_command "aws" "2.0" "--version"
check_command "node" "18.0" "--version"
check_command "npm" "8.0" "--version"
check_command "python3" "3.9" "--version"
check_command "poetry" "1.4" "--version"
check_command "docker" "20.0" "--version"

# Check Docker Compose (different commands on different systems)
if command -v "docker-compose" &> /dev/null; then
    check_command "docker-compose" "2.0" "--version"
elif docker compose version &> /dev/null; then
    echo -e "${GREEN}✅ docker compose${NC} - $(docker compose version)"
else
    echo -e "${RED}❌ docker compose${NC} - Not available"
    ALL_GOOD=false
fi

echo ""
echo "🔐 AWS Configuration:"
echo "--------------------"
check_aws_config

echo ""
echo "🐳 Docker Status:"
echo "----------------"
check_docker_daemon

echo ""
echo "📦 Project Dependencies:"
echo "-----------------------"
check_project_deps

echo ""
echo "🌐 Network Connectivity:"
echo "------------------------"

# Check internet connectivity
if ping -c 1 google.com &> /dev/null; then
    echo -e "${GREEN}✅ Internet Connection${NC} - Available"
else
    echo -e "${RED}❌ Internet Connection${NC} - No connectivity"
    ALL_GOOD=false
fi

# Check AWS connectivity
if aws s3 ls &> /dev/null; then
    echo -e "${GREEN}✅ AWS Connectivity${NC} - Can access AWS services"
else
    echo -e "${RED}❌ AWS Connectivity${NC} - Cannot access AWS services"
    ALL_GOOD=false
fi

echo ""
echo "📁 Project Files:"
echo "----------------"

# Check important files exist
files_to_check=(
    "setup-aws-infrastructure.sh"
    "deploy-aws.sh"
    ".env.deploy.template"
    "docker-compose.production.yml"
    "frontend/package.json"
    "pyproject.toml"
)

for file in "${files_to_check[@]}"; do
    if [ -f "$file" ]; then
        echo -e "${GREEN}✅ $file${NC} - Present"
    else
        echo -e "${RED}❌ $file${NC} - Missing"
        ALL_GOOD=false
    fi
done

# Check if scripts are executable
if [ -x "setup-aws-infrastructure.sh" ]; then
    echo -e "${GREEN}✅ setup-aws-infrastructure.sh${NC} - Executable"
else
    echo -e "${YELLOW}⚠️  setup-aws-infrastructure.sh${NC} - Run: chmod +x setup-aws-infrastructure.sh"
fi

if [ -x "deploy-aws.sh" ]; then
    echo -e "${GREEN}✅ deploy-aws.sh${NC} - Executable"
else
    echo -e "${YELLOW}⚠️  deploy-aws.sh${NC} - Run: chmod +x deploy-aws.sh"
fi

echo ""
echo "=================================================================="

if [ "$ALL_GOOD" = true ]; then
    echo -e "${GREEN}🎉 All Prerequisites Met!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Register domain: conservationbiologytools.org in Route 53"
    echo "2. Run: ./setup-aws-infrastructure.sh"
    echo "3. Configure: cp .env.deploy.template .env.deploy"
    echo "4. Deploy: ./deploy-aws.sh"
    echo ""
    echo "See docs/NEW_COMPUTER_SETUP.md for detailed instructions."
else
    echo -e "${RED}❌ Some Prerequisites Missing${NC}"
    echo ""
    echo "Please install missing components and run this script again."
    echo "See docs/NEW_COMPUTER_SETUP.md for installation instructions."
fi

echo ""