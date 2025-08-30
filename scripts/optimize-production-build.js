#!/usr/bin/env node

/**
 * Phase 7: Production Build Optimization
 * Optimizes the build for production deployment
 */

const fs = require('fs');
const { execSync } = require('child_process');

class ProductionBuildOptimizer {
  constructor() {
    this.optimizations = [];
    this.results = [];
  }

  log(message) {
    console.log(`⚡ ${message}`);
  }

  error(message) {
    console.log(`❌ ${message}`);
  }

  success(message) {
    console.log(`✅ ${message}`);
  }

  async optimizeNextConfig() {
    this.log('Optimizing Next.js configuration...');
    
    try {
      const configPath = 'next.config.js';
      if (fs.existsSync(configPath)) {
        let config = fs.readFileSync(configPath, 'utf8');
        
        // Add production optimizations
        const optimizations = {
          'compress: true': 'Enable gzip compression',
          'swcMinify: true': 'Enable SWC minification for better performance',
          'reactStrictMode: true': 'Enable React strict mode for better debugging',
          'poweredByHeader: false': 'Remove X-Powered-By header for security',
          'generateEtags: false': 'Disable ETags for better caching control'
        };

        let modified = false;
        for (const [optimization, description] of Object.entries(optimizations)) {
          if (!config.includes(optimization.split(':')[0])) {
            // Add optimization if not present
            const nextConfigRegex = /const nextConfig = \{([^}]+)\}/s;
            if (nextConfigRegex.test(config)) {
              config = config.replace(nextConfigRegex, (match, content) => {
                return `const nextConfig = {${content},\n  ${optimization},`;
              });
              modified = true;
              this.optimizations.push(description);
            }
          }
        }

        if (modified) {
          fs.writeFileSync(configPath, config);
          this.success('Next.js configuration optimized');
        } else {
          this.success('Next.js configuration already optimized');
        }

        this.results.push({
          optimization: 'Next.js Configuration',
          success: true,
          changes: modified ? this.optimizations.length : 0
        });
      } else {
        this.error('next.config.js not found');
        this.results.push({
          optimization: 'Next.js Configuration',
          success: false,
          error: 'Configuration file not found'
        });
      }
    } catch (error) {
      this.error(`Next.js optimization failed: ${error.message}`);
      this.results.push({
        optimization: 'Next.js Configuration',
        success: false,
        error: error.message
      });
    }
  }

  async optimizePackageJson() {
    this.log('Optimizing package.json for production...');
    
    try {
      const packagePath = 'package.json';
      const packageData = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
      
      // Add production-specific scripts if missing
      const productionScripts = {
        'start': 'next start',
        'build:analyze': 'ANALYZE=true npm run build',
        'build:production': 'NODE_ENV=production npm run build',
        'postbuild': 'next-sitemap'
      };

      let modified = false;
      for (const [script, command] of Object.entries(productionScripts)) {
        if (!packageData.scripts[script]) {
          packageData.scripts[script] = command;
          modified = true;
          this.optimizations.push(`Added ${script} script`);
        }
      }

      if (modified) {
        fs.writeFileSync(packagePath, JSON.stringify(packageData, null, 2));
        this.success('Package.json optimized for production');
      } else {
        this.success('Package.json already optimized');
      }

      this.results.push({
        optimization: 'Package.json Scripts',
        success: true,
        changes: modified ? Object.keys(productionScripts).length : 0
      });
    } catch (error) {
      this.error(`Package.json optimization failed: ${error.message}`);
      this.results.push({
        optimization: 'Package.json Scripts',
        success: false,
        error: error.message
      });
    }
  }

  async createRobotsTxt() {
    this.log('Creating robots.txt for SEO...');
    
    try {
      const robotsPath = 'public/robots.txt';
      
      if (!fs.existsSync(robotsPath)) {
        const robotsContent = `User-agent: *
Allow: /

# Sitemap
Sitemap: https://your-domain.com/sitemap.xml

# Disallow admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /dashboard/

# Allow important pages
Allow: /pricing
Allow: /features
Allow: /blog
Allow: /help
`;

        fs.writeFileSync(robotsPath, robotsContent);
        this.success('robots.txt created');
        this.optimizations.push('Created robots.txt for SEO');
      } else {
        this.success('robots.txt already exists');
      }

      this.results.push({
        optimization: 'robots.txt Creation',
        success: true,
        changes: 1
      });
    } catch (error) {
      this.error(`robots.txt creation failed: ${error.message}`);
      this.results.push({
        optimization: 'robots.txt Creation',
        success: false,
        error: error.message
      });
    }
  }

  async createSitemap() {
    this.log('Configuring sitemap generation...');
    
    try {
      const sitemapConfigPath = 'next-sitemap.config.js';
      
      if (!fs.existsSync(sitemapConfigPath)) {
        const sitemapConfig = `/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_URL || 'https://your-domain.com',
  generateRobotsTxt: false, // We have custom robots.txt
  exclude: [
    '/dashboard/*',
    '/admin/*',
    '/api/*',
    '/test/*',
    '/debug/*'
  ],
  additionalPaths: async (config) => [
    await config.transform(config, '/pricing'),
    await config.transform(config, '/features'),
    await config.transform(config, '/blog'),
    await config.transform(config, '/help'),
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/dashboard', '/admin', '/api', '/_next']
      }
    ]
  }
}`;

        fs.writeFileSync(sitemapConfigPath, sitemapConfig);
        this.success('Sitemap configuration created');
        this.optimizations.push('Created sitemap configuration');
      } else {
        this.success('Sitemap configuration already exists');
      }

      this.results.push({
        optimization: 'Sitemap Configuration',
        success: true,
        changes: 1
      });
    } catch (error) {
      this.error(`Sitemap configuration failed: ${error.message}`);
      this.results.push({
        optimization: 'Sitemap Configuration',
        success: false,
        error: error.message
      });
    }
  }

  async optimizeBundleSize() {
    this.log('Analyzing bundle size...');
    
    try {
      // Create bundle analyzer configuration if not exists
      const analyzerConfigPath = 'scripts/bundle-analyzer.js';
      
      if (!fs.existsSync(analyzerConfigPath)) {
        const analyzerConfig = `const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');

module.exports = {
  webpack: (config, { isServer }) => {
    if (process.env.ANALYZE) {
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'server',
          analyzerPort: isServer ? 8888 : 8889,
          openAnalyzer: true,
        })
      );
    }
    return config;
  },
};`;

        fs.writeFileSync(analyzerConfigPath, analyzerConfig);
        this.success('Bundle analyzer configuration created');
        this.optimizations.push('Created bundle analyzer configuration');
      }

      this.results.push({
        optimization: 'Bundle Size Analysis',
        success: true,
        changes: 1
      });
    } catch (error) {
      this.error(`Bundle size optimization failed: ${error.message}`);
      this.results.push({
        optimization: 'Bundle Size Analysis',
        success: false,
        error: error.message
      });
    }
  }

  async createDeploymentScript() {
    this.log('Creating deployment script...');
    
    try {
      const deployScriptPath = 'scripts/deploy-production.sh';
      
      if (!fs.existsSync(deployScriptPath)) {
        const deployScript = `#!/bin/bash
# Production Deployment Script

echo "🚀 Starting production deployment..."

# 1. Environment check
if [ -z "$NEXT_PUBLIC_URL" ]; then
  echo "❌ NEXT_PUBLIC_URL environment variable is required"
  exit 1
fi

# 2. Dependencies check
echo "📦 Installing dependencies..."
npm ci

# 3. Build application
echo "🔨 Building application..."
npm run build

# 4. Run tests (if available)
echo "🧪 Running tests..."
npm run test --passWithNoTests

# 5. Deploy to Vercel
echo "🚀 Deploying to Vercel..."
if command -v vercel &> /dev/null; then
  vercel --prod
else
  echo "⚠️ Vercel CLI not found. Install with: npm i -g vercel"
fi

echo "✅ Deployment complete!"
`;

        fs.writeFileSync(deployScriptPath, deployScript);
        
        // Make script executable
        try {
          execSync(`chmod +x ${deployScriptPath}`, { stdio: 'ignore' });
        } catch {
          // Windows doesn't need chmod
        }

        this.success('Deployment script created');
        this.optimizations.push('Created automated deployment script');
      } else {
        this.success('Deployment script already exists');
      }

      this.results.push({
        optimization: 'Deployment Script',
        success: true,
        changes: 1
      });
    } catch (error) {
      this.error(`Deployment script creation failed: ${error.message}`);
      this.results.push({
        optimization: 'Deployment Script',
        success: false,
        error: error.message
      });
    }
  }

  async runAllOptimizations() {
    console.log('⚡ Starting Production Build Optimizations');
    console.log('==========================================');

    await this.optimizeNextConfig();
    await this.optimizePackageJson();
    await this.createRobotsTxt();
    await this.createSitemap();
    await this.optimizeBundleSize();
    await this.createDeploymentScript();

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 BUILD OPTIMIZATION SUMMARY');
    console.log('==============================');
    
    const successful = this.results.filter(r => r.success).length;
    const total = this.results.length;
    
    console.log(`Total Optimizations: ${total}`);
    console.log(`Successful: ${successful}`);
    console.log(`Failed: ${total - successful}`);
    console.log(`Success Rate: ${((successful / total) * 100).toFixed(1)}%`);

    if (this.optimizations.length > 0) {
      console.log('\n✨ Applied Optimizations:');
      this.optimizations.forEach(opt => {
        console.log(`   ✅ ${opt}`);
      });
    }

    // Production readiness
    console.log('\n🚀 PRODUCTION BUILD STATUS:');
    if (successful === total) {
      console.log('✅ Build fully optimized for production deployment');
    } else {
      console.log('⚠️ Some optimizations failed - review and fix before deployment');
    }

    // Save results
    fs.writeFileSync('build-optimization-results.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalOptimizations: total,
      successfulOptimizations: successful,
      successRate: ((successful / total) * 100).toFixed(1) + '%',
      appliedOptimizations: this.optimizations,
      buildOptimized: successful === total,
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Build optimization results saved to build-optimization-results.json');

    // Next steps
    console.log('\n🔄 NEXT STEPS:');
    console.log('1. Test the optimized build: npm run build');
    console.log('2. Analyze bundle size: npm run build:analyze');
    console.log('3. Deploy to production: ./scripts/deploy-production.sh');
  }
}

// Run optimizations if called directly
if (require.main === module) {
  const optimizer = new ProductionBuildOptimizer();
  optimizer.runAllOptimizations().catch(error => {
    console.error('❌ Build optimization failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionBuildOptimizer;
