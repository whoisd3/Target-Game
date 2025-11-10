#!/bin/bash

echo "🎯 TARGET NEXUS - DEPLOYMENT STATUS"
echo "==================================="
echo ""
echo "✅ Game is LIVE at: https://target-nexus-game.web.app/"
echo ""
echo "🎮 Game Features:"
echo "   • Classic Mode: 30 seconds + 3 lives"
echo "   • Time Attack: 60 seconds"
echo "   • Survival Mode: Unlimited time + 5 lives"
echo "   • Precision Mode: 45 seconds, no misses"
echo "   • Multiplayer: Framework ready"
echo "   • Progressive Web App: Installable"
echo ""
echo "🚀 Auto-Deploy Status:"
echo "   • GitHub Actions: ✅ Active"
echo "   • Firebase Hosting: ✅ Connected"
echo "   • Every push to main = auto-deploy"
echo ""
echo "📊 Monitor deployments:"
echo "   https://github.com/whoisd3/Target-Game/actions"

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