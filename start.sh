#!/bin/bash

# Navigate to server directory
cd server

# Install dependencies
npm ci

# Build the application
npm run build

# Start the server
npm start
