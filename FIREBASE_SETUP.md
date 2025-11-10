# 🔥 Firebase Setup Guide for Target Nexus

## Project Configuration
- **Project Name**: Target Nexus
- **Project ID**: target-nexus-game  
- **Project Number**: 238606515639
- **Live URL**: https://target-nexus-game.web.app/
- **Repository Secret**: NEXUSTARGETKEY

## 🚀 Automated Deployment (GitHub Actions)

The repository is configured for automatic deployment when you push to the main branch.

### Setup Required:
1. **Add GitHub Secret**: 
   - Go to: https://github.com/whoisd3/Target-Game/settings/secrets/actions
   - Name: `NEXUSTARGETKEY`
   - Value: [Your Firebase service account JSON key]

### What happens automatically:
- ✅ Push to `main` → Deploy to production
- ✅ Pull requests → Deploy to preview channel
- ✅ Automatic cleanup of temporary files

## 🛠️ Manual Deployment

### Option 1: Using the deployment script
```bash
./deploy.sh
```

### Option 2: Direct Firebase CLI
```bash
# Install Firebase CLI (if needed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Deploy to production
firebase deploy --project target-nexus-game
```

## 📁 Project Structure
```
.
├── index.html          # Main game file
├── script.js           # Core game logic
├── style.css           # Game styling
├── scripts/            # Advanced features
│   ├── particles.js    # Particle effects
│   ├── multiplayer.js  # Multiplayer system
│   └── xr.js          # VR/AR support
├── icons/             # PWA icons
├── firebase.json      # Firebase config
├── .firebaserc        # Project settings
└── .github/workflows/ # CI/CD automation
```

## 🎮 Game Features Deployed
- ✅ Multiple game modes (Classic with 3 lives, Time Attack, Survival, Precision)
- ✅ Advanced particle effects
- ✅ XR (VR/AR) support
- ✅ Multiplayer framework
- ✅ Progressive Web App (PWA)
- ✅ Responsive design
- ✅ Background music and sound effects

## 🔧 Troubleshooting

### Common Issues:
1. **Permission denied**: Make sure NEXUSTARGETKEY secret is properly set
2. **Deploy fails**: Check firebase.json configuration
3. **Assets not loading**: Verify file paths in index.html

### Links:
- **Firebase Console**: https://console.firebase.google.com/project/target-nexus-game
- **Live Game**: https://target-nexus-game.web.app/
- **Repository**: https://github.com/whoisd3/Target-Game
