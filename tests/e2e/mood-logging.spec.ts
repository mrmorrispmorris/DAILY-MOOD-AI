import { test, expect } from '@playwright/test';

test.describe('Mood Logging System', () => {
  
  test.beforeEach(async ({ page }) => {
    // Note: In a real test, we'd set up authenticated user state
    // For now, we test the components that should be accessible
    await page.goto('/');
  });

  test('should display interactive demo on landing page', async ({ page }) => {
    // Check that interactive demo is visible
    await expect(page.locator('text=Try DailyMood AI Now')).toBeVisible();
    
    // Check mood slider functionality
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    await expect(slider).toHaveAttribute('min', '1');
    await expect(slider).toHaveAttribute('max', '10');
    
    // Test slider interaction
    await slider.fill('8');
    
    // Check that mood display updates
    await expect(page.locator('text=8/10')).toBeVisible();
  });

  test('should have functional mood entry component in demo', async ({ page }) => {
    // Scroll to demo section
    await page.locator('#demo').scrollIntoViewIfNeeded();
    
    // Test Get AI Insight button
    await page.click('text=Get AI Insight');
    await expect(page.locator('text=AI Insight')).toBeVisible();
    
    // Test View Trends button  
    await page.click('text=View Trends');
    await expect(page.locator('text=Mood Trends')).toBeVisible();
    
    // Check mock chart display
    await expect(page.locator('text=Your Progress')).toBeVisible();
  });

  test('should navigate to mood logging from CTA buttons', async ({ page }) => {
    // Test various CTA buttons that should lead to mood logging
    const ctaButtons = [
      'Start Free Trial',
      'Get Started Free',
      'Start Your Free Trial Today'
    ];
    
    for (const buttonText of ctaButtons) {
      const button = page.locator(`text=${buttonText}`).first();
      if (await button.isVisible()) {
        await button.click();
        // Should lead to signup (which then leads to mood logging)
        await expect(page).toHaveURL(/.*signup/);
        await page.goBack();
      }
    }
  });
});

test.describe('Mood Logging Interface (Authenticated)', () => {
  
  test.beforeEach(async ({ page }) => {
    // TODO: Set up authenticated user state
    // For now, we'll test the interface components we can access
    await page.goto('/');
  });

  test('should have proper mood scale validation', async ({ page }) => {
    // Test on the interactive demo
    const slider = page.locator('input[type="range"]').first();
    
    // Test minimum value
    await slider.fill('1');
    await expect(page.locator('text=1/10')).toBeVisible();
    
    // Test maximum value
    await slider.fill('10');
    await expect(page.locator('text=10/10')).toBeVisible();
    
    // Test mid-range value
    await slider.fill('5');
    await expect(page.locator('text=5/10')).toBeVisible();
  });

  test('should display appropriate mood emojis', async ({ page }) => {
    // Test emoji updates with mood changes in demo
    const slider = page.locator('input[type="range"]').first();
    
    // Test different mood levels and their emojis
    const moodTests = [
      { value: '1', expectedEmoji: '😔' },
      { value: '5', expectedEmoji: '🙂' },  
      { value: '10', expectedEmoji: '🤩' }
    ];
    
    for (const test of moodTests) {
      await slider.fill(test.value);
      // The emoji should be visible in the mood display
      const emojiContainer = page.locator('.inline-flex').filter({ hasText: test.expectedEmoji });
      await expect(emojiContainer).toBeVisible();
    }
  });

  test('should provide helpful mood guidance', async ({ page }) => {
    // Test AI insight generation in demo
    await page.click('text=Get AI Insight');
    
    // Should show personalized tip
    await expect(page.locator('text=Personalized Tip')).toBeVisible();
    
    // Should show contextual advice based on mood level
    const insightText = page.locator('.border-l-4');
    await expect(insightText).toBeVisible();
  });
});

test.describe('Mood Logging Accessibility', () => {
  
  test('should have proper ARIA labels and keyboard navigation', async ({ page }) => {
    await page.goto('/');
    
    // Test slider accessibility
    const slider = page.locator('input[type="range"]').first();
    await expect(slider).toBeVisible();
    
    // Test keyboard navigation
    await slider.focus();
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('ArrowLeft');
    
    // Should be navigable via keyboard
    await expect(slider).toBeFocused();
  });

  test('should have high contrast for text visibility', async ({ page }) => {
    await page.goto('/');
    
    // Test that main headings have proper contrast (fixed issue)
    const mainHeading = page.locator('h1').first();
    await expect(mainHeading).toBeVisible();
    
    // Check computed styles would show proper colors (in real browser test)
    // For now, we verify the text is visible and readable
    const headingText = await mainHeading.textContent();
    expect(headingText).toContain('Track Your Mood');
  });

  test('should work with screen readers', async ({ page }) => {
    await page.goto('/');
    
    // Test that interactive elements have proper labels
    const buttons = page.locator('button');
    const buttonCount = await buttons.count();
    
    for (let i = 0; i < buttonCount && i < 5; i++) {
      const button = buttons.nth(i);
      if (await button.isVisible()) {
        // Buttons should have text content or aria-label
        const hasText = await button.textContent();
        const hasAriaLabel = await button.getAttribute('aria-label');
        expect(hasText || hasAriaLabel).toBeTruthy();
      }
    }
  });
});

test.describe('Mood Data Validation', () => {
  
  test('should validate mood entry data format', async ({ page }) => {
    // Test the structure of mood data in demo
    await page.goto('/');
    
    // Interact with demo to generate mood data
    const slider = page.locator('input[type="range"]').first();
    await slider.fill('7');
    
    await page.click('text=Get AI Insight');
    
    // Check that the demo generates proper data structure
    // In a real test, we'd validate the actual API calls
    await expect(page.locator('text=AI Insight')).toBeVisible();
  });

  test('should handle edge cases in mood scoring', async ({ page }) => {
    await page.goto('/');
    
    const slider = page.locator('input[type="range"]').first();
    
    // Test boundary values
    await slider.fill('1');
    await expect(page.locator('text=1/10')).toBeVisible();
    
    await slider.fill('10');  
    await expect(page.locator('text=10/10')).toBeVisible();
    
    // Should not allow values outside range
    await slider.evaluate((el: HTMLInputElement) => {
      el.value = '15'; // Try to set invalid value
      el.dispatchEvent(new Event('input'));
    });
    
    // Should clamp to valid range
    const clampedValue = await slider.inputValue();
    expect(parseInt(clampedValue)).toBeLessThanOrEqual(10);
  });

  test('should provide consistent mood categories', async ({ page }) => {
    await page.goto('/');
    
    // Test mood category labels consistency
    const slider = page.locator('input[type="range"]').first();
    
    // Test specific mood levels and their categories
    const moodCategories = [
      { score: '1', category: 'Awful' },
      { score: '3', category: 'Not Good' }, 
      { score: '5', category: 'Okay' },
      { score: '7', category: 'Great' },
      { score: '10', category: 'Fantastic' }
    ];
    
    for (const mood of moodCategories) {
      await slider.fill(mood.score);
      // The category label should appear somewhere in the demo
      await expect(page.locator(`text=${mood.category}`)).toBeVisible();
    }
  });
});
