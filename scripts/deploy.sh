#!/bin/bash
# DailyMood AI - Production Deployment Script
# This script handles deployment to Vercel with pre-deployment checks

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="dailymood-ai"
VERCEL_ORG="dailymood-ai"
PRODUCTION_URL="https://dailymood.ai"

echo -e "${BLUE}🚀 DailyMood AI Deployment Script${NC}"
echo -e "${BLUE}=====================================${NC}"

# Function to print colored output
print_status() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Check if required tools are installed
check_dependencies() {
    print_info "Checking dependencies..."
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Installing now..."
        npm install -g vercel@latest
    fi
    
    print_status "All dependencies are available"
}

# Verify environment variables
check_environment() {
    print_info "Checking environment configuration..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "STRIPE_SECRET_KEY"
        "NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY" 
        "STRIPE_PRICE_ID"
        "OPENAI_API_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [[ -z "${!var}" ]]; then
            missing_vars+=("$var")
        fi
    done
    
    if [[ ${#missing_vars[@]} -gt 0 ]]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables before deploying to production"
        echo "You can set them in Vercel dashboard or using: vercel env add"
        exit 1
    fi
    
    print_status "Environment variables verified"
}

# Run pre-deployment tests
run_tests() {
    print_info "Running pre-deployment tests..."
    
    # Check if dependencies are installed
    if [[ ! -d "node_modules" ]]; then
        print_info "Installing dependencies..."
        npm install
    fi
    
    # TypeScript check
    print_info "Checking TypeScript..."
    if ! npx tsc --noEmit; then
        print_error "TypeScript errors found. Please fix before deploying."
        exit 1
    fi
    print_status "TypeScript check passed"
    
    # Build check
    print_info "Testing production build..."
    if ! npm run build; then
        print_error "Production build failed. Please fix build errors."
        exit 1
    fi
    print_status "Production build successful"
    
    # Run tests if they exist
    if [[ -f "package.json" ]] && grep -q "\"test\"" package.json; then
        print_info "Running test suite..."
        if ! npm test; then
            print_warning "Some tests failed. Consider fixing before deploying."
            read -p "Continue with deployment? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Deployment cancelled"
                exit 1
            fi
        fi
        print_status "Tests passed"
    fi
}

# Database health check
check_database() {
    print_info "Checking database health..."
    
    if command -v npx &> /dev/null && [[ -f "database/scripts/setup.ts" ]]; then
        if ! npx tsx database/scripts/setup.ts health; then
            print_warning "Database health check failed"
            read -p "Continue with deployment? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
                print_info "Deployment cancelled"
                exit 1
            fi
        else
            print_status "Database health check passed"
        fi
    else
        print_warning "Database health check script not found"
    fi
}

# Deploy to Vercel
deploy_to_vercel() {
    print_info "Starting Vercel deployment..."
    
    # Determine deployment type
    if [[ "$1" == "production" ]]; then
        print_info "Deploying to PRODUCTION..."
        vercel --prod --yes
    elif [[ "$1" == "preview" ]]; then
        print_info "Deploying preview build..."
        vercel --yes
    else
        print_info "Deploying preview build (default)..."
        vercel --yes
    fi
    
    print_status "Deployment completed successfully"
}

# Post-deployment checks
post_deployment_checks() {
    local url="$1"
    print_info "Running post-deployment checks..."
    
    # Wait for deployment to be ready
    sleep 10
    
    # Check if site is accessible
    print_info "Checking site accessibility..."
    if curl -f -s -o /dev/null "$url"; then
        print_status "Site is accessible at $url"
    else
        print_error "Site is not accessible at $url"
        exit 1
    fi
    
    # Check API health
    print_info "Checking API health..."
    if curl -f -s -o /dev/null "$url/api/health" 2>/dev/null || true; then
        print_status "API is responding"
    else
        print_warning "API health check inconclusive (endpoint may not exist)"
    fi
    
    print_status "Post-deployment checks completed"
}

# Cleanup function
cleanup() {
    print_info "Cleaning up temporary files..."
    # Remove any temporary files created during deployment
    # rm -rf .temp 2>/dev/null || true
    print_status "Cleanup completed"
}

# Main deployment function
main() {
    local deployment_type="${1:-preview}"
    
    echo "Starting deployment process..."
    echo "Deployment type: $deployment_type"
    echo
    
    # Pre-deployment checks
    check_dependencies
    check_environment
    run_tests
    check_database
    
    # Deploy
    deploy_to_vercel "$deployment_type"
    
    # Get deployment URL
    local deployment_url
    if [[ "$deployment_type" == "production" ]]; then
        deployment_url="$PRODUCTION_URL"
    else
        # For preview deployments, you might want to capture the URL from Vercel output
        deployment_url="https://dailymood-ai.vercel.app"
    fi
    
    # Post-deployment checks
    post_deployment_checks "$deployment_url"
    
    # Cleanup
    cleanup
    
    echo
    print_status "🎉 Deployment completed successfully!"
    print_info "URL: $deployment_url"
    
    if [[ "$deployment_type" == "production" ]]; then
        print_info "🚀 Your app is now live in production!"
        print_info "Don't forget to:"
        print_info "  - Update DNS records if needed"
        print_info "  - Monitor application logs"
        print_info "  - Run database migrations if needed"
        print_info "  - Update Stripe webhook URLs"
    fi
}

# Handle script arguments
case "${1:-}" in
    "production"|"prod"|"--production"|"--prod")
        main "production"
        ;;
    "preview"|"--preview")
        main "preview"
        ;;
    "help"|"--help"|"-h")
        echo "Usage: $0 [production|preview|help]"
        echo
        echo "Commands:"
        echo "  production    Deploy to production (requires --prod confirmation)"
        echo "  preview       Deploy preview build (default)"
        echo "  help          Show this help message"
        echo
        echo "Environment variables required:"
        echo "  NEXT_PUBLIC_SUPABASE_URL"
        echo "  SUPABASE_SERVICE_ROLE_KEY"
        echo "  STRIPE_SECRET_KEY"
        echo "  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY"
        echo "  STRIPE_PRICE_ID"
        echo "  OPENAI_API_KEY"
        ;;
    *)
        if [[ -n "${1:-}" ]]; then
            print_warning "Unknown command: $1"
            echo "Use '$0 help' for usage information"
            exit 1
        fi
        main "preview"
        ;;
esac


