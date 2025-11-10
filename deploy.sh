#!/bin/bash

# Target Nexus Deployment Script
echo "🚀 Deploying Target Nexus to Firebase Hosting..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Verify project configuration
echo "📋 Project Configuration:"
echo "  Project ID: target-nexus-game"
echo "  Project Number: 238606515639"
echo "  URL: https://target-nexus-game.web.app/"

# Deploy to Firebase
echo "🔥 Starting Firebase deployment..."
firebase deploy --project target-nexus-game

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Live at: https://target-nexus-game.web.app/"
    echo "📊 Console: https://console.firebase.google.com/project/target-nexus-game"
else
    echo "❌ Deployment failed!"
    exit 1
fi
