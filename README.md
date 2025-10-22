# Target Nexus - 3D Target Game

A futuristic 3D target shooting game built with Three.js and designed as a Progressive Web App (PWA). Experience immersive target shooting with particle effects, multiple shapes, and smooth 3D graphics.

## 🎮 Features

- **3D Graphics**: Powered by Three.js for smooth, immersive 3D gameplay
- **Progressive Web App**: Install and play offline on any device
- **Mobile Optimized**: Touch controls and responsive design for mobile devices
- **Particle Effects**: Dynamic visual effects for enhanced gaming experience
- **Multiple Target Shapes**: Various target geometries for diverse gameplay
- **Fullscreen Mode**: Immersive fullscreen experience
- **Cross-Platform**: Works on desktop, mobile, and tablet devices

## 🚀 Quick Start

### Play Online
Simply visit the game URL in your web browser and start playing immediately.

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

## 🎯 How to Play

1. **Aim**: Use mouse cursor or touch to aim at targets
2. **Shoot**: Click or tap to shoot at targets
3. **Score**: Hit targets to increase your score
4. **Challenge**: Targets appear in various shapes and positions

## 📂 Project Structure

```
Target-Game/
├── index.html          # Main HTML file
├── script.js           # Game logic and Three.js implementation
├── style.css           # Styling and responsive design
├── manifest.json       # PWA manifest configuration
├── sw.js              # Service Worker for offline functionality
├── icons/             # PWA icons for different devices
└── scripts/           # Additional JavaScript modules
```

## 🔧 Development

### Prerequisites
- Modern web browser with WebGL support
- Local web server (for development)

### Running Locally
1. Clone the repository
2. Serve the files using a local web server:
   ```bash
   # Using Python
   python -m http.server 8000
   
   # Using Node.js
   npx serve .
   
   # Using PHP
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
- **Auto-updates**: Automatic updates when new versions are available
- **Cross-platform Installation**: Install on any device supporting PWAs

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
2. Create a feature branch
3. Make your changes
4. Test thoroughly on multiple devices
5. Submit a pull request

## 📄 License

This project is open source. Please check the license file for details.

## 🐛 Known Issues

- Performance may vary on older mobile devices
- Some browsers may require user interaction before audio playback
- PWA installation prompts vary by browser

## 🔮 Future Enhancements

- [ ] Multiple game modes
- [ ] Leaderboard system
- [ ] Sound effects and background music
- [ ] Multiplayer support
- [ ] Advanced particle systems
- [ ] VR/AR support

---

**Target Nexus** - Where precision meets innovation in 3D gaming.