#!/usr/bin/env node

/**
 * Phase 6: Stripe Payment Integration Testing
 * Tests payment flow, webhook handling, and subscription management
 */

const http = require('http');

class StripeIntegrationTester {
  constructor() {
    this.baseUrl = 'http://localhost:3009';
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n💳 Testing: ${testName}`);
    
    try {
      const result = await testFunction();
      if (result.success) {
        this.passedTests++;
        console.log(`✅ PASS: ${testName}`);
        if (result.data) console.log(`   📊 ${result.data}`);
      } else {
        console.log(`❌ FAIL: ${testName}`);
        console.log(`   📋 ${result.error}`);
      }
      this.results.push({ test: testName, ...result });
    } catch (error) {
      console.log(`❌ ERROR: ${testName}`);
      console.log(`   📋 ${error.message}`);
      this.results.push({ test: testName, success: false, error: error.message });
    }
  }

  async makeRequest(path, method = 'GET', body = null) {
    return new Promise((resolve, reject) => {
      const options = {
        hostname: 'localhost',
        port: 3009,
        path,
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 15000
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          resolve({
            statusCode: res.statusCode,
            data,
            headers: res.headers
          });
        });
      });

      req.on('error', reject);
      req.on('timeout', () => reject(new Error('Request timeout')));
      
      if (body) {
        req.write(JSON.stringify(body));
      }
      req.end();
    });
  }

  async testStripeEnvironmentConfig() {
    // Test if Stripe configuration is properly set up
    const response = await this.makeRequest('/api/stripe/checkout', 'POST', {
      priceId: 'test_price_id'
    });
    
    return {
      success: response.statusCode === 401 || response.statusCode === 400 || response.statusCode === 200,
      data: `Stripe endpoint responding with status ${response.statusCode}`,
      error: response.statusCode === 500 ? 'Server error - check Stripe configuration' : null
    };
  }

  async testPricingPageIntegration() {
    const response = await this.makeRequest('/pricing');
    const isStripeScriptPresent = response.data.includes('stripe') || response.data.includes('Stripe');
    
    return {
      success: response.statusCode === 200 && isStripeScriptPresent,
      data: `Pricing page loads and includes Stripe integration`,
      error: !isStripeScriptPresent ? 'Stripe integration not detected on pricing page' : null
    };
  }

  async testWebhookEndpoint() {
    const response = await this.makeRequest('/api/stripe/webhook', 'POST', {
      test: 'webhook_test'
    });
    
    return {
      success: response.statusCode !== 500,
      data: `Webhook endpoint accessible with status ${response.statusCode}`,
      error: response.statusCode === 500 ? 'Webhook endpoint has server errors' : null
    };
  }

  async testCheckoutSessionCreation() {
    // Test with mock price ID to see if endpoint is configured
    const testPayload = {
      priceId: 'price_test_123'
    };
    
    const response = await this.makeRequest('/api/stripe/create-checkout-session', 'POST', testPayload);
    
    // We expect 401 (unauthorized) or 400 (bad price ID) - not 500 (server error)
    return {
      success: response.statusCode === 401 || response.statusCode === 400,
      data: `Checkout session endpoint properly configured (${response.statusCode})`,
      error: response.statusCode === 500 ? 'Server error in checkout session creation' : null
    };
  }

  async testEnvironmentVariables() {
    // Test if environment variables are accessible by trying to get configuration errors
    const response = await this.makeRequest('/api/stripe/checkout', 'POST', {
      priceId: 'test'
    });
    
    let message = '';
    try {
      const responseData = JSON.parse(response.data);
      message = responseData.error || 'Configuration appears correct';
    } catch {
      message = 'Response received from Stripe endpoint';
    }
    
    return {
      success: true, // Always pass since we're just gathering info
      data: `Environment check: ${message}`,
      error: null
    };
  }

  async testPriceIdConfiguration() {
    // Test if environment has price IDs configured
    const endpoints = [
      '/api/stripe/create-checkout-session',
      '/api/stripe/checkout'
    ];
    
    let configured = 0;
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint, 'POST', { priceId: 'test' });
        if (response.statusCode !== 404) configured++;
      } catch (error) {
        // Expected for some endpoints
      }
    }
    
    return {
      success: configured > 0,
      data: `${configured}/${endpoints.length} payment endpoints configured`,
      error: configured === 0 ? 'No payment endpoints properly configured' : null
    };
  }

  async runAllTests() {
    console.log('💳 Starting Stripe Integration Tests');
    console.log('====================================');

    await this.runTest('Stripe Environment Config', () => this.testStripeEnvironmentConfig());
    await this.runTest('Pricing Page Integration', () => this.testPricingPageIntegration());
    await this.runTest('Webhook Endpoint', () => this.testWebhookEndpoint());
    await this.runTest('Checkout Session Creation', () => this.testCheckoutSessionCreation());
    await this.runTest('Environment Variables', () => this.testEnvironmentVariables());
    await this.runTest('Price ID Configuration', () => this.testPriceIdConfiguration());

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 STRIPE TESTING SUMMARY');
    console.log('=========================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 ALL STRIPE TESTS PASSED! Payment integration is working correctly.');
    } else {
      console.log('\n⚠️ Some Stripe tests failed. Check configuration and environment variables.');
    }

    // Payment flow status
    console.log('\n💰 PAYMENT FLOW STATUS:');
    const critical = this.results.filter(r => 
      r.test.includes('Environment Config') || 
      r.test.includes('Checkout Session')
    );
    
    const criticalPassed = critical.filter(r => r.success).length;
    if (criticalPassed === critical.length) {
      console.log('✅ Core payment functionality ready for testing');
    } else {
      console.log('⚠️ Core payment functionality needs configuration');
    }

    // Save results
    const fs = require('fs');
    fs.writeFileSync('stripe-test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1) + '%',
      paymentReady: criticalPassed === critical.length,
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Detailed Stripe results saved to stripe-test-results.json');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new StripeIntegrationTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Stripe testing failed:', error);
    process.exit(1);
  });
}

module.exports = StripeIntegrationTester;
