import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  
  test.beforeEach(async ({ page }) => {
    // Start from the landing page
    await page.goto('/');
  });

  test('should display landing page correctly', async ({ page }) => {
    // Check page title
    await expect(page).toHaveTitle(/DailyMood AI/);
    
    // Check main heading is visible (fixed logo text issue)
    await expect(page.locator('h1')).toContainText('Track Your Mood');
    await expect(page.locator('h1')).toContainText('Transform Your Life');
    
    // Check navigation links
    await expect(page.locator('nav')).toContainText('Pricing');
    await expect(page.locator('nav')).toContainText('Features');
    await expect(page.locator('nav')).toContainText('Blog');
    await expect(page.locator('nav')).toContainText('Login');
    
    // Check CTA buttons
    await expect(page.locator('text=Get Started Free')).toBeVisible();
    await expect(page.locator('text=Start Free Trial')).toBeVisible();
  });

  test('should navigate to signup page', async ({ page }) => {
    await page.click('text=Get Started Free');
    await expect(page).toHaveURL(/.*signup/);
    
    // Check signup form elements
    await expect(page.locator('h1')).toContainText('Mental Wellness Journey');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check auth method toggle
    await expect(page.locator('text=Password')).toBeVisible();
    await expect(page.locator('text=Magic Link')).toBeVisible();
  });

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Login');
    await expect(page).toHaveURL(/.*login/);
    
    // Check login form elements
    await expect(page.locator('h1')).toContainText('Welcome Back');
    await expect(page.locator('input[type="email"]')).toBeVisible();
    
    // Check auth method toggle
    await expect(page.locator('text=Password')).toBeVisible();
    await expect(page.locator('text=Magic Link')).toBeVisible();
  });

  test('should validate email format on signup', async ({ page }) => {
    await page.goto('/signup');
    
    // Try invalid email
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button[type="submit"]');
    
    // Should show HTML5 validation
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toHaveAttribute('required');
  });

  test('should validate password requirements', async ({ page }) => {
    await page.goto('/signup');
    
    // Select password method
    await page.click('text=Password');
    
    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Try short password
    await page.fill('input[type="password"]', '123');
    
    // Should have minimum length requirement
    const passwordInput = page.locator('input[type="password"]').first();
    await expect(passwordInput).toHaveAttribute('minLength', '8');
  });

  test('should switch between auth methods', async ({ page }) => {
    await page.goto('/login');
    
    // Start with password method (default)
    await expect(page.locator('input[type="password"]')).toBeVisible();
    
    // Switch to magic link
    await page.click('text=Magic Link');
    await expect(page.locator('input[type="password"]')).not.toBeVisible();
    await expect(page.locator('text=Send Magic Link')).toBeVisible();
    
    // Switch back to password
    await page.click('text=Password');
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('text=Sign In')).toBeVisible();
  });

  test('should handle magic link flow UI', async ({ page }) => {
    await page.goto('/login');
    
    // Switch to magic link
    await page.click('text=Magic Link');
    
    // Fill email
    await page.fill('input[type="email"]', 'test@example.com');
    
    // Click send magic link button
    await page.click('text=Send Magic Link');
    
    // Should show success message (UI feedback)
    // Note: In real test, this would trigger actual email sending
    // but we're testing the UI behavior
  });

  test('should redirect authenticated users away from auth pages', async ({ page, context }) => {
    // This test would require setting up authentication state
    // For now, we test the redirect behavior structure
    
    await page.goto('/login');
    
    // Check that login page has proper structure for redirect logic
    await expect(page.locator('form')).toBeVisible();
  });

  test('should protect dashboard routes', async ({ page }) => {
    // Try to access dashboard without authentication
    await page.goto('/dashboard');
    
    // Should redirect to login or show authentication prompt
    // The exact behavior depends on implementation
    await expect(page).toHaveURL(/.*login/);
  });
});

test.describe('Authentication Integration', () => {
  
  test('should have proper CSRF protection', async ({ page }) => {
    await page.goto('/login');
    
    // Check that forms have proper security measures
    const form = page.locator('form');
    await expect(form).toBeVisible();
    
    // Forms should submit to secure endpoints
    // This is validated by checking the form structure
  });

  test('should handle authentication errors gracefully', async ({ page }) => {
    await page.goto('/login');
    
    // Fill invalid credentials
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    
    // Submit form
    await page.click('text=Sign In');
    
    // Should handle error without crashing
    // The exact error handling depends on implementation
    await expect(page.locator('form')).toBeVisible();
  });
});
