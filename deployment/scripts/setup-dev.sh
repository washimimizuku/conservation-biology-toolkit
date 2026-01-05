#!/bin/bash

echo "🌱 Setting up Conservation Biology Toolkit development environment..."

# Check if Poetry is installed
if ! command -v poetry &> /dev/null; then
    echo "❌ Poetry is not installed. Please install Poetry first:"
    echo "   curl -sSL https://install.python-poetry.org | python3 -"
    exit 1
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

echo "✅ All prerequisites found!"

# Install root dependencies
echo "📦 Installing root dependencies..."
poetry install

# Install breed registry dependencies
echo "📦 Installing breed registry dependencies..."
cd services/breed-registry
poetry install
cd ../..

# Install population analysis dependencies
echo "📦 Installing population analysis dependencies..."
cd services/population-analysis
poetry install
cd ../..

# Install frontend dependencies
echo "📦 Installing frontend dependencies..."
cd frontend
npm install
cd ..

echo "🎉 Setup complete!"
echo ""
echo "To start development:"
echo "  docker-compose up    # Start all services"
echo ""
echo "Or start services individually:"
echo "  cd frontend && npm start                                    # Frontend (port 3000)"
echo "  cd services/population-analysis && poetry run uvicorn main:app --reload --port 8002"
echo ""
echo "Access the application at: http://localhost:3000"
echo "API documentation at: http://localhost:8002/docs"