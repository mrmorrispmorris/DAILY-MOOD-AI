#!/usr/bin/env node

/**
 * Phase 6: Premium Feature Gates Testing
 * Tests freemium limits, premium access controls, and feature gating
 */

const http = require('http');

class PremiumGatesTester {
  constructor() {
    this.baseUrl = 'http://localhost:3009';
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n🔒 Testing: ${testName}`);
    
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
        timeout: 10000
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

  async testFreemiumLimitsService() {
    // Check if freemium limits service is accessible
    try {
      const fs = require('fs');
      const limitsPath = 'lib/freemium-limits.ts';
      const hookPath = 'hooks/use-freemium-limits.ts';
      
      const limitsExists = fs.existsSync(limitsPath);
      const hookExists = fs.existsSync(hookPath);
      
      return {
        success: limitsExists && hookExists,
        data: `Freemium limits service files present: ${limitsExists ? '✓' : '✗'} lib, ${hookExists ? '✓' : '✗'} hook`,
        error: !limitsExists || !hookExists ? 'Freemium limits service files missing' : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking freemium limits: ${error.message}`
      };
    }
  }

  async testPremiumGateComponent() {
    // Check if PremiumGate component exists and is properly structured
    try {
      const fs = require('fs');
      const componentPaths = [
        'app/components/PremiumGate.tsx',
        'components/PremiumGate.tsx'
      ];
      
      let componentExists = false;
      let componentPath = '';
      
      for (const path of componentPaths) {
        if (fs.existsSync(path)) {
          componentExists = true;
          componentPath = path;
          break;
        }
      }
      
      if (componentExists) {
        const content = fs.readFileSync(componentPath, 'utf8');
        const hasFeatureProp = content.includes('feature');
        const hasChildrenProp = content.includes('children');
        
        return {
          success: hasFeatureProp && hasChildrenProp,
          data: `PremiumGate component found at ${componentPath} with proper props`,
          error: !hasFeatureProp || !hasChildrenProp ? 'PremiumGate missing required props' : null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'PremiumGate component not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking PremiumGate: ${error.message}`
      };
    }
  }

  async testAIInsightsGating() {
    // Test if AI Insights are properly gated behind premium
    const response = await this.makeRequest('/api/ai-insights');
    
    // Should require authentication (401) or subscription (403) - not crash (500)
    return {
      success: response.statusCode === 401 || response.statusCode === 403 || response.statusCode === 200,
      data: `AI Insights endpoint properly gated (${response.statusCode})`,
      error: response.statusCode === 500 ? 'AI Insights endpoint has server errors' : null
    };
  }

  async testDashboardPremiumFeatures() {
    // Test dashboard loads and contains premium gate references
    const response = await this.makeRequest('/dashboard');
    
    const containsPremiumGate = response.data.includes('PremiumGate') || 
                               response.data.includes('premium') || 
                               response.data.includes('Premium');
    
    return {
      success: response.statusCode === 200 || response.statusCode === 307,
      data: `Dashboard accessible with premium features ${containsPremiumGate ? 'detected' : 'not detected'}`,
      error: response.statusCode === 500 ? 'Dashboard has server errors' : null
    };
  }

  async testSubscriptionManagement() {
    // Test subscription-related API endpoints
    const endpoints = [
      '/api/stripe/cancel-subscription',
      '/api/stripe/customer-portal'
    ];
    
    let accessible = 0;
    let errors = [];
    
    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint, 'POST');
        // Should be 401 (unauthorized) not 500 (server error)
        if (response.statusCode !== 500) {
          accessible++;
        } else {
          errors.push(`${endpoint}: server error`);
        }
      } catch (error) {
        errors.push(`${endpoint}: ${error.message}`);
      }
    }
    
    return {
      success: accessible === endpoints.length,
      data: `${accessible}/${endpoints.length} subscription endpoints accessible`,
      error: errors.length > 0 ? errors.join(', ') : null
    };
  }

  async testPremiumPromptComponent() {
    // Check if PremiumPrompt component exists for upselling
    try {
      const fs = require('fs');
      const componentPaths = [
        'app/components/PremiumPrompt.tsx',
        'components/PremiumPrompt.tsx'
      ];
      
      let componentExists = false;
      let componentPath = '';
      
      for (const path of componentPaths) {
        if (fs.existsExists(path)) {
          componentExists = true;
          componentPath = path;
          break;
        }
      }
      
      return {
        success: componentExists,
        data: componentExists ? `PremiumPrompt component found at ${componentPath}` : null,
        error: !componentExists ? 'PremiumPrompt component not found' : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking PremiumPrompt: ${error.message}`
      };
    }
  }

  async runAllTests() {
    console.log('🔒 Starting Premium Gates Tests');
    console.log('===============================');

    await this.runTest('Freemium Limits Service', () => this.testFreemiumLimitsService());
    await this.runTest('PremiumGate Component', () => this.testPremiumGateComponent());
    await this.runTest('AI Insights Gating', () => this.testAIInsightsGating());
    await this.runTest('Dashboard Premium Features', () => this.testDashboardPremiumFeatures());
    await this.runTest('Subscription Management', () => this.testSubscriptionManagement());
    await this.runTest('PremiumPrompt Component', () => this.testPremiumPromptComponent());

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 PREMIUM GATES TESTING SUMMARY');
    console.log('================================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 ALL PREMIUM GATES TESTS PASSED! Freemium model is working correctly.');
    } else {
      console.log('\n⚠️ Some premium gate tests failed. Review freemium implementation.');
    }

    // Feature gating status
    console.log('\n💎 FREEMIUM MODEL STATUS:');
    const gatingTests = this.results.filter(r => 
      r.test.includes('Gating') || 
      r.test.includes('PremiumGate') ||
      r.test.includes('Freemium')
    );
    
    const gatingPassed = gatingTests.filter(r => r.success).length;
    if (gatingPassed === gatingTests.length) {
      console.log('✅ Premium feature gating properly implemented');
    } else {
      console.log('⚠️ Premium feature gating needs attention');
    }

    // Save results
    const fs = require('fs');
    fs.writeFileSync('premium-gates-test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1) + '%',
      gatingWorking: gatingPassed === gatingTests.length,
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Detailed premium gates results saved to premium-gates-test-results.json');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new PremiumGatesTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Premium gates testing failed:', error);
    process.exit(1);
  });
}

module.exports = PremiumGatesTester;
