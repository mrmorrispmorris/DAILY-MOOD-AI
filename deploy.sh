#!/bin/bash

echo "🚀 Starting DailyMood AI Deployment..."

# Run tests
echo "Running tests..."
npm run test

# Build the application
echo "Building application..."
npm run build

# Check for build errors
if [ $? -ne 0 ]; then
  echo "❌ Build failed! Fix errors before deploying."
  exit 1
fi

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "✅ Deployment complete!"
echo "🎉 DailyMood AI is live!"

