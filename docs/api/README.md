# 🔌 DailyMood AI API Documentation

## Overview
Complete API reference for the DailyMood AI platform.

## Base URL
- **Development**: `http://localhost:3009`
- **Production**: `https://project-iota-gray.vercel.app`

## Authentication
All API endpoints use Supabase authentication with JWT tokens passed in the `Authorization` header:

```
Authorization: Bearer <jwt_token>
```

## Core Endpoints

### Health Check
**GET** `/api/health`
- **Description**: Server health status
- **Auth Required**: No
- **Response**: JSON with status and timestamp

```json
{
  "status": "healthy",
  "timestamp": "2025-01-25T10:30:00Z",
  "uptime": 3600,
  "version": "1.0.0"
}
```

### Mood Entries

#### Get Mood Entries
**GET** `/api/mood-entries`
- **Description**: Retrieve user's mood entries
- **Auth Required**: Yes
- **Query Parameters**:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `startDate`: Filter start date (ISO string)
  - `endDate`: Filter end date (ISO string)

**Response**:
```json
{
  "data": [
    {
      "id": "uuid",
      "user_id": "uuid", 
      "mood_score": 7,
      "emoji": "😊",
      "notes": "Feeling good today",
      "tags": ["activity:exercise", "weather:sunny"],
      "date": "2025-01-25",
      "created_at": "2025-01-25T10:30:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  }
}
```

#### Create Mood Entry
**POST** `/api/mood-entries`
- **Description**: Create new mood entry
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "mood_score": 7,
  "emoji": "😊", 
  "notes": "Feeling great after exercise",
  "tags": ["activity:exercise", "weather:sunny"],
  "date": "2025-01-25"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "user_id": "uuid",
    "mood_score": 7,
    "emoji": "😊",
    "notes": "Feeling great after exercise", 
    "tags": ["activity:exercise", "weather:sunny"],
    "date": "2025-01-25",
    "created_at": "2025-01-25T10:30:00Z"
  }
}
```

### AI Insights

#### Generate AI Insights
**POST** `/api/ai-insights`
- **Description**: Generate AI-powered mood insights
- **Auth Required**: Yes (Premium feature)
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "moods": [
    {
      "score": 7,
      "notes": "Good day",
      "activities": ["exercise"],
      "timestamp": "2025-01-25T10:00:00Z"
    }
  ],
  "userId": "uuid"
}
```

**Response**:
```json
{
  "prediction": "Your mood has been trending upward this week",
  "average": "7.2",
  "recommendation": "Keep up your exercise routine",
  "nextDayPrediction": 7.5,
  "insights": [
    "Exercise correlates with higher mood scores",
    "Your mood is most stable in the mornings"
  ],
  "patterns": {
    "weeklyTrend": "improving",
    "bestDay": "Friday",
    "averageMood": 7.2
  },
  "confidence": 0.85,
  "metadata": {
    "analysisType": "AI-powered",
    "dataPoints": 14
  }
}
```

### Analytics

#### Get User Analytics
**GET** `/api/analytics`
- **Description**: User behavior and conversion analytics
- **Auth Required**: Yes (Admin only)
- **Query Parameters**:
  - `startDate`: Analysis period start
  - `endDate`: Analysis period end
  - `metric`: Specific metric to retrieve

**Response**:
```json
{
  "conversionMetrics": {
    "monthlyRecurringRevenue": 5000,
    "conversionRate": 8.5,
    "premiumUsers": 50,
    "totalUsers": 588
  },
  "userBehavior": {
    "dailyActiveUsers": 125,
    "weeklyActiveUsers": 300,
    "avgMoodEntriesPerUser": 12.3,
    "retentionRate": 75
  },
  "revenueData": {
    "totalRevenue": 15000,
    "averageRevenuePerUser": 25.50,
    "lifetimeValue": 150
  }
}
```

### Stripe Integration

#### Create Checkout Session  
**POST** `/api/stripe/create-checkout-session`
- **Description**: Create Stripe checkout for premium upgrade
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "priceId": "price_1234567890"
}
```

**Response**:
```json
{
  "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0"
}
```

#### Cancel Subscription
**POST** `/api/stripe/cancel-subscription`
- **Description**: Cancel user's active subscription
- **Auth Required**: Yes
- **Content-Type**: `application/json`

**Request Body**:
```json
{
  "userId": "uuid"
}
```

**Response**:
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "cancelledAt": "2025-01-25T10:30:00Z"
}
```

#### Webhook Handler
**POST** `/api/stripe/webhook`
- **Description**: Handle Stripe webhook events
- **Auth Required**: No (Webhook signature validation)
- **Headers Required**: `stripe-signature`

**Supported Events**:
- `checkout.session.completed`
- `customer.subscription.created`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_succeeded`
- `invoice.payment_failed`

## Error Responses

### Standard Error Format
```json
{
  "error": true,
  "message": "Error description",
  "code": "ERROR_CODE",
  "details": {
    "field": "Additional error details"
  },
  "timestamp": "2025-01-25T10:30:00Z"
}
```

### HTTP Status Codes
- `200`: Success
- `201`: Created
- `400`: Bad Request
- `401`: Unauthorized
- `403`: Forbidden  
- `404`: Not Found
- `429`: Rate Limited
- `500`: Internal Server Error

### Common Errors

#### Authentication Errors
```json
{
  "error": true,
  "message": "Authentication required",
  "code": "AUTH_REQUIRED",
  "timestamp": "2025-01-25T10:30:00Z"
}
```

#### Validation Errors
```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR", 
  "details": {
    "mood_score": "Must be between 1 and 10",
    "date": "Invalid date format"
  },
  "timestamp": "2025-01-25T10:30:00Z"
}
```

#### Rate Limiting
```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMITED",
  "retryAfter": 60,
  "timestamp": "2025-01-25T10:30:00Z"
}
```

## Rate Limits
- **Authentication endpoints**: 5 requests per minute per IP
- **Mood entries**: 100 requests per hour per user
- **AI insights**: 10 requests per hour per user (Premium)
- **Analytics**: 1000 requests per hour per admin

## SDKs and Libraries

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'your_supabase_url',
  'your_supabase_anon_key'
)

// Create mood entry
const { data, error } = await supabase
  .from('mood_entries')
  .insert({
    mood_score: 7,
    emoji: '😊',
    notes: 'Great day!',
    date: new Date().toISOString().split('T')[0]
  })
```

### React Hook
```typescript
import { useSupabaseClient } from '@supabase/auth-helpers-react'

function useMoodEntries() {
  const supabase = useSupabaseClient()
  
  const createMoodEntry = async (moodData) => {
    const { data, error } = await supabase
      .from('mood_entries')
      .insert(moodData)
    
    return { data, error }
  }
  
  return { createMoodEntry }
}
```

## Webhooks

### Stripe Webhooks
Configure webhook endpoint in Stripe Dashboard:
- **URL**: `https://your-domain.com/api/stripe/webhook`
- **Events**: Select all subscription and payment events
- **Version**: Latest API version

### Webhook Security
All webhooks are verified using signature validation:

```typescript
const signature = headers['stripe-signature']
const event = stripe.webhooks.constructEvent(
  body,
  signature, 
  process.env.STRIPE_WEBHOOK_SECRET
)
```

## Testing

### API Testing
```bash
# Run API test suite
npm run test:api

# Test specific endpoint
curl -X GET "http://localhost:3009/api/health"
```

### Mock Data
```json
{
  "mockMoodEntries": [
    {
      "mood_score": 8,
      "emoji": "😄",
      "notes": "Productive day at work",
      "tags": ["activity:work", "weather:sunny"],
      "date": "2025-01-25"
    }
  ]
}
```

## Monitoring
- **Health checks**: `/api/health` endpoint
- **Error tracking**: Automatic error reporting
- **Performance**: Response time monitoring
- **Rate limiting**: Automatic throttling

For more information, see [Monitoring Guide](../production/monitoring.md).
