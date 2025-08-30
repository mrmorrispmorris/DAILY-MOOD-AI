#!/bin/bash
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
