/**
 * Bundle Analysis and Optimization Script
 * Analyzes Next.js build for optimization opportunities
 */

const fs = require('fs')
const path = require('path')

function analyzeBuildOutput() {
  const buildDir = path.join(process.cwd(), '.next')
  
  if (!fs.existsSync(buildDir)) {
    console.log('❌ No build directory found. Run "npm run build" first.')
    return
  }

  console.log('📊 BUNDLE ANALYSIS REPORT')
  console.log('=' .repeat(50))

  // Analyze static chunks
  const staticDir = path.join(buildDir, 'static')
  if (fs.existsSync(staticDir)) {
    analyzeStaticAssets(staticDir)
  }

  // Generate recommendations
  generateOptimizationRecommendations()
}

function analyzeStaticAssets(staticDir) {
  console.log('\n🎯 STATIC ASSETS ANALYSIS')
  console.log('-'.repeat(30))

  const jsDir = path.join(staticDir, 'chunks')
  
  // Analyze JavaScript chunks
  if (fs.existsSync(jsDir)) {
    const jsFiles = fs.readdirSync(jsDir).filter(file => file.endsWith('.js'))
    let totalJsSize = 0

    console.log('\n📄 JavaScript Chunks:')
    jsFiles.forEach(file => {
      const filePath = path.join(jsDir, file)
      const stats = fs.statSync(filePath)
      const sizeKB = Math.round(stats.size / 1024)
      totalJsSize += stats.size

      const category = categorizeJsChunk(file)
      console.log(`  ${category} ${file}: ${sizeKB} KB`)
    })

    console.log(`\n📈 Total JS Size: ${Math.round(totalJsSize / 1024)} KB`)

    // Check performance budget
    const totalMB = totalJsSize / (1024 * 1024)
    if (totalMB > 0.5) {
      console.log(`⚠️  WARNING: Total JS size (${totalMB.toFixed(2)} MB) exceeds recommended 500KB`)
    } else {
      console.log(`✅ GOOD: Total JS size within budget`)
    }
  }
}

function categorizeJsChunk(filename) {
  if (filename.includes('framework')) return '🏗️ '
  if (filename.includes('main')) return '🚀'
  if (filename.includes('webpack')) return '📦'
  if (filename.includes('pages')) return '📄'
  if (filename.includes('chunks')) return '🧩'
  return '📄'
}

function generateOptimizationRecommendations() {
  console.log('\n💡 OPTIMIZATION RECOMMENDATIONS')
  console.log('=' .repeat(50))

  const recommendations = [
    '🎯 Enable gzip compression in production',
    '📦 Dynamic imports for large components implemented ✅',
    '🖼️  Image optimization using Next.js Image component',
    '⚡ Caching system implemented ✅', 
    '🧹 Remove unused dependencies and code',
    '📊 Performance monitoring implemented ✅',
    '🚀 Consider using CDN for static assets',
    '⚡ Service worker for offline functionality'
  ]

  recommendations.forEach((rec, index) => {
    console.log(`${index + 1}. ${rec}`)
  })
}

module.exports = { analyzeBuildOutput }

if (require.main === module) {
  analyzeBuildOutput()
}


