#!/bin/bash

echo "🎯 TARGET NEXUS - SIMPLE DEPLOYMENT SCRIPT"
echo "==========================================="
echo ""

# Check if we're logged in to Firebase
echo "🔍 Checking Firebase authentication..."
if firebase projects:list > /dev/null 2>&1; then
    echo "✅ Firebase CLI authenticated"
else
    echo "❌ Not logged in to Firebase"
    echo ""
    echo "🚀 Please run these commands on your LOCAL machine:"
    echo "   1. npm install -g firebase-tools"
    echo "   2. firebase login"
    echo "   3. git clone https://github.com/whoisd3/Target-Game.git"
    echo "   4. cd Target-Game"
    echo "   5. firebase deploy"
    echo ""
    echo "🌐 Your game will be live at: https://target-nexus-game.web.app/"
    exit 1
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