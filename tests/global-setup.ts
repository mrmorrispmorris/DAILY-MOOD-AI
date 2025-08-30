import { chromium, FullConfig } from '@playwright/test';
import dotenv from 'dotenv';

async function globalSetup(config: FullConfig) {
  // Load environment variables for testing
  dotenv.config({ path: '.env.test' });
  
  console.log('🧪 Setting up global test environment...');
  
  // Create a browser instance for shared setup
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Wait for the application to be ready
    const baseURL = config.projects[0].use.baseURL || 'http://localhost:3009';
    console.log(`📡 Checking if app is ready at ${baseURL}`);
    
    // Wait up to 60 seconds for the app to be ready
    let retries = 60;
    while (retries > 0) {
      try {
        await page.goto(baseURL, { timeout: 5000 });
        const title = await page.title();
        if (title.includes('DailyMood')) {
          console.log('✅ App is ready for testing');
          break;
        }
      } catch (error) {
        retries--;
        if (retries === 0) {
          throw new Error(`App not ready after 60 seconds: ${error}`);
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    // Setup test data if needed
    await setupTestData();
    
    console.log('🎯 Global setup complete');
    
  } catch (error) {
    console.error('❌ Global setup failed:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

async function setupTestData() {
  // Create test users, test data, etc.
  console.log('📝 Setting up test data...');
  
  // This would typically involve:
  // - Creating test user accounts
  // - Setting up test subscription data
  // - Creating sample mood entries
  // - Setting up mock Stripe data
  
  // For now, we'll just log that we're ready
  console.log('✅ Test data ready');
}

export default globalSetup;
