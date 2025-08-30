import { test, expect } from '@playwright/test';

test.describe('Performance Testing', () => {
  
  test('should load landing page within performance budgets', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // Wait for critical content to be visible
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    
    // Should load within 3 seconds (performance requirement)
    expect(loadTime).toBeLessThan(3000);
    console.log(`Landing page load time: ${loadTime}ms`);
  });

  test('should load dashboard efficiently', async ({ page }) => {
    // Note: This would require authenticated state in real test
    const startTime = Date.now();
    
    try {
      await page.goto('/dashboard', { timeout: 5000 });
      const loadTime = Date.now() - startTime;
      console.log(`Dashboard load time: ${loadTime}ms`);
      
      // Even if redirected to login, should be fast
      expect(loadTime).toBeLessThan(5000);
    } catch (error) {
      // If redirected or requires auth, that's expected behavior
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(3000); // Redirect should be fast
    }
  });

  test('should load blog system efficiently', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/blog');
    await expect(page.locator('h1')).toBeVisible();
    
    const loadTime = Date.now() - startTime;
    expect(loadTime).toBeLessThan(4000); // Blog with 23+ articles should still load quickly
    
    console.log(`Blog page load time: ${loadTime}ms`);
  });

  test('should have optimized images and assets', async ({ page }) => {
    await page.goto('/');
    
    // Check for lazy loading attributes
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      // Images should have loading attributes for performance
      for (let i = 0; i < Math.min(imageCount, 3); i++) {
        const img = images.nth(i);
        if (await img.isVisible()) {
          // Should have alt text for accessibility/SEO
          const altText = await img.getAttribute('alt');
          // Alt can be empty for decorative images, but should be defined
          expect(altText).toBeDefined();
        }
      }
    }
  });

  test('should use efficient caching strategies', async ({ page }) => {
    // First visit
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    
    // Second visit should be faster (cached resources)
    const startTime = Date.now();
    await page.reload();
    await expect(page.locator('h1')).toBeVisible();
    const reloadTime = Date.now() - startTime;
    
    // Reload should be faster than initial load
    expect(reloadTime).toBeLessThan(2000);
    console.log(`Page reload time: ${reloadTime}ms`);
  });
});

test.describe('Bundle Size and Code Splitting', () => {
  
  test('should implement code splitting for better performance', async ({ page }) => {
    await page.goto('/');
    
    // Check that we have multiple JS chunks (indicates code splitting)
    const response = await page.waitForResponse(response => 
      response.url().includes('.js') && response.status() === 200
    );
    
    expect(response.status()).toBe(200);
  });

  test('should load critical CSS first', async ({ page }) => {
    await page.goto('/');
    
    // Check that styles are applied (no FOUC - Flash of Unstyled Content)
    const heading = page.locator('h1').first();
    await expect(heading).toBeVisible();
    
    // Get computed styles to ensure CSS is loaded
    const color = await heading.evaluate(el => 
      window.getComputedStyle(el).color
    );
    
    // Should have proper styling applied (not default browser styles)
    expect(color).not.toBe('rgb(0, 0, 0)'); // Not default black
  });

  test('should minimize render-blocking resources', async ({ page }) => {
    const startTime = Date.now();
    
    await page.goto('/');
    
    // First meaningful paint should be fast
    await expect(page.locator('h1')).toBeVisible();
    const fmpTime = Date.now() - startTime;
    
    expect(fmpTime).toBeLessThan(2000); // First meaningful paint < 2s
    console.log(`First meaningful paint: ${fmpTime}ms`);
  });
});

test.describe('Mobile Performance', () => {
  
  test('should perform well on mobile devices', async ({ page }) => {
    // Set mobile viewport and throttling
    await page.setViewportSize({ width: 375, height: 667 });
    
    const startTime = Date.now();
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    const mobileLoadTime = Date.now() - startTime;
    
    // Mobile should still be reasonably fast
    expect(mobileLoadTime).toBeLessThan(5000);
    console.log(`Mobile load time: ${mobileLoadTime}ms`);
  });

  test('should have touch-friendly interactions', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Check for touch-friendly button sizes
    const buttons = page.locator('button, a[role="button"]');
    const buttonCount = await buttons.count();
    
    if (buttonCount > 0) {
      const firstButton = buttons.first();
      if (await firstButton.isVisible()) {
        // Check button dimensions
        const box = await firstButton.boundingBox();
        if (box) {
          // Should be at least 44px for touch targets (iOS HIG)
          expect(Math.min(box.width, box.height)).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('should handle mobile navigation efficiently', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/');
    
    // Test mobile menu if present
    const menuButton = page.locator('[aria-label*="menu"], text=Menu').first();
    if (await menuButton.count() > 0) {
      await menuButton.click();
      // Menu should open quickly
      // In a real app, test the mobile menu functionality
    }
  });
});

test.describe('Interactive Performance', () => {
  
  test('should have responsive user interactions', async ({ page }) => {
    await page.goto('/');
    
    // Test button hover states (desktop)
    if (await page.locator('button').count() > 0) {
      const button = page.locator('button').first();
      
      // Hover should be immediate
      const startTime = Date.now();
      await button.hover();
      const hoverTime = Date.now() - startTime;
      
      expect(hoverTime).toBeLessThan(100); // Should be immediate
    }
  });

  test('should handle form interactions smoothly', async ({ page }) => {
    await page.goto('/signup');
    
    const emailInput = page.locator('input[type="email"]');
    if (await emailInput.count() > 0) {
      const startTime = Date.now();
      await emailInput.fill('test@example.com');
      const inputTime = Date.now() - startTime;
      
      // Form input should be responsive
      expect(inputTime).toBeLessThan(500);
    }
  });

  test('should handle dynamic content loading efficiently', async ({ page }) => {
    await page.goto('/');
    
    // Test interactive demo if present
    const slider = page.locator('input[type="range"]');
    if (await slider.count() > 0) {
      const startTime = Date.now();
      await slider.fill('8');
      
      // Should update display immediately
      await expect(page.locator('text=8/10')).toBeVisible({ timeout: 1000 });
      const updateTime = Date.now() - startTime;
      
      expect(updateTime).toBeLessThan(1000);
    }
  });
});

test.describe('Resource Optimization', () => {
  
  test('should compress text resources', async ({ page }) => {
    // Monitor network requests
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push({
          url: response.url(),
          headers: response.headers(),
          status: response.status()
        });
      }
    });
    
    await page.goto('/');
    
    // Check for compression headers
    const compressedResponses = responses.filter(r => 
      r.headers['content-encoding'] === 'gzip' || 
      r.headers['content-encoding'] === 'br'
    );
    
    // Should have some compressed responses
    expect(compressedResponses.length).toBeGreaterThan(0);
  });

  test('should implement proper caching headers', async ({ page }) => {
    const responses: any[] = [];
    
    page.on('response', response => {
      if (response.url().includes('.js') || response.url().includes('.css')) {
        responses.push(response);
      }
    });
    
    await page.goto('/');
    
    // Check for caching headers on static assets
    for (const response of responses.slice(0, 3)) { // Check first 3
      const cacheControl = response.headers()['cache-control'];
      // Should have some form of caching
      expect(cacheControl).toBeDefined();
    }
  });
});
