# 🔍 Production Monitoring System Guide

## Overview

DailyMood AI includes a comprehensive monitoring system designed for production environments. This system provides real-time health monitoring, error tracking, performance metrics, and business intelligence.

## 📊 Monitoring Endpoints

### 1. Health Check (`/api/health`)

**Basic Health Check (GET)**
```bash
curl https://your-domain.com/api/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-25T10:30:00Z",
  "service": "DailyMood AI",
  "version": "1.0.0",
  "environment": "production",
  "uptime": 86400,
  "checks": {
    "server": true,
    "database": true,
    "external_services": true
  },
  "performance": {
    "response_time_ms": 45,
    "memory_usage": {...}
  }
}
```

**Detailed Health Check (POST)**
```bash
curl -X POST https://your-domain.com/api/health \
  -H "Authorization: Bearer YOUR_HEALTH_SECRET"
```

### 2. System Monitoring (`/api/monitor`)

**Complete System Metrics**
```bash
curl "https://your-domain.com/api/monitor?token=YOUR_MONITOR_TOKEN"
```

Provides:
- System metrics (uptime, memory, performance)
- Database metrics (users, mood entries, subscriptions)
- Business metrics (MRR, conversion rates, DAU/WAU)
- Health status of all services

### 3. Error Analytics (`/api/errors`)

**View Error Reports**
```bash
curl "https://your-domain.com/api/errors?token=YOUR_MONITOR_TOKEN&timeframe=24h"
```

**Report Errors (Automatic from Frontend)**
```bash
curl -X POST https://your-domain.com/api/errors \
  -H "Content-Type: application/json" \
  -d '{"error": {...}, "service": "frontend"}'
```

## 🔧 Setup Instructions

### Environment Variables

Add these to your production environment:

```env
# Monitoring Security
HEALTH_CHECK_SECRET=your-secure-health-secret
MONITOR_SECRET_TOKEN=your-secure-monitoring-token

# Optional: Error Reporting
SENTRY_DSN=your-sentry-dsn
VERCEL_ANALYTICS_ID=your-vercel-analytics-id
```

### 1. Uptime Monitoring

Set up external uptime monitoring using services like:
- **UptimeRobot**: Monitor `/api/health` endpoint
- **Pingdom**: Track response times and availability
- **StatusCake**: Global monitoring from multiple locations

**Configuration:**
- URL: `https://your-domain.com/api/health`
- Method: GET
- Expected Status: 200
- Check Interval: 1-5 minutes
- Timeout: 30 seconds

### 2. Error Tracking

The system includes automatic error tracking:

**Frontend Errors:**
- Unhandled JavaScript errors
- Promise rejections
- React component errors
- API call failures

**Backend Errors:**
- Server errors (500s)
- Database connection issues
- External service failures
- Performance issues

### 3. Performance Monitoring

**Metrics Tracked:**
- API response times
- Database query performance
- Memory usage
- CPU usage
- Bundle size and loading times

**Thresholds:**
- API Response: < 500ms (warning), < 2000ms (critical)
- Database: < 100ms (good), < 500ms (acceptable)
- Memory: < 512MB (good), < 1GB (warning)

## 📈 Business Metrics Dashboard

### Key Performance Indicators (KPIs)

**Revenue Metrics:**
- Monthly Recurring Revenue (MRR)
- Annual Recurring Revenue (ARR)
- Customer Lifetime Value (CLV)
- Average Revenue Per User (ARPU)

**Usage Metrics:**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Mood Entries per User
- Session Duration

**Conversion Metrics:**
- Free to Premium conversion rate
- Churn rate
- Feature adoption rates
- Onboarding completion rate

### Sample Monitoring Dashboard Query

```bash
# Get comprehensive metrics
curl "https://your-domain.com/api/monitor?token=YOUR_TOKEN" | jq '{
  status: .status,
  users: .database.total_users,
  mrr: .business.monthly_recurring_revenue,
  conversion: .business.conversion_rate,
  dau: .business.daily_active_users,
  health_score: .health_score
}'
```

## 🚨 Alert Configuration

### Critical Alerts (Immediate Response Required)

1. **Service Down** - Health check returns 5xx
2. **Database Offline** - Cannot connect to Supabase
3. **Payment System Failure** - Stripe webhooks failing
4. **High Error Rate** - >10 errors/minute

### Warning Alerts (Monitor Closely)

1. **Slow Response Times** - API >2000ms
2. **High Memory Usage** - >1GB
3. **Low Conversion Rate** - <2%
4. **Subscription Cancellations** - Spike in churn

### Info Alerts (FYI)

1. **New User Signups** - Daily summary
2. **Revenue Milestones** - Monthly targets hit
3. **Performance Reports** - Weekly summaries

## 🔍 Troubleshooting Guide

### Common Issues

**1. Health Check Failing**
```bash
# Check server status
curl -I https://your-domain.com/

# Check database connectivity
curl "https://your-domain.com/api/health" -v
```

**2. High Error Rate**
```bash
# View recent errors
curl "https://your-domain.com/api/errors?token=TOKEN&timeframe=1h"

# Check error patterns
curl "https://your-domain.com/api/errors?token=TOKEN" | jq '.top_errors'
```

**3. Performance Issues**
```bash
# Check system metrics
curl "https://your-domain.com/api/monitor?token=TOKEN" | jq '.performance'

# Analyze bundle size
npm run build && npm run analyze
```

### Debug Commands

```bash
# System health overview
curl -s "https://your-domain.com/api/health" | jq

# Detailed monitoring
curl -s "https://your-domain.com/api/monitor?token=TOKEN" | jq '{
  status: .status,
  health: .health,
  performance: .performance.avg_api_response_time
}'

# Error summary
curl -s "https://your-domain.com/api/errors?token=TOKEN&timeframe=24h" | jq '.summary'
```

## 📊 Integration with External Tools

### 1. Grafana Dashboard

Create dashboards using the monitoring API:

```json
{
  "dashboard": {
    "title": "DailyMood AI Monitoring",
    "panels": [
      {
        "title": "System Health",
        "type": "stat",
        "targets": [{
          "url": "https://your-domain.com/api/monitor?token=TOKEN",
          "jsonPath": "$.health_score"
        }]
      }
    ]
  }
}
```

### 2. Slack Notifications

Set up webhook alerts:

```bash
# Alert on critical issues
if [ "$(curl -s https://your-domain.com/api/health | jq -r '.status')" != "healthy" ]; then
  curl -X POST YOUR_SLACK_WEBHOOK -d '{"text":"🚨 DailyMood AI is unhealthy!"}'
fi
```

### 3. Vercel Analytics

Automatic integration via:
```env
VERCEL_ANALYTICS_ID=your-analytics-id
```

## 🔐 Security Considerations

1. **Token Security**: Use strong, random tokens for monitoring endpoints
2. **Rate Limiting**: Monitor endpoints are rate-limited
3. **IP Restrictions**: Consider IP whitelisting for monitoring endpoints
4. **Data Privacy**: Error reports exclude sensitive user data
5. **Log Rotation**: Automatic cleanup of old error reports

## 📝 Monitoring Checklist

### Daily Tasks
- [ ] Check system health dashboard
- [ ] Review error reports
- [ ] Monitor conversion metrics
- [ ] Check for performance issues

### Weekly Tasks
- [ ] Analyze user growth trends
- [ ] Review subscription metrics
- [ ] Check for new error patterns
- [ ] Update monitoring thresholds

### Monthly Tasks
- [ ] Performance optimization review
- [ ] Monitoring system health check
- [ ] Update monitoring documentation
- [ ] Security audit of monitoring endpoints

---

## 📞 Support

For monitoring issues or questions:
- Check this documentation first
- Review error logs in `/api/errors`
- Use health checks for quick diagnostics
- Monitor business metrics for trends

**Remember**: This monitoring system is designed to be proactive. Set up alerts and check dashboards regularly to maintain optimal system performance.


