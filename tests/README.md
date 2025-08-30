# 🧪 DailyMood AI Test Suite

## Overview
Comprehensive automated testing infrastructure for the DailyMood AI application.

## Testing Stack
- **Playwright**: End-to-end testing
- **Jest**: Unit testing
- **Testing Library**: Component testing
- **Cypress**: Alternative E2E option

## Test Categories

### 1. End-to-End Tests (`e2e/`)
- User authentication flows
- Mood logging functionality  
- Premium subscription flow
- Blog system navigation
- Dashboard interactions

### 2. API Tests (`api/`)
- Authentication endpoints
- Mood data CRUD operations
- Stripe webhook handling
- AI insights generation
- Analytics endpoints

### 3. Component Tests (`components/`)
- MoodEntry component interactions
- PremiumGate functionality
- Analytics dashboard rendering
- Mobile navigation behavior

### 4. Performance Tests (`performance/`)
- Page load times
- API response times
- Bundle size optimization
- Mobile performance metrics

## Running Tests

### All Tests
```bash
npm run test
```

### E2E Tests
```bash
npm run test:e2e
```

### API Tests
```bash
npm run test:api
```

### Component Tests
```bash
npm run test:components
```

### Performance Tests
```bash
npm run test:performance
```

## CI/CD Integration
Tests run automatically on:
- Pull requests
- Main branch commits
- Scheduled nightly runs
- Before deployments

## Test Data
- Uses isolated test database
- Automated cleanup after tests
- Mock Stripe payment data
- Test user accounts

## Reporting
- HTML reports generated
- Screenshots on failures
- Performance metrics tracked
- Coverage reports available
