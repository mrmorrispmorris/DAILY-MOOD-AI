#!/usr/bin/env node

/**
 * Environment Setup Checker for DailyMood AI
 * Validates all required environment variables for Stripe integration
 */

const fs = require('fs')
const path = require('path')

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

function checkEnvironmentVariables() {
  log('blue', '\n🔍 CHECKING ENVIRONMENT SETUP...\n')
  
  // Load environment variables
  const envPath = path.join(process.cwd(), '.env.local')
  
  if (!fs.existsSync(envPath)) {
    log('red', '❌ CRITICAL: .env.local file not found!')
    log('yellow', '\n📋 SOLUTION:')
    log('reset', '   1. Create .env.local file in project root')
    log('reset', '   2. Follow STRIPE_SETUP.md guide')
    log('reset', '   3. Run: npm run check-env\n')
    return false
  }
  
  log('green', '✅ .env.local file found')
  
  // Load .env.local
  const envContent = fs.readFileSync(envPath, 'utf8')
  const envVars = {}
  
  envContent.split('\n').forEach(line => {
    const [key, value] = line.split('=')
    if (key && value) {
      envVars[key.trim()] = value.trim()
    }
  })
  
  // Required variables
  const required = {
    // Supabase
    'SUPABASE_URL': 'Supabase project URL',
    'SUPABASE_ANON_KEY': 'Supabase anonymous key',
    'SUPABASE_SERVICE_ROLE_KEY': 'Supabase service role key',
    
    // Stripe
    'STRIPE_SECRET_KEY': 'Stripe secret key (sk_test_...)',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY': 'Stripe publishable key (pk_test_...)',
    'STRIPE_PRICE_ID': 'Stripe price ID (price_...)',
    'STRIPE_WEBHOOK_SECRET': 'Stripe webhook secret (whsec_...)',
    
    // App
    'NEXT_PUBLIC_URL': 'App URL (http://localhost:3000)'
  }
  
  let allValid = true
  let warnings = []
  
  console.log('')
  Object.entries(required).forEach(([key, description]) => {
    if (!envVars[key]) {
      log('red', `❌ MISSING: ${key}`)
      log('reset', `   ${description}`)
      allValid = false
    } else if (envVars[key].includes('your_') || envVars[key].includes('test_')) {
      log('yellow', `⚠️  PLACEHOLDER: ${key}`)
      log('reset', `   Value looks like placeholder: ${envVars[key]}`)
      warnings.push(key)
    } else {
      log('green', `✅ ${key}`)
    }
  })
  
  console.log('')
  
  if (!allValid) {
    log('red', '🚫 SETUP INCOMPLETE!')
    log('yellow', '\n📋 NEXT STEPS:')
    log('reset', '   1. Follow STRIPE_SETUP.md guide')
    log('reset', '   2. Get credentials from Stripe Dashboard')  
    log('reset', '   3. Run: npm run check-env')
    return false
  }
  
  if (warnings.length > 0) {
    log('yellow', '⚠️  WARNINGS DETECTED!')
    log('reset', '   Some values look like placeholders')
    log('reset', '   Update them with real Stripe credentials')
    log('yellow', '\n📋 GET REAL VALUES:')
    log('reset', '   • Stripe Dashboard: https://dashboard.stripe.com')
    log('reset', '   • API Keys: Developers → API keys')
    log('reset', '   • Price ID: Products → Your Product')
    return false
  }
  
  log('green', '🎉 ENVIRONMENT SETUP COMPLETE!')
  log('blue', '\n🚀 READY FOR STRIPE INTEGRATION!')
  log('reset', '\n✅ Next steps:')
  log('reset', '   1. Run: npm run dev')
  log('reset', '   2. Visit: http://localhost:3000/pricing')
  log('reset', '   3. Test subscription flow')
  log('reset', '\n💰 Ready for $10K/month revenue generation!')
  
  return true
}

// Validate Stripe key formats
function validateStripeKeys() {
  const stripeSecret = process.env.STRIPE_SECRET_KEY
  const stripePublishable = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  const stripePriceId = process.env.STRIPE_PRICE_ID
  
  if (stripeSecret && !stripeSecret.startsWith('sk_')) {
    log('yellow', '⚠️  Stripe Secret Key should start with "sk_"')
  }
  
  if (stripePublishable && !stripePublishable.startsWith('pk_')) {
    log('yellow', '⚠️  Stripe Publishable Key should start with "pk_"')  
  }
  
  if (stripePriceId && !stripePriceId.startsWith('price_')) {
    log('yellow', '⚠️  Stripe Price ID should start with "price_"')
  }
}

// Main execution
if (require.main === module) {
  const isValid = checkEnvironmentVariables()
  
  if (isValid) {
    validateStripeKeys()
  }
  
  process.exit(isValid ? 0 : 1)
}

module.exports = { checkEnvironmentVariables }
