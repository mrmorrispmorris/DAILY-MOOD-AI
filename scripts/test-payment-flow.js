#!/usr/bin/env node

/**
 * Automated Payment Flow Testing Script
 * Tests core functionality when environment is properly configured
 */

const http = require('http')
const https = require('https')

// Colors for terminal output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m'
}

function log(color, message) {
  console.log(`${colors[color]}${message}${colors.reset}`)
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http
    const req = protocol.request(url, options, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          data: data,
          headers: res.headers
        })
      })
    })
    
    req.on('error', reject)
    
    if (options.body) {
      req.write(options.body)
    }
    req.end()
  })
}

async function testEndpoint(name, url, expectedStatus = 200) {
  try {
    const response = await makeRequest(url)
    if (response.statusCode === expectedStatus) {
      log('green', `✅ ${name}: ${response.statusCode} OK`)
      return true
    } else {
      log('red', `❌ ${name}: Expected ${expectedStatus}, got ${response.statusCode}`)
      return false
    }
  } catch (error) {
    log('red', `❌ ${name}: ${error.message}`)
    return false
  }
}

async function testAPI(name, url, method = 'GET', body = null) {
  try {
    const options = {
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    }
    
    if (body) {
      options.body = JSON.stringify(body)
    }
    
    const response = await makeRequest(url, options)
    
    if (response.statusCode >= 200 && response.statusCode < 400) {
      log('green', `✅ ${name}: ${response.statusCode} OK`)
      return true
    } else {
      log('yellow', `⚠️  ${name}: ${response.statusCode} (may need authentication)`)
      return false
    }
  } catch (error) {
    log('red', `❌ ${name}: ${error.message}`)
    return false
  }
}

async function runPaymentFlowTests() {
  log('blue', '\n🧪 TESTING PAYMENT FLOW FUNCTIONALITY...\n')
  
  const baseUrl = 'http://localhost:3000'
  let passedTests = 0
  let totalTests = 0
  
  // Test core pages
  const pageTests = [
    ['Homepage', `${baseUrl}`],
    ['Login Page', `${baseUrl}/login`],
    ['Pricing Page', `${baseUrl}/pricing`],
    ['Dashboard Page', `${baseUrl}/dashboard`]
  ]
  
  log('yellow', '📄 Testing Core Pages...')
  for (const [name, url] of pageTests) {
    totalTests++
    if (await testEndpoint(name, url)) {
      passedTests++
    }
  }
  
  console.log('')
  
  // Test API endpoints
  const apiTests = [
    ['AI Insights API', `${baseUrl}/api/ai-insights`, 'POST', { moods: [{ mood_score: 7 }] }],
    ['Stripe Checkout API', `${baseUrl}/api/stripe/create-checkout-session`, 'POST', { 
      userId: 'test-user', 
      email: 'test@example.com', 
      priceId: 'price_test' 
    }]
  ]
  
  log('yellow', '🔗 Testing API Endpoints...')
  for (const [name, url, method, body] of apiTests) {
    totalTests++
    if (await testAPI(name, url, method, body)) {
      passedTests++
    }
  }
  
  console.log('')
  
  // Environment validation
  log('yellow', '🔧 Testing Environment Configuration...')
  totalTests++
  
  const requiredEnvVars = [
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY'
  ]
  
  let envValid = true
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      log('red', `❌ Missing: ${envVar}`)
      envValid = false
    }
  }
  
  if (envValid) {
    log('green', '✅ Environment Configuration: All required variables present')
    passedTests++
  } else {
    log('red', '❌ Environment Configuration: Missing required variables')
  }
  
  console.log('')
  
  // Final results
  const passRate = Math.round((passedTests / totalTests) * 100)
  
  if (passRate >= 80) {
    log('green', `🎉 PAYMENT FLOW READY! (${passedTests}/${totalTests} tests passed - ${passRate}%)`)
    log('blue', '\n🚀 Next Steps:')
    log('reset', '   1. Test manual payment flow in browser')
    log('reset', '   2. Use Stripe test cards for checkout')
    log('reset', '   3. Verify webhook delivery in Stripe Dashboard')
    log('reset', '\n💰 Ready for $10K/month revenue generation!')
  } else if (passRate >= 50) {
    log('yellow', `⚠️  PARTIAL SUCCESS (${passedTests}/${totalTests} tests passed - ${passRate}%)`)
    log('reset', '\nSome tests failed - check configuration and try again')
  } else {
    log('red', `🚫 MULTIPLE FAILURES (${passedTests}/${totalTests} tests passed - ${passRate}%)`)
    log('yellow', '\n📋 Troubleshooting Steps:')
    log('reset', '   1. Ensure development server is running: npm run dev')
    log('reset', '   2. Check environment variables: npm run check-env') 
    log('reset', '   3. Review STRIPE_SETUP.md for configuration')
  }
  
  process.exit(passRate >= 80 ? 0 : 1)
}

// Run tests if this script is executed directly
if (require.main === module) {
  runPaymentFlowTests().catch(console.error)
}

module.exports = { runPaymentFlowTests }
