#!/usr/bin/env node

/**
 * BugBot Review Progress Tracker
 * Helps track code quality review progress through priority files
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

// Priority files for BugBot review
const priorityFiles = [
  // Priority 1: Revenue-Critical
  { 
    file: 'app/api/stripe/create-checkout-session/route.ts',
    priority: 1,
    category: 'Revenue-Critical',
    focus: 'Payment processing, security, error handling'
  },
  {
    file: 'app/api/stripe/webhook/route.ts', 
    priority: 1,
    category: 'Revenue-Critical',
    focus: 'Webhook verification, subscription updates'
  },
  {
    file: 'hooks/use-subscription.ts',
    priority: 1, 
    category: 'Revenue-Critical',
    focus: 'Premium gating, billing consistency'
  },
  {
    file: 'app/components/PremiumGate.tsx',
    priority: 1,
    category: 'Revenue-Critical', 
    focus: 'Feature access, conversion optimization'
  },

  // Priority 2: Security & Auth
  {
    file: 'lib/security/rate-limit.ts',
    priority: 2,
    category: 'Security & Auth',
    focus: 'DDoS protection, API abuse prevention'
  },
  {
    file: 'lib/security/input-validation.ts',
    priority: 2,
    category: 'Security & Auth', 
    focus: 'Injection prevention, XSS protection'
  },
  {
    file: 'hooks/use-auth.ts',
    priority: 2,
    category: 'Security & Auth',
    focus: 'Authentication flow, session management'
  },
  {
    file: 'middleware.ts',
    priority: 2,
    category: 'Security & Auth',
    focus: 'Request filtering, security headers'
  },

  // Priority 3: Performance-Critical
  {
    file: 'app/(dashboard)/dashboard/page.tsx',
    priority: 3,
    category: 'Performance-Critical',
    focus: 'Code splitting, component optimization'
  },
  {
    file: 'app/api/ai-insights/route.ts',
    priority: 3,
    category: 'Performance-Critical', 
    focus: 'Response time, caching, memory usage'
  },

  // Priority 4: Architecture
  {
    file: 'app/(dashboard)/layout.tsx',
    priority: 4,
    category: 'Architecture',
    focus: 'Error boundaries, navigation optimization'
  },
  {
    file: 'lib/supabase/middleware.ts',
    priority: 4,
    category: 'Architecture',
    focus: 'Database efficiency, query optimization'
  }
]

function checkFileExists(filePath) {
  const fullPath = path.join(process.cwd(), filePath)
  return fs.existsSync(fullPath)
}

function displayReviewProgress() {
  log('blue', '\n🤖 BUGBOT CODE QUALITY REVIEW PROGRESS\n')

  let completedFiles = 0
  let totalFiles = priorityFiles.length

  // Group by priority
  const priorityGroups = priorityFiles.reduce((groups, file) => {
    const priority = `Priority ${file.priority}`
    if (!groups[priority]) groups[priority] = []
    groups[priority].push(file)
    return groups
  }, {})

  Object.entries(priorityGroups).forEach(([priority, files]) => {
    log('yellow', `\n${priority}: ${files[0].category}`)
    log('reset', '─'.repeat(50))

    files.forEach((fileInfo, index) => {
      const exists = checkFileExists(fileInfo.file)
      const status = exists ? '✅' : '❌'
      const fileNum = index + 1

      if (exists) {
        log('green', `${status} ${fileNum}. ${fileInfo.file}`)
        log('reset', `   Focus: ${fileInfo.focus}`)
        completedFiles++
      } else {
        log('red', `${status} ${fileNum}. ${fileInfo.file} (FILE NOT FOUND)`)
        log('reset', `   Focus: ${fileInfo.focus}`)
      }
    })
  })

  console.log('')

  // Progress summary
  const progressPercent = Math.round((completedFiles / totalFiles) * 100)
  
  if (progressPercent === 100) {
    log('green', `🎉 ALL FILES READY FOR BUGBOT REVIEW! (${completedFiles}/${totalFiles})`)
    log('blue', '\n📋 Next Steps:')
    log('reset', '   1. Open each file in Cursor (start with Priority 1)')
    log('reset', '   2. Look for BugBot red/yellow highlights')
    log('reset', '   3. Click light bulb icons for suggestions')
    log('reset', '   4. Apply fixes or document issues')
    log('reset', '\n💰 Goal: Bulletproof $10K/month revenue system!')
  } else {
    log('yellow', `⚠️  ${completedFiles}/${totalFiles} files ready (${progressPercent}%)`)
    log('red', 'Some priority files are missing - check file paths')
  }

  // Quick instructions
  log('blue', '\n🔍 BugBot Review Instructions:')
  log('reset', '   • Red squiggles = Critical issues (fix immediately)')
  log('reset', '   • Yellow highlights = Warnings (fix before production)')  
  log('reset', '   • Light bulbs 💡 = Click for suggestions')
  log('reset', '   • Focus on revenue-critical files first')

  return progressPercent >= 90
}

function showDetailedInstructions() {
  log('blue', '\n📖 DETAILED BUGBOT USAGE:')
  console.log('')
  
  priorityFiles.slice(0, 4).forEach((file, index) => {
    log('yellow', `${index + 1}. ${file.file}`)
    log('reset', `   💡 Ask BugBot: "Are there security issues in payment processing?"`)
    log('reset', `   🔍 Look for: ${file.focus}`)
    console.log('')
  })

  log('green', '🎯 For best results:')
  log('reset', '   • Review files in priority order')
  log('reset', '   • Apply critical fixes immediately')  
  log('reset', '   • Document any issues needing manual review')
  log('reset', '   • Test functionality after each fix')
}

// Main execution
if (require.main === module) {
  const isReady = displayReviewProgress()
  
  if (process.argv.includes('--detailed') || process.argv.includes('-d')) {
    showDetailedInstructions()
  }
  
  if (isReady) {
    process.exit(0)
  } else {
    process.exit(1)
  }
}

module.exports = { priorityFiles, displayReviewProgress }
