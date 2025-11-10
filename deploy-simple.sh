#!/bin/bash

echo "🎯 TARGET NEXUS - DEPLOYMENT STATUS CHECKER"
echo "==========================================="
echo ""

# Check GitHub Actions workflow
echo "🔍 Checking GitHub Actions setup..."
if [[ -f ".github/workflows/deploy.yml" ]]; then
    echo "✅ GitHub Actions workflow exists"
else
    echo "❌ No GitHub Actions workflow found"
fi

# Check if we're logged in to Firebase (for manual deploy)
echo ""
echo "🔍 Checking Firebase authentication (for manual deploy)..."
if firebase projects:list > /dev/null 2>&1; then
    echo "✅ Firebase CLI authenticated - can deploy manually"
    
    echo ""
    echo "🚀 MANUAL DEPLOY OPTIONS:"
    echo "   Option 1: firebase deploy --project target-nexus-game"
    echo "   Option 2: ./get-firebase-token.sh (for GitHub Actions setup)"
else
    echo "❌ Not logged in to Firebase"
    echo ""
    echo "🚀 SETUP OPTIONS:"
    echo "   Option 1 - Manual Deploy:"
    echo "     1. npm install -g firebase-tools"
    echo "     2. firebase login" 
    echo "     3. firebase deploy --project target-nexus-game"
    echo ""
    echo "   Option 2 - Auto Deploy (GitHub Actions):"
    echo "     1. Run: ./get-firebase-token.sh"
    echo "     2. Follow the instructions to add FIREBASE_TOKEN secret"
    echo ""
fi

# Verify all files exist
echo ""
echo "📋 Checking game files..."
required_files=("index.html" "script.js" "style.css" "manifest.json" "sw.js")

for file in "${required_files[@]}"; do
    if [[ -f "$file" ]]; then
        echo "  ✅ $file"
    else
        echo "  ❌ $file (MISSING)"
        echo "❌ Deployment cancelled - missing required files"
        exit 1
    fi
done

echo ""
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --project target-nexus-game

if [[ $? -eq 0 ]]; then
    echo ""
    echo "🎉 SUCCESS! Your game is now live!"
    echo "🌐 Visit: https://target-nexus-game.web.app/"
    echo "🎮 Game Features:"
    echo "   • 5 Game Modes (Classic with 3 lives, Time Attack, Survival, Precision, Multiplayer)"
    echo "   • Advanced particle effects"
    echo "   • XR support"
    echo "   • Multiplayer framework"
    echo "   • Progressive Web App (installable)"
else
    echo ""
    echo "❌ Deployment failed"
    echo "💡 Try running this script on your local machine instead"
fi