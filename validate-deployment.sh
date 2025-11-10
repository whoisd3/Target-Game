#!/bin/bash

echo "🔍 FIREBASE DEPLOYMENT VALIDATION"
echo "=================================="

echo "📋 Project Configuration:"
echo "  Project ID: target-nexus-game"
echo "  Project Number: 238606515639"
echo "  Expected URL: https://target-nexus-game.web.app/"
echo ""

echo "✅ Checking Firebase Configuration Files:"

# Check .firebaserc
if [ -f ".firebaserc" ]; then
    echo "  ✅ .firebaserc exists"
    if grep -q "target-nexus-game" .firebaserc; then
        echo "  ✅ Project ID correctly set to target-nexus-game"
    else
        echo "  ❌ Project ID mismatch in .firebaserc"
    fi
else
    echo "  ❌ .firebaserc missing"
fi

# Check firebase.json
if [ -f "firebase.json" ]; then
    echo "  ✅ firebase.json exists"
    if grep -q '"public": "."' firebase.json; then
        echo "  ✅ Public directory correctly set to root"
    else
        echo "  ❌ Public directory configuration issue"
    fi
else
    echo "  ❌ firebase.json missing"
fi

# Check GitHub Actions workflow
if [ -f ".github/workflows/firebase-hosting.yml" ]; then
    echo "  ✅ GitHub Actions workflow exists"
    if grep -q "NEXUSTARGETKEY" .github/workflows/firebase-hosting.yml; then
        echo "  ✅ Workflow configured for NEXUSTARGETKEY secret"
    else
        echo "  ❌ Secret configuration missing in workflow"
    fi
else
    echo "  ❌ GitHub Actions workflow missing"
fi

# Check essential game files
echo ""
echo "🎮 Checking Game Files:"
essential_files=("index.html" "script.js" "style.css" "manifest.json" "sw.js")
for file in "${essential_files[@]}"; do
    if [ -f "$file" ]; then
        echo "  ✅ $file exists"
    else
        echo "  ❌ $file missing"
    fi
done

# Check scripts directory
if [ -d "scripts" ]; then
    echo "  ✅ scripts/ directory exists"
    for script in "particles.js" "multiplayer.js" "xr.js"; do
        if [ -f "scripts/$script" ]; then
            echo "  ✅ scripts/$script exists"
        else
            echo "  ❌ scripts/$script missing"
        fi
    done
else
    echo "  ❌ scripts/ directory missing"
fi

echo ""
echo "🚀 DEPLOYMENT STATUS:"
echo "  📦 All files committed: $(git status --porcelain | wc -l) uncommitted changes"
echo "  🌐 Latest commit: $(git log --oneline -1)"
echo ""
echo "🎯 NEXT STEPS:"
echo "  1. Add NEXUSTARGETKEY secret to GitHub:"
echo "     https://github.com/whoisd3/Target-Game/settings/secrets/actions"
echo "  2. The workflow will auto-deploy on next push to main"
echo "  3. Check deployment status at:"
echo "     https://github.com/whoisd3/Target-Game/actions"
echo "  4. Game will be live at:"
echo "     https://target-nexus-game.web.app/"
echo ""
echo "🔧 Manual Deploy (if needed):"
echo "  ./deploy.sh (requires Firebase CLI login)"
echo ""