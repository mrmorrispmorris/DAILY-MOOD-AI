#!/usr/bin/env node

/**
 * Phase 6: Core Functionality Testing Script
 * Tests critical user flows and API endpoints
 */

const https = require('https');
const http = require('http');

class CoreFunctionalityTester {
  constructor() {
    this.baseUrl = 'http://localhost:3009';
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n🧪 Testing: ${testName}`);
    
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

  async makeRequest(path, method = 'GET') {
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
      req.end();
    });
  }

  async testServerHealth() {
    const response = await this.makeRequest('/');
    return {
      success: response.statusCode === 200,
      data: `Server responding with status ${response.statusCode}`,
      error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
    };
  }

  async testDashboardAccess() {
    const response = await this.makeRequest('/dashboard');
    return {
      success: response.statusCode === 200 || response.statusCode === 302,
      data: `Dashboard accessible with status ${response.statusCode}`,
      error: (response.statusCode !== 200 && response.statusCode !== 302) ? 
        `Expected 200/302, got ${response.statusCode}` : null
    };
  }

  async testAPIEndpoints() {
    const endpoints = [
      '/api/health',
      '/api/stripe/checkout',  
      '/api/ai-insights'
    ];
    
    let passed = 0;
    let errors = [];

    for (const endpoint of endpoints) {
      try {
        const response = await this.makeRequest(endpoint);
        if (response.statusCode < 500) {
          passed++;
        } else {
          errors.push(`${endpoint}: ${response.statusCode}`);
        }
      } catch (error) {
        errors.push(`${endpoint}: ${error.message}`);
      }
    }

    return {
      success: passed === endpoints.length,
      data: `${passed}/${endpoints.length} API endpoints accessible`,
      error: errors.length > 0 ? errors.join(', ') : null
    };
  }

  async testStaticAssets() {
    const assets = [
      '/manifest.json',
      '/favicon.ico'
    ];
    
    let passed = 0;
    let errors = [];

    for (const asset of assets) {
      try {
        const response = await this.makeRequest(asset);
        if (response.statusCode === 200) {
          passed++;
        } else {
          errors.push(`${asset}: ${response.statusCode}`);
        }
      } catch (error) {
        errors.push(`${asset}: ${error.message}`);
      }
    }

    return {
      success: passed === assets.length,
      data: `${passed}/${assets.length} static assets loading correctly`,
      error: errors.length > 0 ? errors.join(', ') : null
    };
  }

  async testPricingPage() {
    const response = await this.makeRequest('/pricing');
    return {
      success: response.statusCode === 200,
      data: `Pricing page loads with status ${response.statusCode}`,
      error: response.statusCode !== 200 ? `Expected 200, got ${response.statusCode}` : null
    };
  }

  async runAllTests() {
    console.log('🚀 Starting Core Functionality Tests');
    console.log('=====================================');

    await this.runTest('Server Health Check', () => this.testServerHealth());
    await this.runTest('Dashboard Access', () => this.testDashboardAccess());  
    await this.runTest('API Endpoints', () => this.testAPIEndpoints());
    await this.runTest('Static Assets', () => this.testStaticAssets());
    await this.runTest('Pricing Page', () => this.testPricingPage());

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 TESTING SUMMARY');
    console.log('==================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 ALL TESTS PASSED! Core functionality is working correctly.');
    } else {
      console.log('\n⚠️ Some tests failed. Review the results above.');
    }

    // Write detailed results
    const fs = require('fs');
    fs.writeFileSync('test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1) + '%',
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Detailed results saved to test-results.json');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new CoreFunctionalityTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Testing failed:', error);
    process.exit(1);
  });
}

module.exports = CoreFunctionalityTester;
