#!/bin/bash

# DailyMood AI - Pre-Launch Checklist Script
# Run this before every production deployment

echo "🚀 DailyMood AI Pre-Launch Checklist Starting..."
echo "=================================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Function to check and report
check_requirement() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        ERRORS=$((ERRORS + 1))
    fi
}

echo "1. Checking environment variables..."
echo "======================================"

# Check required environment variables
required_vars=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "STRIPE_SECRET_KEY"
    "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
    "STRIPE_PRICE_ID"
    "OPENAI_API_KEY"
)

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        echo -e "${RED}❌ Missing: $var${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ Found: $var${NC}"
    fi
done

echo ""
echo "2. Running build test..."
echo "========================"

# Clean and build
echo "Cleaning previous builds..."
rm -rf .next out

echo "Running production build..."
npm run build > build.log 2>&1
BUILD_SUCCESS=$?
check_requirement $BUILD_SUCCESS "Production build completed"

if [ $BUILD_SUCCESS -ne 0 ]; then
    echo "Build errors:"
    cat build.log | tail -20
fi

echo ""
echo "3. Type checking..."
echo "==================="

# Type check
npx tsc --noEmit > typecheck.log 2>&1
TYPE_SUCCESS=$?
check_requirement $TYPE_SUCCESS "TypeScript type checking passed"

if [ $TYPE_SUCCESS -ne 0 ]; then
    echo "Type errors:"
    cat typecheck.log
fi

echo ""
echo "4. Linting..."
echo "============="

# Lint check
npm run lint > lint.log 2>&1
LINT_SUCCESS=$?
check_requirement $LINT_SUCCESS "ESLint passed"

if [ $LINT_SUCCESS -ne 0 ]; then
    echo "Lint errors:"
    cat lint.log | head -20
fi

echo ""
echo "5. Testing critical endpoints..."
echo "================================="

# Start development server for testing (if not already running)
if ! curl -f http://localhost:3009 >/dev/null 2>&1; then
    echo "Starting development server for testing..."
    npm run dev > server.log 2>&1 &
    SERVER_PID=$!
    sleep 10
    
    # Check if server started
    if curl -f http://localhost:3009 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ Development server started${NC}"
    else
        echo -e "${RED}❌ Failed to start development server${NC}"
        ERRORS=$((ERRORS + 1))
        if [ ! -z "$SERVER_PID" ]; then
            kill $SERVER_PID 2>/dev/null
        fi
    fi
else
    echo -e "${GREEN}✅ Development server already running${NC}"
    SERVER_PID=""
fi

# Test critical endpoints
endpoints=(
    "/"
    "/api/status"
    "/pricing"
    "/blog"
)

for endpoint in "${endpoints[@]}"; do
    if curl -f "http://localhost:3009$endpoint" >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $endpoint responds${NC}"
    else
        echo -e "${RED}❌ $endpoint not responding${NC}"
        ERRORS=$((ERRORS + 1))
    fi
done

# Clean up development server if we started it
if [ ! -z "$SERVER_PID" ]; then
    kill $SERVER_PID 2>/dev/null
fi

echo ""
echo "6. Checking dependencies..."
echo "==========================="

# Check for security vulnerabilities
npm audit --audit-level high > audit.log 2>&1
AUDIT_SUCCESS=$?
if [ $AUDIT_SUCCESS -eq 0 ]; then
    echo -e "${GREEN}✅ No high-severity vulnerabilities found${NC}"
else
    echo -e "${YELLOW}⚠️ Security vulnerabilities detected${NC}"
    echo "Run 'npm audit' for details"
fi

# Check bundle size
if [ -d ".next" ]; then
    BUNDLE_SIZE=$(du -sh .next | cut -f1)
    echo -e "${GREEN}✅ Bundle size: $BUNDLE_SIZE${NC}"
else
    echo -e "${RED}❌ No build output found${NC}"
    ERRORS=$((ERRORS + 1))
fi

echo ""
echo "7. Final checklist verification..."
echo "==================================="

# Manual checklist items that should be verified
echo "Please manually verify these items:"
echo "- [ ] Database migrations are up to date"
echo "- [ ] Stripe webhooks are configured"
echo "- [ ] Domain/SSL certificates are valid"
echo "- [ ] Environment variables are set in production"
echo "- [ ] Monitoring/alerting is configured"
echo "- [ ] Backup systems are in place"

echo ""
echo "8. Summary"
echo "=========="

if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}🎉 All checks passed! Ready for deployment.${NC}"
    echo ""
    echo "To deploy to production:"
    echo "  vercel --prod"
    echo ""
    echo "Post-deployment:"
    echo "  1. Run health checks"
    echo "  2. Test critical user journeys"
    echo "  3. Monitor error rates"
    echo "  4. Verify analytics tracking"
    EXIT_CODE=0
else
    echo -e "${RED}❌ $ERRORS error(s) found. Fix issues before deploying.${NC}"
    echo ""
    echo "Common fixes:"
    echo "  - Check .env.local file exists and is complete"
    echo "  - Run 'npm install' to update dependencies"
    echo "  - Fix TypeScript errors shown above"
    echo "  - Ensure development server can start"
    EXIT_CODE=1
fi

# Cleanup log files
rm -f build.log typecheck.log lint.log server.log audit.log

echo "=================================================="
echo "Pre-launch checklist completed at $(date)"

exit $EXIT_CODE


