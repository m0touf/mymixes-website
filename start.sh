#!/bin/bash

set -e  # Exit on any error

echo "🚀 Starting deployment process..."

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
