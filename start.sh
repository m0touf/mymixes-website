#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm not found in PATH"
    echo "📋 Available commands:"
    which -a node || echo "node not found"
    which -a npm || echo "npm not found"
    echo "🔍 PATH: $PATH"
    exit 1
fi

echo "✅ npm found: $(which npm)"
echo "✅ node found: $(which node)"

# Navigate to server directory
echo "📁 Navigating to server directory..."
cd server

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Run database migrations
echo "🗄️ Running database migrations..."
npx prisma migrate deploy

# Build the application
echo "🏗️ Building application..."
npm run build

# Start the server
echo "🎯 Starting server..."
npm start
