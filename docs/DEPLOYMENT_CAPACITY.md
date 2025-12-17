# Deployment Capacity Planning

This document outlines the expected capacity and performance characteristics of the Conservation Biology Toolkit deployment architecture.

## Architecture Overview

**Recommended Setup: S3 + CloudFront + Lightsail**
- **Frontend**: React app served from S3 with CloudFront CDN
- **Backend**: 7 FastAPI services on single Lightsail instance
- **Cost**: $5.50-6.50/month total

## Capacity Analysis

### Frontend Capacity (S3 + CloudFront)
**Essentially unlimited for static content**

- **CloudFront**: Handles millions of requests/second globally
- **S3**: 3,500 PUT/COPY/POST/DELETE and 5,500 GET/HEAD requests per second per prefix
- **Bottleneck**: Never the frontend - static assets scale automatically

### Backend Capacity (Lightsail)
**This is your limiting factor**

| Lightsail Tier | Monthly Cost | RAM | vCPU | Daily Users | Peak Concurrent | API Calls/Day |
|----------------|-------------|-----|------|-------------|-----------------|---------------|
| Basic | $3.50 | 512MB | 1 | 500-800 | 25-50 | 10,000-25,000 |
| Standard | $5.00 | 1GB | 1 | 1,000-2,000 | 50-100 | 25,000-75,000 |
| Enhanced | $10.00 | 2GB | 1 | 2,500-4,000 | 100-200 | 75,000-150,000 |

## Performance Characteristics

### User Behavior Assumptions
- **Average session**: 10-15 minutes
- **API calls per session**: 20-50 (form submissions, calculations)
- **Peak usage**: 3x average (during work hours)
- **Usage pattern**: Scientific tools have lower concurrent usage than social apps

### FastAPI Services Performance
Your 7 FastAPI services handle computational workloads:

- **Population Analysis**: CPU-intensive calculations
- **Genetic Diversity**: Mathematical computations  
- **Species Assessment**: Data processing
- **Sampling & Survey**: Statistical calculations
- **Habitat & Landscape**: Spatial analysis
- **Climate Impact**: Environmental modeling
- **Conservation Planning**: Optimization algorithms

**Per-service capacity estimates (1 vCPU):**
- Simple calculations: ~100 requests/minute
- Complex calculations: ~20-50 requests/minute
- Load distributed across 7 endpoints

### Nginx Reverse Proxy
- **Overhead**: Minimal (~5-10ms per request)
- **Connection handling**: 1,000+ concurrent connections
- **Not a bottleneck** for this use case

## Real-World Benchmarks

### Conservative Estimate (Lightsail $5)
- **1,000 daily users**
- **50 concurrent users during peak**
- **30,000 API calls/day**
- **Response time**: <500ms for most calculations

### Optimistic Estimate (with caching)
- **2,500 daily users**  
- **125 concurrent users during peak**
- **75,000 API calls/day**
- **Response time**: <200ms for cached, <800ms for complex

## Scaling Triggers

### When to Upgrade Lightsail
```
$3.50 → $5.00: When hitting 500+ daily users
$5.00 → $10.00: When hitting 1,500+ daily users  
$10.00 → ECS: When hitting 3,000+ daily users
```

### Performance Warning Signs
- **CPU usage** consistently >80%
- **Response times** >2 seconds
- **Error rates** >1%
- **Memory usage** >90%

## Optimization Strategies

### 1. Caching (Extends capacity 3-5x)
```nginx
# Add to nginx config
location /api/ {
    proxy_cache_valid 200 5m;  # Cache successful responses
    proxy_cache_key $request_uri;
}
```

### 2. Request Batching
```javascript
// Frontend optimization - batch API calls
const batchCalculations = async (requests) => {
  // Combine multiple calculations in single request
};
```

### 3. Async Processing
```python
# For heavy calculations, use background tasks
from fastapi import BackgroundTasks

@app.post("/heavy-calculation")
async def calculate(data: Input, background_tasks: BackgroundTasks):
    background_tasks.add_task(process_heavy_calculation, data)
    return {"status": "processing"}
```

## Monitoring Commands

### Performance Monitoring on Lightsail
```bash
# System resources
htop                    # CPU/Memory usage
df -h                   # Disk usage

# Docker containers
docker stats           # Container resource usage
docker logs nginx      # Nginx access logs

# Network
netstat -tuln          # Active connections
```

### Key Metrics to Track
- **Response time**: Average API response time
- **Throughput**: Requests per minute
- **Error rate**: Failed requests percentage
- **Resource usage**: CPU, memory, disk utilization
- **Concurrent users**: Active sessions

## Migration Path

### Scaling Progression
```
Phase 1: Lightsail $5 (0-1,000 users)
    ↓
Phase 2: Lightsail $10 (1,000-3,000 users)  
    ↓
Phase 3: ECS Fargate (3,000-10,000 users)
    ↓
Phase 4: ECS with Auto Scaling (10,000+ users)
```

### Cost Progression
- **Months 1-6**: Lightsail $5 ($6/month total)
- **Growth phase**: Lightsail $10 ($11/month total)
- **Scale phase**: ECS Fargate ($30-50/month)
- **Enterprise**: Full AWS stack ($100+/month)

## Deployment Files

The following deployment configurations support this architecture:

- `docker-compose.production.yml` - Backend services for Lightsail
- `deployment/nginx/api-only.conf` - Nginx configuration for API routing
- `deploy-aws.sh` - Automated deployment script

## Conclusion

The S3 + CloudFront + Lightsail architecture provides:

- **Cost-effective**: $6/month for 1,000+ daily users
- **Scalable**: Easy migration path as traffic grows
- **Performant**: Global CDN for frontend, optimized backend
- **AWS native**: Uses AWS best practices and services

This setup should comfortably handle the expected traffic for a conservation biology toolkit in its early months, with clear scaling options as the user base grows.