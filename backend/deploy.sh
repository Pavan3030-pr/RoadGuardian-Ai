#!/bin/bash

# Road Guardian Backend - Quick Start Deployment Script

set -e

echo "🚀 Road Guardian Backend - Load Balanced Deployment"
echo "=================================================="

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Build the application
echo ""
echo "📦 Building the application..."
mvn clean package -DskipTests

# Start the services
echo ""
echo "🐳 Starting Docker containers..."
docker-compose up -d

echo ""
echo "⏳ Waiting for services to be healthy..."
sleep 10

# Check service health
echo ""
echo "🏥 Checking service health..."

# Check PostgreSQL
if docker exec roadguardian-db pg_isready -U postgres &> /dev/null; then
    echo "✅ PostgreSQL is running"
else
    echo "❌ PostgreSQL failed to start"
    exit 1
fi

# Check Backend Instances
for i in 1 2 3; do
    port=$((8080 + i))
    if curl -s http://localhost:$port/actuator/health | grep -q "UP"; then
        echo "✅ Backend Instance $i is running (port $port)"
    else
        echo "⚠️  Backend Instance $i is starting..."
    fi
done

# Check Nginx
if curl -s http://localhost/health &> /dev/null; then
    echo "✅ Nginx Load Balancer is running"
else
    echo "❌ Nginx Load Balancer failed to start"
fi

echo ""
echo "🎉 Deployment Complete!"
echo ""
echo "📍 Access your application:"
echo "   - API: http://localhost/api/accidents"
echo "   - Health: http://localhost/health"
echo "   - PostgreSQL: localhost:5432"
echo ""
echo "📊 Monitoring:"
echo "   - Instance 1 Health: http://localhost:8081/actuator/health"
echo "   - Instance 2 Health: http://localhost:8082/actuator/health"
echo "   - Instance 3 Health: http://localhost:8083/actuator/health"
echo ""
echo "🛠️  Useful Commands:"
echo "   - View logs: docker logs roadguardian-app1"
echo "   - Stop all: docker-compose down"
echo "   - View DB: docker exec -it roadguardian-db psql -U postgres -d roadguardian"
echo ""
