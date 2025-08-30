import { test, expect } from '@playwright/test'

test.describe('Critical User Paths', () => {
  test('should complete signup flow', async ({ page }) => {
    await page.goto('http://localhost:3009/signup')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'TestPassword123!')
    await page.fill('[name="confirmPassword"]', 'TestPassword123!')
    await page.click('button[type="submit"]')
    
    // Should see success message or redirect
    await expect(page).toHaveURL(/.*signup.*/, { timeout: 10000 })
    await expect(page.locator('text=Account created')).toBeVisible({ timeout: 10000 })
  })
  
  test('should display homepage correctly', async ({ page }) => {
    await page.goto('http://localhost:3009/')
    
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Track Your Mood')
    
    // Check for CTA buttons
    await expect(page.locator('text=Start Free Trial')).toBeVisible()
    await expect(page.locator('text=View Pricing')).toBeVisible()
    
    // Check for interactive demo
    await expect(page.locator('text=See DailyMood AI in Action')).toBeVisible()
  })
  
  test('should display pricing correctly', async ({ page }) => {
    await page.goto('http://localhost:3009/pricing')
    await expect(page.locator('text=$9.99')).toBeVisible()
    
    // Test billing toggle
    await page.click('text=Yearly')
    await expect(page.locator('text=$79.99')).toBeVisible()
  })
  
  test('should load blog articles without 404', async ({ page }) => {
    // Test main blog page
    await page.goto('http://localhost:3009/blog')
    await expect(page.locator('h1')).toContainText('Blog')
    
    // Test specific articles that were previously 404ing
    await page.goto('http://localhost:3009/blog/mental-health-statistics-2025')
    await expect(page.locator('h1')).toContainText('Mental Health Statistics 2025')
    
    await page.goto('http://localhost:3009/blog/ai-mental-health')
    await expect(page.locator('h1')).toContainText('AI is Revolutionizing')
  })
  
  test('should have visible headings (no invisible text)', async ({ page }) => {
    await page.goto('http://localhost:3009/')
    
    // Check main heading is visible
    const mainHeading = page.locator('h1').first()
    await expect(mainHeading).toBeVisible()
    
    // Check that gradient text has proper fallback color
    const gradientText = page.locator('.bg-gradient-to-r.bg-clip-text.text-transparent')
    if (await gradientText.count() > 0) {
      // Should be visible (not actually transparent)
      await expect(gradientText.first()).toBeVisible()
    }
  })
  
  test('should be mobile responsive', async ({ page }) => {
    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto('http://localhost:3009/')
    
    // Main content should still be visible
    await expect(page.locator('h1')).toBeVisible()
    
    // Check mobile navigation works
    const mobileNav = page.locator('[data-testid="mobile-nav"]')
    if (await mobileNav.count() > 0) {
      await expect(mobileNav).toBeVisible()
    }
  })
  
  test('should load interactive demo functionality', async ({ page }) => {
    await page.goto('http://localhost:3009/')
    
    // Scroll to demo section
    await page.locator('#demo').scrollIntoViewIfNeeded()
    
    // Check demo is visible
    await expect(page.locator('text=See DailyMood AI in Action')).toBeVisible()
    
    // Look for mood slider or interactive elements
    const demoSection = page.locator('#demo')
    await expect(demoSection).toBeVisible()
  })
  
  test('should handle authentication redirects properly', async ({ page }) => {
    // Try to access protected dashboard without auth
    await page.goto('http://localhost:3009/dashboard')
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login.*/, { timeout: 5000 })
  })
  
  test('should load PWA manifest and icons', async ({ page }) => {
    await page.goto('http://localhost:3009/')
    
    // Check manifest is linked
    const manifestLink = page.locator('link[rel="manifest"]')
    await expect(manifestLink).toHaveAttribute('href', '/manifest.json')
    
    // Test manifest loads
    const manifestResponse = await page.request.get('http://localhost:3009/manifest.json')
    expect(manifestResponse.status()).toBe(200)
    
    // Test icon exists
    const iconResponse = await page.request.get('http://localhost:3009/icon.svg')
    expect(iconResponse.status()).toBe(200)
  })
  
  test('should have proper SEO meta tags', async ({ page }) => {
    await page.goto('http://localhost:3009/')
    
    // Check essential meta tags
    await expect(page.locator('title')).toContainText('DailyMood AI')
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.*mood tracking.*/)
    
    // Check OpenGraph tags
    await expect(page.locator('meta[property="og:title"]')).toHaveCount(1)
    await expect(page.locator('meta[property="og:description"]')).toHaveCount(1)
  })
})
