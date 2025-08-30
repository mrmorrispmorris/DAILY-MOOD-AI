#!/usr/bin/env node

/**
 * Phase 7: Production Deployment Checklist
 * Validates production readiness and deployment configuration
 */

const fs = require('fs');
const path = require('path');

class ProductionDeploymentChecker {
  constructor() {
    this.results = [];
    this.totalChecks = 0;
    this.passedChecks = 0;
    this.criticalIssues = [];
  }

  async runCheck(checkName, checkFunction, isCritical = false) {
    this.totalChecks++;
    console.log(`\n🔍 Checking: ${checkName}`);
    
    try {
      const result = await checkFunction();
      if (result.success) {
        this.passedChecks++;
        console.log(`✅ PASS: ${checkName}`);
        if (result.data) console.log(`   📊 ${result.data}`);
      } else {
        console.log(`❌ FAIL: ${checkName}`);
        console.log(`   📋 ${result.error}`);
        if (isCritical) {
          this.criticalIssues.push(checkName);
        }
      }
      this.results.push({ check: checkName, isCritical, ...result });
    } catch (error) {
      console.log(`❌ ERROR: ${checkName}`);
      console.log(`   📋 ${error.message}`);
      if (isCritical) {
        this.criticalIssues.push(checkName);
      }
      this.results.push({ check: checkName, isCritical, success: false, error: error.message });
    }
  }

  async checkEnvironmentVariables() {
    try {
      const envLocalExists = fs.existsSync('.env.local');
      const envExampleExists = fs.existsSync('.env.example');
      
      if (!envLocalExists) {
        return {
          success: false,
          data: null,
          error: '.env.local file not found - required for production deployment'
        };
      }

      const envContent = fs.readFileSync('.env.local', 'utf8');
      const requiredVars = [
        'NEXT_PUBLIC_SUPABASE_URL',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY',
        'SUPABASE_SERVICE_ROLE_KEY',
        'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
        'STRIPE_SECRET_KEY',
        'NEXT_PUBLIC_URL'
      ];

      const missingVars = requiredVars.filter(varName => !envContent.includes(varName));
      
      return {
        success: missingVars.length === 0,
        data: missingVars.length === 0 ? `All ${requiredVars.length} required environment variables present` : null,
        error: missingVars.length > 0 ? `Missing environment variables: ${missingVars.join(', ')}` : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking environment variables: ${error.message}`
      };
    }
  }

  async checkPackageJson() {
    try {
      if (!fs.existsSync('package.json')) {
        return {
          success: false,
          data: null,
          error: 'package.json not found'
        };
      }

      const packageData = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const hasStartScript = packageData.scripts && packageData.scripts.start;
      const hasBuildScript = packageData.scripts && packageData.scripts.build;
      const hasName = packageData.name;
      const hasVersion = packageData.version;

      const checks = [hasStartScript, hasBuildScript, hasName, hasVersion];
      const passedChecks = checks.filter(check => check).length;

      return {
        success: passedChecks === checks.length,
        data: `Package.json validation: ${passedChecks}/${checks.length} checks passed`,
        error: passedChecks < checks.length ? 'package.json missing required fields or scripts' : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking package.json: ${error.message}`
      };
    }
  }

  async checkNextConfig() {
    try {
      if (!fs.existsSync('next.config.js')) {
        return {
          success: false,
          data: null,
          error: 'next.config.js not found'
        };
      }

      const configContent = fs.readFileSync('next.config.js', 'utf8');
      
      const hasImageDomains = configContent.includes('images') && configContent.includes('domains');
      const hasReactStrictMode = configContent.includes('reactStrictMode');
      const hasOptimizations = configContent.includes('optimization') || configContent.includes('webpack');

      const features = [hasImageDomains, hasReactStrictMode, hasOptimizations];
      const workingFeatures = features.filter(f => f).length;

      return {
        success: workingFeatures >= 2,
        data: `Next.js configuration: ${workingFeatures}/3 optimization features configured`,
        error: workingFeatures < 2 ? 'Next.js configuration needs optimization for production' : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking Next.js configuration: ${error.message}`
      };
    }
  }

  async checkVercelConfig() {
    try {
      const vercelJsonExists = fs.existsSync('vercel.json');
      
      if (vercelJsonExists) {
        const vercelConfig = JSON.parse(fs.readFileSync('vercel.json', 'utf8'));
        
        const hasBuildCommand = vercelConfig.buildCommand || 
                              (vercelConfig.builds && vercelConfig.builds.length > 0);
        const hasRoutes = vercelConfig.routes && vercelConfig.routes.length > 0;
        const hasEnvironment = vercelConfig.env || vercelConfig.environment;

        const features = [hasBuildCommand, hasRoutes, hasEnvironment];
        const workingFeatures = features.filter(f => f).length;

        return {
          success: true, // vercel.json is optional but good to have
          data: `Vercel configuration found with ${workingFeatures}/3 optimization features`,
          error: null
        };
      } else {
        return {
          success: true, // Not required
          data: 'No vercel.json found (will use default Vercel configuration)',
          error: null
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking Vercel configuration: ${error.message}`
      };
    }
  }

  async checkDatabaseMigrations() {
    try {
      const migrationPaths = [
        'database/migrations',
        'supabase/migrations',
        'database'
      ];
      
      let migrationsFound = false;
      let migrationPath = '';
      
      for (const path of migrationPaths) {
        if (fs.existsSync(path)) {
          migrationsFound = true;
          migrationPath = path;
          break;
        }
      }
      
      if (migrationsFound) {
        const files = fs.readdirSync(migrationPath);
        const sqlFiles = files.filter(f => f.endsWith('.sql')).length;
        
        return {
          success: sqlFiles > 0,
          data: `Database migrations found: ${sqlFiles} SQL files in ${migrationPath}`,
          error: sqlFiles === 0 ? 'Migration directory exists but no SQL files found' : null
        };
      } else {
        return {
          success: false,
          data: null,
          error: 'No database migrations directory found'
        };
      }
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking database migrations: ${error.message}`
      };
    }
  }

  async checkStaticAssets() {
    try {
      const publicExists = fs.existsSync('public');
      
      if (!publicExists) {
        return {
          success: false,
          data: null,
          error: 'public directory not found'
        };
      }

      const requiredAssets = ['favicon.ico', 'manifest.json'];
      const optionalAssets = ['robots.txt', 'sitemap.xml'];
      
      const existingRequired = requiredAssets.filter(asset => fs.existsSync(`public/${asset}`));
      const existingOptional = optionalAssets.filter(asset => fs.existsSync(`public/${asset}`));
      
      return {
        success: existingRequired.length === requiredAssets.length,
        data: `Static assets: ${existingRequired.length}/${requiredAssets.length} required, ${existingOptional.length}/${optionalAssets.length} optional`,
        error: existingRequired.length < requiredAssets.length ? 
          `Missing required assets: ${requiredAssets.filter(a => !existingRequired.includes(a)).join(', ')}` : null
      };
    } catch (error) {
      return {
        success: false,
        data: null,
        error: `Error checking static assets: ${error.message}`
      };
    }
  }

  async runAllChecks() {
    console.log('🚀 Starting Production Deployment Checklist');
    console.log('============================================');

    await this.runCheck('Environment Variables', () => this.checkEnvironmentVariables(), true);
    await this.runCheck('Package.json Configuration', () => this.checkPackageJson(), true);
    await this.runCheck('Next.js Configuration', () => this.checkNextConfig(), false);
    await this.runCheck('Vercel Configuration', () => this.checkVercelConfig(), false);
    await this.runCheck('Database Migrations', () => this.checkDatabaseMigrations(), true);
    await this.runCheck('Static Assets', () => this.checkStaticAssets(), false);

    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 PRODUCTION DEPLOYMENT SUMMARY');
    console.log('=================================');
    console.log(`Total Checks: ${this.totalChecks}`);
    console.log(`Passed: ${this.passedChecks}`);
    console.log(`Failed: ${this.totalChecks - this.passedChecks}`);
    console.log(`Success Rate: ${((this.passedChecks / this.totalChecks) * 100).toFixed(1)}%`);
    
    // Critical issues assessment
    if (this.criticalIssues.length === 0) {
      console.log('\n🎉 NO CRITICAL ISSUES! App is ready for production deployment.');
    } else {
      console.log('\n⚠️ CRITICAL ISSUES DETECTED:');
      this.criticalIssues.forEach(issue => {
        console.log(`   ❌ ${issue}`);
      });
      console.log('\nResolve critical issues before deploying to production.');
    }

    // Deployment readiness
    const criticalPassed = this.results.filter(r => r.isCritical && r.success).length;
    const totalCritical = this.results.filter(r => r.isCritical).length;
    const readinessScore = totalCritical > 0 ? (criticalPassed / totalCritical) * 100 : 100;
    
    console.log(`\n🚀 DEPLOYMENT READINESS: ${readinessScore.toFixed(1)}%`);
    
    if (readinessScore === 100) {
      console.log('✅ Ready for immediate production deployment');
    } else if (readinessScore >= 80) {
      console.log('⚠️ Nearly ready - address remaining critical issues');
    } else {
      console.log('❌ Not ready for production - fix critical issues first');
    }

    // Save detailed report
    fs.writeFileSync('production-deployment-report.json', JSON.stringify({
      timestamp: new Date().toISOString(),
      totalChecks: this.totalChecks,
      passedChecks: this.passedChecks,
      successRate: ((this.passedChecks / this.totalChecks) * 100).toFixed(1) + '%',
      criticalIssues: this.criticalIssues,
      deploymentReadiness: readinessScore.toFixed(1) + '%',
      readyForProduction: readinessScore === 100,
      results: this.results
    }, null, 2));
    
    console.log('\n📄 Detailed deployment report saved to production-deployment-report.json');
  }
}

// Run checks if called directly
if (require.main === module) {
  const checker = new ProductionDeploymentChecker();
  checker.runAllChecks().catch(error => {
    console.error('❌ Production deployment check failed:', error);
    process.exit(1);
  });
}

module.exports = ProductionDeploymentChecker;
