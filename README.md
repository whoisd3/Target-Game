# Target Nexus - 3D Target Game

A futuristic 3D target shooting game built with Three.js and designed as a Progressive Web App (PWA). Experience immersive target shooting with particle effects, multiple shapes, and smooth 3D graphics.

## 🎮 Features

- **3D Graphics**: Powered by Three.js for smooth, immersive 3D gameplay
- **Progressive Web App**: Install and play offline on any device
- **Mobile Optimized**: Touch controls and responsive design for mobile devices
- **Multiple Game Modes**: Classic, Time Attack, Survival, Precision, and Multiplayer modes
- **Advanced Particle Effects**: Dynamic visual effects with custom shaders and multiple particle types
- **Enhanced Sound System**: Howler.js-powered audio with background music and spatial effects
- **Smart Notifications**: In-game notification system for achievements, combos, and game events
- **PWA Features**: Complete Progressive Web App with offline support and app installation
- **Real-time Multiplayer**: WebRTC-based peer-to-peer multiplayer with room codes
- **VR/AR Support**: WebXR compatibility for immersive virtual and augmented reality gameplay
- **Smart Leaderboard**: Local storage-based scoring with game mode tracking
- **Combo System**: Chain hits for multiplier bonuses and special effects
- **Reaction Time Tracking**: Precise timing measurements and best time records
- **Adaptive Difficulty**: Progressive challenge scaling with target size and spawn rate changes
- **Fullscreen Mode**: Immersive fullscreen experience with optimized UI
- **Cross-Platform**: Works seamlessly on desktop, mobile, tablet, VR headsets, and AR devices

## 🚀 Quick Start

### Play Online
Simply visit the game URL in your web browser and start playing immediately.

### Local Development
To run the game locally for development:

```bash
# Clone the repository
git clone https://github.com/whoisd3/Target-Game.git
cd Target-Game

# Start a local web server
python -m http.server 8000
# or
python3 -m http.server 8000

# Open http://localhost:8000 in your browser
```

### Install as PWA
1. Open the game in a supported browser (Chrome, Safari, Firefox, Edge)
2. Look for the "Install" prompt or "Add to Home Screen" option
3. Follow the browser prompts to install the app
4. Launch from your home screen or app drawer

## 🛠️ Technology Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **3D Engine**: Three.js (v0.163.0)
- **PWA**: Service Worker, Web App Manifest
- **Architecture**: Vanilla JavaScript with modular design

## 📱 Device Support

- **Desktop**: Windows, macOS, Linux (Chrome, Firefox, Safari, Edge)
- **Mobile**: iOS Safari, Android Chrome, Samsung Internet
- **Tablet**: iPad, Android tablets
- **PWA Installation**: Supported on all modern browsers

## � Key Features Highlights

### 🎮 Game Modes
- **Classic Mode**: 30 seconds, 3 lives, progressive difficulty
- **Time Attack**: 60-second rapid-fire challenge
- **Survival Mode**: Endless gameplay with limited misses
- **Precision Mode**: Ultimate accuracy test with smaller targets
- **Multiplayer**: Real-time competition (WebRTC-based)

### 🎯 Gameplay Mechanics
- **Combo System**: Chain hits for score multipliers
- **Reaction Time Tracking**: Precise timing measurements
- **Level Progression**: Increasing difficulty with smaller targets
- **Smart Notifications**: Activity feed and achievement alerts
- **Shape Variety**: Multiple target geometries (sphere, cube, torus, etc.)

### 🔧 Technical Features
- **Progressive Web App**: Full offline support and installation
- **WebXR Ready**: VR/AR compatibility for immersive gaming
- **Advanced Audio**: Howler.js with spatial sound effects
- **Particle Systems**: Dynamic visual effects and explosions
- **Cross-Platform**: Desktop, mobile, tablet, and headset support

## 🎯 How to Play

### Basic Controls
1. **Aim**: Use mouse cursor or touch to aim at targets
2. **Shoot**: Click or tap to shoot at targets
3. **Score**: Hit targets to increase your score
4. **Combo**: Chain consecutive hits for bonus multipliers

### Game Controls
- **Mouse/Touch**: Primary targeting and shooting
- **Spacebar**: Pause/Resume game
- **Escape**: Open pause menu
- **R**: Change target shape during gameplay
- **F**: Toggle fullscreen mode

### Scoring System
- Base points per hit with combo multipliers
- Reaction time bonuses for quick shots
- Level-up bonuses and achievements
- Time bonuses for consecutive hits (mode-dependent)

## 📂 Project Structure

```
Target-Game/
├── index.html          # Main HTML file with PWA manifest integration
├── script.js           # Game logic and Three.js implementation
├── style.css           # Styling and responsive design
├── manifest.json       # PWA manifest configuration
├── sw.js              # Service Worker for offline functionality
├── favicon.ico        # Website favicon
├── icons/             # PWA icons for different devices and platforms
└── scripts/           # Additional JavaScript modules
    ├── multiplayer.js # Real-time multiplayer functionality
    ├── particles.js   # Advanced particle system
    └── xr.js          # VR/AR (WebXR) support
```

## 🔧 Development

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for development)

### Running Locally
1. Clone the repository
2. Serve the files using a local web server:
   ```bash
   # Using Python (recommended for development)
   python -m http.server 8000
   python3 -m http.server 8000
   
   # Using Node.js (if you have it installed)
   npx serve .
   npx http-server
   
   # Using PHP (if available)
   php -S localhost:8000
   ```
3. Open `http://localhost:8000` in your browser

### Building for Production
The project is ready for deployment as-is. Simply upload all files to your web server ensuring:
- HTTPS is enabled (required for PWA features)
- Proper MIME types are configured
- Service Worker has appropriate caching strategies

## 🌐 PWA Features

- **Offline Play**: Game works without internet connection after first load
- **App-like Experience**: Fullscreen mode and native app feel
- **Auto-updates**: Automatic updates when new versions are available with user notification
- **Cross-platform Installation**: Install on any device supporting PWAs
- **Push Notifications**: Game update notifications and achievement alerts
- **App Shortcuts**: Quick Play and Leaderboard shortcuts from installed app

## 🎨 Customization

The game can be customized by modifying:
- **Targets**: Edit target shapes and behaviors in `script.js`
- **Visual Effects**: Modify particle systems and materials
- **UI/UX**: Update styling in `style.css`
- **Game Logic**: Enhance scoring and gameplay mechanics

## 📋 Browser Compatibility

- Chrome 88+ (recommended)
- Firefox 85+
- Safari 14+
- Edge 88+
- Mobile browsers with WebGL support

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly on multiple devices
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Test on both desktop and mobile devices
- Ensure PWA functionality remains intact
- Update documentation for new features
- Consider accessibility in UI changes

## 🏗️ Building for Production

The project is ready for deployment as-is. For production deployment:

1. **Static Hosting**: Upload all files to your web server
2. **HTTPS Required**: Ensure HTTPS is enabled (required for PWA features)
3. **MIME Types**: Configure proper MIME types for `.js` and `.json` files
4. **Service Worker**: Ensure service worker has appropriate caching strategies
5. **Icons**: Verify all PWA icons are accessible and properly sized

### Deployment Checklist
- [ ] HTTPS enabled
- [ ] All icons present in `/icons/` directory
- [ ] `manifest.json` properly configured
- [ ] Service worker caching strategy optimized
- [ ] Meta tags for social sharing configured
- [ ] Performance testing completed

## 📄 License

This project is open source. Please check the license file for details.

## ⚡ Performance Tips

### For Best Performance
- **Desktop**: Use Chrome or Firefox for optimal WebGL performance
- **Mobile**: Close other apps to free up memory
- **Low-end Devices**: Disable background particles in settings
- **Battery Saving**: Lower sound volume to extend battery life

### Troubleshooting
- **No Sound**: Check browser autoplay policies, interact with page first
- **Slow Performance**: Try disabling particles in settings
- **Installation Issues**: Clear browser cache and try again
- **Touch Issues**: Ensure you're touching the game canvas area

## 🔧 Technical Requirements

### Minimum Requirements
- **Browser**: Chrome 88+, Firefox 85+, Safari 14+, Edge 88+
- **WebGL**: Version 1.0 support required
- **JavaScript**: ES6+ support required
- **Storage**: ~2MB for offline caching

### Recommended Specifications
- **RAM**: 4GB+ for optimal performance
- **GPU**: Dedicated graphics card (desktop) or modern integrated GPU
- **Network**: Broadband for initial download and multiplayer features
- **Screen**: 1024x768 minimum resolution

## 🐛 Known Issues & Fixes

- ✅ **Fixed**: Notification system improvements for better user feedback
- ✅ **Fixed**: Enhanced PWA update notifications with user control
- Performance may vary on older mobile devices
- Some browsers may require user interaction before audio playback
- PWA installation prompts vary by browser

## 🔄 Recent Updates

### Version 2.1 (Current - notification-fix branch)
- 🔔 Enhanced notification system with multiple notification zones
- 🎵 Improved sound system with comprehensive audio feedback
- 📱 Better PWA update handling with user-friendly notifications
- 🎮 Refined multiplayer setup and room management
- 🎯 Enhanced combo system with visual feedback
- ⚡ Performance optimizations for mobile devices

## 🔮 Future Enhancements

✅ **IMPLEMENTED FEATURES:**
- [x] Multiple game modes (Classic, Time Attack, Survival, Precision, Multiplayer)
- [x] Enhanced leaderboard system with mode tracking
- [x] Advanced sound effects and background music system
- [x] Real-time multiplayer support with WebRTC
- [x] Advanced particle systems with dynamic effects
- [x] VR/AR support using WebXR API

🚀 **Additional Enhancement Ideas:**
- [ ] Advanced AI opponents with different difficulty levels
- [ ] Tournament mode with brackets and competitions
- [ ] Social features and player profiles
- [ ] Achievement system and unlockables
- [ ] Custom target shapes and themes
- [ ] Replay system and ghost mode
- [ ] Cloud save and cross-device synchronization
- [ ] Global leaderboards and competitive seasons

## 📋 Development Roadmap

### Phase 1: Core Enhancements ✅
- [x] Multiple game modes
- [x] Enhanced sound system
- [x] Notification improvements
- [x] PWA optimization

### Phase 2: Social Features 🚧
- [ ] Global leaderboards
- [ ] Player profiles and statistics
- [ ] Achievement system
- [ ] Social sharing features

### Phase 3: Advanced Features 📋
- [ ] AI opponents
- [ ] Tournament system
- [ ] Custom content creation
- [ ] Cloud synchronization

## 🙏 Credits & Acknowledgments

### Technologies Used
- **[Three.js](https://threejs.org/)**: 3D graphics library
- **[Howler.js](https://howlerjs.com/)**: Audio library
- **WebGL**: 3D rendering API
- **WebXR**: VR/AR web standard
- **WebRTC**: Real-time communication for multiplayer

### Font & Assets
- **[Orbitron Font](https://fonts.google.com/specimen/Orbitron)**: Futuristic UI typography
- **Custom Particle Systems**: Original implementations
- **Procedural Shapes**: Generated using Three.js geometry

## 📞 Support & Contact

- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions
- **Updates**: Watch repository for latest releases

---

**Target Nexus** - Where precision meets innovation in 3D gaming. 🎯✨

*Built with ❤️ for the web gaming community*