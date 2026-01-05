#!/bin/bash

# Prerequisites Installation Script for Conservation Biology Toolkit
# Supports macOS (Homebrew), Ubuntu/Debian, and provides Windows guidance

set -e

echo "🚀 Installing Prerequisites for Conservation Biology Toolkit"
echo "=========================================================="

# Detect OS
if [[ "$OSTYPE" == "darwin"* ]]; then
    OS="macos"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    if [ -f /etc/debian_version ]; then
        OS="debian"
    elif [ -f /etc/redhat-release ]; then
        OS="redhat"
    else
        OS="linux"
    fi
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "cygwin" ]]; then
    OS="windows"
else
    OS="unknown"
fi

echo "Detected OS: $OS"
echo ""

install_macos() {
    echo "📦 Installing prerequisites for macOS..."
    
    # Check if Homebrew is installed
    if ! command -v brew &> /dev/null; then
        echo "Installing Homebrew..."
        /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    fi
    
    # Install packages
    echo "Installing packages via Homebrew..."
    brew install git awscli node python poetry docker docker-compose
    
    echo "✅ macOS prerequisites installed!"
}

install_debian() {
    echo "📦 Installing prerequisites for Ubuntu/Debian..."
    
    # Update package list
    sudo apt update
    
    # Install basic packages
    sudo apt install -y git curl wget gnupg lsb-release
    
    # Install AWS CLI
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    # Install Node.js
    echo "Installing Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    
    # Install Python and Poetry
    echo "Installing Python and Poetry..."
    sudo apt install -y python3 python3-pip python3-venv
    curl -sSL https://install.python-poetry.org | python3 -
    
    # Add Poetry to PATH
    echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
    
    # Install Docker
    echo "Installing Docker..."
    sudo apt install -y docker.io docker-compose-v2
    sudo usermod -aG docker $USER
    
    echo "✅ Ubuntu/Debian prerequisites installed!"
    echo "⚠️  Please log out and back in for Docker permissions to take effect."
}

install_redhat() {
    echo "📦 Installing prerequisites for Red Hat/CentOS/Fedora..."
    
    # Install basic packages
    sudo yum install -y git curl wget
    
    # Install AWS CLI
    echo "Installing AWS CLI..."
    curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
    unzip awscliv2.zip
    sudo ./aws/install
    rm -rf aws awscliv2.zip
    
    # Install Node.js
    echo "Installing Node.js..."
    curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
    sudo yum install -y nodejs
    
    # Install Python and Poetry
    echo "Installing Python and Poetry..."
    sudo yum install -y python3 python3-pip
    curl -sSL https://install.python-poetry.org | python3 -
    
    # Install Docker
    echo "Installing Docker..."
    sudo yum install -y docker docker-compose
    sudo systemctl start docker
    sudo systemctl enable docker
    sudo usermod -aG docker $USER
    
    echo "✅ Red Hat/CentOS/Fedora prerequisites installed!"
    echo "⚠️  Please log out and back in for Docker permissions to take effect."
}

show_windows_instructions() {
    echo "🪟 Windows Installation Instructions"
    echo "===================================="
    echo ""
    echo "For Windows, please install the following manually:"
    echo ""
    echo "1. Git for Windows:"
    echo "   https://git-scm.com/download/win"
    echo ""
    echo "2. AWS CLI v2:"
    echo "   https://awscli.amazonaws.com/AWSCLIV2.msi"
    echo ""
    echo "3. Node.js (v18+):"
    echo "   https://nodejs.org/en/download/"
    echo ""
    echo "4. Python (v3.9+):"
    echo "   https://www.python.org/downloads/windows/"
    echo ""
    echo "5. Poetry:"
    echo "   Open PowerShell as Administrator and run:"
    echo "   (Invoke-WebRequest -Uri https://install.python-poetry.org -UseBasicParsing).Content | python -"
    echo ""
    echo "6. Docker Desktop:"
    echo "   https://www.docker.com/products/docker-desktop"
    echo ""
    echo "Alternative: Use WSL2 (Windows Subsystem for Linux) and run this script in Ubuntu."
}

# Main installation logic
case $OS in
    "macos")
        install_macos
        ;;
    "debian")
        install_debian
        ;;
    "redhat")
        install_redhat
        ;;
    "windows")
        show_windows_instructions
        ;;
    *)
        echo "❌ Unsupported operating system: $OSTYPE"
        echo "Please install prerequisites manually:"
        echo "- Git"
        echo "- AWS CLI v2"
        echo "- Node.js 18+"
        echo "- Python 3.9+"
        echo "- Poetry"
        echo "- Docker & Docker Compose"
        exit 1
        ;;
esac

echo ""
echo "🔧 Post-Installation Setup"
echo "=========================="
echo ""
echo "1. Configure AWS CLI:"
echo "   aws configure"
echo ""
echo "2. Verify installation:"
echo "   ./check-prerequisites.sh"
echo ""
echo "3. Clone project and install dependencies:"
echo "   git clone https://github.com/washimimizuku/conservation-biology-toolkit.git"
echo "   cd conservation-biology-toolkit"
echo "   poetry install"
echo "   cd frontend && npm install"
echo ""
echo "4. See docs/NEW_COMPUTER_SETUP.md for detailed setup instructions."
echo ""

if [[ "$OS" == "debian" ]] || [[ "$OS" == "redhat" ]]; then
    echo "⚠️  IMPORTANT: Please log out and back in for Docker permissions to take effect!"
fi