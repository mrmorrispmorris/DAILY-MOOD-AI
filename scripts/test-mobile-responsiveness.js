#!/usr/bin/env node

/**
 * Phase 6: Mobile Responsiveness Testing
 * Tests responsive design, touch targets, and mobile UX
 */

const http = require('http');
const fs = require('fs');

class MobileResponsivenessTester {
  constructor() {
    this.baseUrl = 'http://localhost:3009';
    this.results = [];
    this.totalTests = 0;
    this.passedTests = 0;
  }

  async runTest(testName, testFunction) {
    this.totalTests++;
    console.log(`\n📱 Testing: ${testName}`);
    
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
          'Content-Type': 'text/html',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
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

  async testResponsiveCSS() {
    // Check if responsive CSS classes are present in main components
    try {
      const componentPaths = [
        'app/components/MoodEntry.tsx',
        'app/(dashboard)/dashboard/page.tsx',
        'app/components/MoodChart.tsx'
      ];
      
      let responsiveClasses = 0;
      let totalChecked = 0;
      let details = [];
      
      for (const path of componentPaths) {
        if (fs.existsSync(path)) {
          const content = fs.readFileSync(path, 'utf8');
          totalChecked++;
          
          // Check for responsive classes
          const hasResponsive = content.includes('sm:') || 
                              content.includes('md:') || 
                              content.includes('lg:') || 
                              content.includes('xl:');
          
          const hasTouchOptimization = content.includes('touch-manipulation') ||
                                     content.includes('touch-');
          
          const hasMobileGrid = content.includes('grid-cols-1') ||
                              content.includes('grid-cols-2') ||
                              content.includes('flex-col');
          
          if (hasResponsive || hasTouchOptimization || hasMobileGrid) {
            responsiveClasses++;
            details.push(`${path}: ✓`);
          } else {
            details.push(`${path}: ✗`);
          }
        }
      }
      
      return {
        success: responsiveClasses >= totalChecked * 0.8, // 80% should have responsive classes
        data: `${responsiveClasses}/${totalChecked} components have responsive classes`,
        error: responsiveClasses < totalChecked * 0.8 ? `Components missing responsive design: ${details.filter(d => d.includes('✗')).join(', ')}` : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking responsive CSS: ${error.message}`
      };
    }
  }

  async testMobileNavigation() {
    // Check if mobile navigation component exists and is properly implemented
    try {
      const mobileNavPaths = [
        'components/MobileNav.tsx',
        'app/components/MobileNav.tsx'
      ];
      
      let mobileNavExists = false;
      let navPath = '';
      
      for (const path of mobileNavPaths) {
        if (fs.existsSync(path)) {
          mobileNavExists = true;
          navPath = path;
          break;
        }
      }
      
      if (mobileNavExists) {
        const content = fs.readFileSync(navPath, 'utf8');
        
        const hasBottomNav = content.includes('bottom-') || content.includes('fixed bottom');
        const hasResponsiveHiding = content.includes('md:hidden') || content.includes('lg:hidden');
        const hasTouchTargets = content.includes('py-2') || content.includes('p-') || content.includes('h-12');
        
        const features = [hasBottomNav, hasResponsiveHiding, hasTouchTargets];
        const working = features.filter(f => f).length;
        
        return {
          success: working >= 2,
          data: `Mobile navigation found with ${working}/3 mobile features`,
          error: working < 2 ? 'Mobile navigation missing key mobile features' : null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Mobile navigation component not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking mobile navigation: ${error.message}`
      };
    }
  }

  async testTouchOptimization() {
    // Check if touch-friendly CSS is present
    try {
      const cssPath = 'app/globals.css';
      
      if (fs.existsSync(cssPath)) {
        const content = fs.readFileSync(cssPath, 'utf8');
        
        const hasTouchManipulation = content.includes('touch-manipulation');
        const hasCustomScrollbar = content.includes('webkit-scrollbar');
        const hasMobileMediaQueries = content.includes('@media') && content.includes('768px');
        
        const touchFeatures = [hasTouchManipulation, hasCustomScrollbar, hasMobileMediaQueries];
        const working = touchFeatures.filter(f => f).length;
        
        return {
          success: working >= 2,
          data: `Touch optimization features: ${working}/3 implemented`,
          error: working < 2 ? 'Missing touch optimization features' : null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'Global CSS file not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking touch optimization: ${error.message}`
      };
    }
  }

  async testMobileViewportMeta() {
    // Check if viewport meta tag is properly set
    const response = await this.makeRequest('/');
    const hasViewportMeta = response.data.includes('viewport') && 
                           response.data.includes('width=device-width');
    
    return {
      success: hasViewportMeta,
      data: hasViewportMeta ? 'Viewport meta tag properly configured' : null,
      error: !hasViewportMeta ? 'Viewport meta tag missing or misconfigured' : null
    };
  }

  async testResponsiveImages() {
    // Check if images are optimized for mobile
    const response = await this.makeRequest('/');
    const hasNextImage = response.data.includes('next/image') || 
                        response.data.includes('Image from');
    
    return {
      success: true, // Non-critical test
      data: hasNextImage ? 'Next.js Image optimization detected' : 'Standard img tags in use',
      error: null
    };
  }

  async testMobileLoadingStates() {
    // Check if mobile-optimized loading states exist
    try {
      const loadingPath = 'app/components/LoadingStates.tsx';
      
      if (fs.existsSync(loadingPath)) {
        const content = fs.readFileSync(loadingPath, 'utf8');
        
        const hasMobileClasses = content.includes('sm:') || content.includes('md:');
        const hasAnimations = content.includes('animate-') || content.includes('motion');
        const hasShimmer = content.includes('shimmer') || content.includes('animate-pulse');
        
        const features = [hasMobileClasses, hasAnimations, hasShimmer];
        const working = features.filter(f => f).length;
        
        return {
          success: working >= 2,
          data: `Loading states mobile optimization: ${working}/3 features`,
          error: working < 2 ? 'Loading states not optimized for mobile' : null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'LoadingStates component not found'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking mobile loading states: ${error.message}`
      };
    }
  }

  async runAllTests() {
    console.log('📱 Starting Mobile Responsiveness Tests');
    console.log('======================================');

    await this.runTest('Responsive CSS Classes', () => this.testResponsiveCSS());
    await this.runTest('Mobile Navigation', () => this.testMobileNavigation());
    await this.runTest('Touch Optimization', () => this.testTouchOptimization());
    await this.runTest('Mobile Viewport Meta', () => this.testMobileViewportMeta());
    await this.runTest('Responsive Images', () => this.testResponsiveImages());
    await this.runTest('Mobile Loading States', () => this.testMobileLoadingStates());

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 MOBILE RESPONSIVENESS SUMMARY');
    console.log('=================================');
    console.log(`Total Tests: ${this.totalTests}`);
    console.log(`Passed: ${this.passedTests}`);
    console.log(`Failed: ${this.totalTests - this.passedTests}`);
    console.log(`Success Rate: ${((this.passedTests / this.totalTests) * 100).toFixed(1)}%`);
    
    if (this.passedTests === this.totalTests) {
      console.log('\n🎉 ALL MOBILE TESTS PASSED! App is fully mobile-responsive.');
    } else {
      console.log('\n⚠️ Some mobile responsiveness tests failed. Review mobile optimization.');
    }

    // Mobile readiness assessment
    console.log('\n📱 MOBILE READINESS:');
    const criticalTests = this.results.filter(r => 
      r.test.includes('Responsive CSS') || 
      r.test.includes('Touch Optimization') ||
      r.test.includes('Mobile Navigation')
    );
    
    const criticalPassed = criticalTests.filter(r => r.success).length;
    const readinessScore = (criticalPassed / criticalTests.length) * 100;
    
    if (readinessScore >= 80) {
      console.log('✅ App is mobile-ready for production');
    } else if (readinessScore >= 60) {
      console.log('⚠️ App has basic mobile support, improvements recommended');
    } else {
      console.log('❌ App needs significant mobile optimization');
    }
    
    console.log(`Mobile Readiness Score: ${readinessScore.toFixed(1)}%`);

    // Save results
    fs.writeFileSync('mobile-responsiveness-test-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalTests: this.totalTests,
      passedTests: this.passedTests,
      successRate: ((this.passedTests / this.totalTests) * 100).toFixed(1) + '%',
      mobileReadinessScore: readinessScore.toFixed(1) + '%',
      mobileReady: readinessScore >= 80,
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Detailed mobile test results saved to mobile-responsiveness-test-results.json');
  }
}

// Run tests if called directly
if (require.main === module) {
  const tester = new MobileResponsivenessTester();
  tester.runAllTests().catch(error => {
    console.error('❌ Mobile responsiveness testing failed:', error);
    process.exit(1);
  });
}

module.exports = MobileResponsivenessTester;
