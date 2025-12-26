#!/bin/bash

# Beeva Chat Local Setup Script
# This script helps you quickly set up and test the Beeva chatbot locally

set -e

echo "🤖 Beeva Chat Local Setup"
echo "=========================="
echo ""

# Check if we're in the react-web directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found"
    echo "Please run this script from the react-web directory"
    exit 1
fi

# Check for pnpm
if ! command -v pnpm &> /dev/null; then
    echo "❌ Error: pnpm is not installed"
    echo "Install it with: npm install -g pnpm"
    exit 1
fi

echo "✅ Found package.json"
echo "✅ pnpm is installed"
echo ""

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    pnpm install
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi
echo ""

# Create .env.local if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo "📝 Creating .env.local with debug mode enabled..."
    cat > .env.local << EOF
# Debug mode - shows detailed logs in console
NEXT_PUBLIC_DEBUG_MODE=true

# Beeva chat enabled (default: true)
NEXT_PUBLIC_BEEVA_CHAT_ENABLED=true

# Optional: Add your JWT token here for testing without login
# NEXT_PUBLIC_BEEVA_SUPABASE_JWT=your_token_here
EOF
    echo "✅ Created .env.local"
else
    echo "✅ .env.local already exists"
fi
echo ""

echo "🚀 Starting development server..."
echo ""
echo "The app will be available at: http://localhost:3001"
echo "Beeva chat will be at: http://localhost:3001/beeva-chat"
echo ""
echo "⚠️  IMPORTANT: You need to login first to get an auth token!"
echo "   1. Go to http://localhost:3001/login"
echo "   2. Login with your credentials"
echo "   3. Then navigate to http://localhost:3001/beeva-chat"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "=========================="
echo ""

# Start the dev server
pnpm debug
