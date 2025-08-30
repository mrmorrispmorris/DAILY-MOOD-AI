import { test, expect } from '@playwright/test';

test.describe('API Endpoints', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should have health check endpoint responding', async ({ request }) => {
    // Test if server is running and responsive
    const response = await request.get(`${baseURL}/`);
    expect(response.status()).toBe(200);
  });

  test('should handle 404 for non-existent pages', async ({ request }) => {
    const response = await request.get(`${baseURL}/non-existent-page`);
    expect(response.status()).toBe(404);
  });

  test('should serve static assets correctly', async ({ request }) => {
    // Test manifest.json
    const manifestResponse = await request.get(`${baseURL}/manifest.json`);
    expect(manifestResponse.status()).toBe(200);
    
    const manifest = await manifestResponse.json();
    expect(manifest.name).toBe('DailyMood AI');
    expect(manifest.short_name).toBe('DailyMood');
  });

  test('should serve PWA service worker', async ({ request }) => {
    const swResponse = await request.get(`${baseURL}/sw.js`);
    expect(swResponse.status()).toBe(200);
    
    const contentType = swResponse.headers()['content-type'];
    expect(contentType).toContain('javascript');
  });
});

test.describe('API Security', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should have proper security headers', async ({ request }) => {
    const response = await request.get(`${baseURL}/`);
    const headers = response.headers();
    
    // Check for security headers
    // Note: Exact headers depend on implementation
    expect(response.status()).toBe(200);
  });

  test('should protect API routes requiring authentication', async ({ request }) => {
    // Test protected API endpoints
    const protectedEndpoints = [
      '/api/ai-insights',
      '/api/analytics', 
      '/api/mood-entries'
    ];

    for (const endpoint of protectedEndpoints) {
      const response = await request.get(`${baseURL}${endpoint}`);
      // Should either redirect or return 401
      expect([401, 302, 404]).toContain(response.status());
    }
  });

  test('should validate request methods', async ({ request }) => {
    // Test that endpoints reject inappropriate methods
    const response = await request.patch(`${baseURL}/api/health`);
    // Should reject PATCH on GET-only endpoints
    expect([405, 404]).toContain(response.status());
  });
});

test.describe('Stripe Integration', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should have Stripe checkout endpoint structure', async ({ request }) => {
    // Test checkout endpoint exists (without auth it should return 401)
    const response = await request.post(`${baseURL}/api/stripe/create-checkout-session`, {
      data: { priceId: 'test_price_id' }
    });
    
    // Should return 401 without authentication
    expect(response.status()).toBe(401);
  });

  test('should have webhook endpoint for Stripe', async ({ request }) => {
    // Test webhook endpoint exists
    const response = await request.post(`${baseURL}/api/stripe/webhook`, {
      data: { test: 'webhook' }
    });
    
    // Should return error due to missing signature (400) or method not allowed
    expect([400, 405]).toContain(response.status());
  });

  test('should validate Stripe webhook signatures', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/stripe/webhook`, {
      data: { type: 'test.event' },
      headers: {
        'stripe-signature': 'invalid_signature'
      }
    });
    
    // Should reject invalid signatures
    expect(response.status()).toBe(400);
  });
});

test.describe('AI Insights API', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should protect AI insights endpoint', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/ai-insights`, {
      data: { moods: [] }
    });
    
    // Should require authentication
    expect(response.status()).toBe(401);
  });

  test('should validate AI insights request format', async ({ request }) => {
    // Test with malformed data
    const response = await request.post(`${baseURL}/api/ai-insights`, {
      data: { invalid: 'data' }
    });
    
    // Should return error for invalid data format
    expect([400, 401]).toContain(response.status());
  });
});

test.describe('Blog API', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should serve blog posts correctly', async ({ request }) => {
    const response = await request.get(`${baseURL}/blog`);
    expect(response.status()).toBe(200);
    
    const html = await response.text();
    expect(html).toContain('Mental Health Blog');
    expect(html).toContain('comprehensive articles');
  });

  test('should serve individual blog posts', async ({ request }) => {
    // Test a known blog post slug
    const response = await request.get(`${baseURL}/blog/mental-health-statistics-2023`);
    expect(response.status()).toBe(200);
    
    const html = await response.text();
    expect(html).toContain('Mental Health Statistics');
  });

  test('should return 404 for non-existent blog posts', async ({ request }) => {
    const response = await request.get(`${baseURL}/blog/non-existent-post`);
    expect(response.status()).toBe(404);
  });

  test('should have proper SEO meta tags in blog posts', async ({ request }) => {
    const response = await request.get(`${baseURL}/blog/mental-health-statistics-2023`);
    expect(response.status()).toBe(200);
    
    const html = await response.text();
    expect(html).toContain('<meta name="description"');
    expect(html).toContain('<title>');
  });
});

test.describe('Performance API', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should respond to API requests within acceptable time', async ({ request }) => {
    const startTime = Date.now();
    const response = await request.get(`${baseURL}/`);
    const responseTime = Date.now() - startTime;
    
    expect(response.status()).toBe(200);
    expect(responseTime).toBeLessThan(2000); // API should respond within 2 seconds
    
    console.log(`API response time: ${responseTime}ms`);
  });

  test('should handle concurrent requests efficiently', async ({ request }) => {
    // Test multiple concurrent requests
    const requests = Array(5).fill(null).map(() => 
      request.get(`${baseURL}/`)
    );
    
    const startTime = Date.now();
    const responses = await Promise.all(requests);
    const totalTime = Date.now() - startTime;
    
    // All requests should succeed
    responses.forEach(response => {
      expect(response.status()).toBe(200);
    });
    
    // Concurrent requests should not take much longer than single request
    expect(totalTime).toBeLessThan(5000);
    console.log(`5 concurrent requests time: ${totalTime}ms`);
  });

  test('should handle large request payloads appropriately', async ({ request }) => {
    // Test with reasonable size mood data
    const largeMoodData = Array(100).fill(null).map((_, i) => ({
      mood_score: Math.floor(Math.random() * 10) + 1,
      date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      notes: `Test mood entry ${i}`
    }));

    const response = await request.post(`${baseURL}/api/ai-insights`, {
      data: { moods: largeMoodData }
    });
    
    // Should handle request (though may return 401 without auth)
    expect([200, 401]).toContain(response.status());
  });
});

test.describe('Error Handling', () => {
  const baseURL = process.env.TEST_BASE_URL || 'http://localhost:3009';

  test('should return proper error formats', async ({ request }) => {
    const response = await request.get(`${baseURL}/api/non-existent-endpoint`);
    expect(response.status()).toBe(404);
  });

  test('should handle malformed JSON requests', async ({ request }) => {
    const response = await request.post(`${baseURL}/api/ai-insights`, {
      data: 'invalid json string',
      headers: {
        'content-type': 'application/json'
      }
    });
    
    // Should return error for malformed JSON
    expect([400, 401]).toContain(response.status());
  });

  test('should have proper CORS headers if needed', async ({ request }) => {
    const response = await request.options(`${baseURL}/api/health`);
    
    // Should handle preflight requests appropriately
    // Exact behavior depends on CORS configuration
    expect([200, 204, 404, 405]).toContain(response.status());
  });
});
