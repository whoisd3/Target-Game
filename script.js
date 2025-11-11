import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';

// PWA Installation and Service Worker
let deferredPrompt;
let isStandalone = false;

// Check if app is running in standalone mode
if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone) {
  isStandalone = true;
}

// Register Service Worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('ServiceWorker registered successfully:', registration.scope);
      
      // Check for updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            showUpdateNotification();
          }
        });
      });
    } catch (error) {
      console.log('ServiceWorker registration failed:', error);
    }
  });
}

// Show update notification
function showUpdateNotification() {
  const updateBanner = document.createElement('div');
  updateBanner.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: linear-gradient(135deg, #00ffff, #0080ff);
    color: #000;
    padding: 15px;
    text-align: center;
    z-index: 10000;
    font-family: 'Orbitron', monospace;
    font-weight: 700;
  `;
  updateBanner.innerHTML = `
    <div>🔄 New version available!</div>
    <button onclick="updateApp()" style="margin-left: 10px; padding: 5px 15px; background: #000; color: #00ffff; border: none; border-radius: 5px; cursor: pointer;">Update Now</button>
    <button onclick="this.parentElement.remove()" style="margin-left: 5px; padding: 5px 15px; background: transparent; color: #000; border: 1px solid #000; border-radius: 5px; cursor: pointer;">Later</button>
  `;
  document.body.appendChild(updateBanner);
}

// Update app function
window.updateApp = () => {
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
    window.location.reload();
  }
};

// Install prompt handling
window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  showInstallButton();
});

// Show install button
function showInstallButton() {
  if (isStandalone || !deferredPrompt) return;
  
  const installButton = document.createElement('button');
  installButton.id = 'installButton';
  installButton.className = 'menu-btn primary';
  installButton.innerHTML = '📱 INSTALL APP';
  installButton.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1001;
    animation: pulse 2s infinite;
  `;
  
  installButton.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      console.log(`User ${outcome} the install prompt`);
      deferredPrompt = null;
      installButton.remove();
    }
  });
  
  document.body.appendChild(installButton);
}

// Handle app installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed');
  const installButton = document.getElementById('installButton');
  if (installButton) {
    installButton.remove();
  }
  
  // Show thank you message
  setTimeout(() => {
    if (currentState === GameState.MENU) {
      showInstallSuccessMessage();
    }
  }, 1000);
});

// Show install success message
function showInstallSuccessMessage() {
  const successDiv = document.createElement('div');
  successDiv.style.cssText = `
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: linear-gradient(135deg, rgba(0, 255, 255, 0.1), rgba(0, 100, 255, 0.1));
    border: 2px solid #00ffff;
    border-radius: 15px;
    padding: 30px;
    text-align: center;
    z-index: 10000;
    font-family: 'Orbitron', monospace;
    color: #00ffff;
    backdrop-filter: blur(10px);
  `;
  successDiv.innerHTML = `
    <h3>🎉 Installation Complete!</h3>
    <p style="margin: 15px 0;">Target Nexus is now installed on your device!</p>
    <button onclick="this.parentElement.remove()" style="padding: 10px 20px; background: #00ffff; color: #000; border: none; border-radius: 5px; cursor: pointer; font-family: 'Orbitron', monospace; font-weight: 700;">AWESOME!</button>
  `;
  document.body.appendChild(successDiv);
  
  setTimeout(() => {
    if (successDiv.parentElement) {
      successDiv.remove();
    }
  }, 5000);
}

// Handle URL parameters for shortcuts
function handleURLParams() {
  const urlParams = new URLSearchParams(window.location.search);
  const action = urlParams.get('action');
  
  switch (action) {
    case 'play':
      setTimeout(() => startGame(), 1000);
      break;
    case 'leaderboard':
      setTimeout(() => setState(GameState.LEADERBOARD), 1000);
      break;
  }
}

// Game state management
const GameState = {
  MENU: 'menu',
  MODE_SELECT: 'mode_select',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  LEADERBOARD: 'leaderboard',
  SETTINGS: 'settings'
};

// Game Modes
const GameMode = {
  CLASSIC: 'classic',
  TIME_ATTACK: 'time_attack',
  SURVIVAL: 'survival',
  PRECISION: 'precision',
  MULTIPLAYER: 'multiplayer'
};

let currentState = GameState.MENU;
let currentGameMode = GameMode.CLASSIC;
let gameSettings = {
  playerName: 'Anonymous',
  soundEnabled: true,
  particlesEnabled: true,
  volume: 70,
  timeBonusEnabled: true,
  selectedGameMode: GameMode.CLASSIC
};

// Enhanced Sound System using Howler.js
class SoundManager {
  constructor() {
    this.sounds = {};
    this.initialized = false;
    this.loadingSounds = false;
  }

  async initialize() {
    if (this.initialized || this.loadingSounds) return;
    
    this.loadingSounds = true;
    console.log('🔊 Initializing sound system with Web Audio API...');
    
    try {
      // Use Web Audio API for reliable sound generation
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      this.audioContext = new AudioContext();
      
      // Create simple beep sounds - no corrupted base64 data
      this.sounds = {
        targetHit: this.createBeep(800, 0.1),
        levelUp: this.createBeep([523, 659, 784], 0.3),
        timeBonus: this.createBeep([440, 554], 0.2),
        combo: this.createBeep(1000, 0.05),
        gameStart: this.createBeep([262, 330, 392], 0.4),
        gameOver: this.createBeep([220, 185], 0.5),
        buttonClick: this.createBeep(600, 0.08),
        pause: this.createBeep(400, 0.2),
        shapeChange: this.createBeep([500, 700], 0.15),
        miss: this.createBeep(150, 0.25),
        comboSounds: {
          combo3: this.createBeep([800, 1000], 0.15),
          combo5: this.createBeep([800, 1000, 1200], 0.2),
          combo10: this.createBeep([800, 1000, 1200, 1500], 0.3)
        }
      };

      this.initialized = true;
      this.loadingSounds = false;
      console.log('✅ Sound system initialized successfully with Web Audio API');
    } catch (error) {
      console.warn('Sound system initialization failed, using silent fallback:', error);
      this.initialized = false;
      this.loadingSounds = false;
      
      // Create silent fallback sounds
      this.sounds = {
        targetHit: { play: () => {} },
        levelUp: { play: () => {} },
        timeBonus: { play: () => {} },
        combo: { play: () => {} },
        gameStart: { play: () => {} },
        gameOver: { play: () => {} },
        buttonClick: { play: () => {} },
        pause: { play: () => {} },
        shapeChange: { play: () => {} },
        miss: { play: () => {} },
        comboSounds: {
          combo3: { play: () => {} },
          combo5: { play: () => {} },
          combo10: { play: () => {} }
        }
      };
    }
  }

  createBeep(frequency, duration) {
    return {
      play: () => {
        if (!gameSettings.soundEnabled || !this.audioContext) return;
        
        try {
          if (this.audioContext.state === 'suspended') {
            this.audioContext.resume();
          }

          if (Array.isArray(frequency)) {
            frequency.forEach((freq, index) => {
              setTimeout(() => {
                this.playTone(freq, duration / frequency.length);
              }, index * (duration / frequency.length * 1000));
            });
          } else {
            this.playTone(frequency, duration);
          }
        } catch (e) {
          // Silent fallback
        }
      }
    };
  }

  playTone(freq, duration) {
    if (!this.audioContext) return;
    const osc = this.audioContext.createOscillator();
    const gain = this.audioContext.createGain();
    
    osc.connect(gain);
    gain.connect(this.audioContext.destination);
    
    osc.frequency.setValueAtTime(freq, this.audioContext.currentTime);
    osc.type = 'sine';
    
    const vol = (gameSettings.volume / 100) * 0.1;
    gain.gain.setValueAtTime(0, this.audioContext.currentTime);
    gain.gain.linearRampToValueAtTime(vol, this.audioContext.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
    
    osc.start(this.audioContext.currentTime);
    osc.stop(this.audioContext.currentTime + duration);
  }

  // Public methods for game events
  playTargetHit() {
    if (this.sounds.targetHit) {
      this.sounds.targetHit.play();
    }
  }

  playLevelUp() {
    if (this.sounds.levelUp) {
      this.sounds.levelUp.play();
    }
  }

  playTimeBonus() {
    if (this.sounds.timeBonus) {
      this.sounds.timeBonus.play();
    }
  }

  playComboSound(comboCount) {
    if (comboCount >= 10 && this.sounds.comboSounds?.combo10) {
      this.sounds.comboSounds.combo10.play();
    } else if (comboCount >= 5 && this.sounds.comboSounds?.combo5) {
      this.sounds.comboSounds.combo5.play();
    } else if (comboCount >= 3 && this.sounds.comboSounds?.combo3) {
      this.sounds.comboSounds.combo3.play();
    } else if (this.sounds.combo) {
      this.sounds.combo.play();
    }
  }

  playGameStart() {
    if (this.sounds.gameStart) {
      this.sounds.gameStart.play();
    }
  }

  playGameOver() {
    if (this.sounds.gameOver) {
      this.sounds.gameOver.play();
    }
  }

  playButtonClick() {
    if (this.sounds.buttonClick) {
      this.sounds.buttonClick.play();
    }
  }

  playPause() {
    if (this.sounds.pause) {
      this.sounds.pause.play();
    }
  }

  playShapeChange() {
    if (this.sounds.shapeChange) {
      this.sounds.shapeChange.play();
    }
  }

  playMiss() {
    if (this.sounds.miss) {
      this.sounds.miss.play();
    }
  }

  // Utility methods
  setMasterVolume(volume) {
    // No-op for Web Audio API implementation
    console.log(`Master volume set to: ${volume}%`);
  }

  stopAllSounds() {
    // No-op for Web Audio API implementation
    console.log('Stopping all sounds');
  }
  
  // Background Music Management (simplified for Web Audio API)
  currentBackgroundMusic = null;
  
  playBackgroundMusic(track = 'menu') {
    // Simplified - no background music for now with Web Audio API
    console.log(`🎵 Background music track: ${track} (Web Audio API - simplified)`);
  }
  
  stopBackgroundMusic() {
    // Simplified - no background music for now
    this.currentBackgroundMusic = null;
  }
  
  fadeOutBackgroundMusic(duration = 1000) {
    // Simplified - no background music for now
    this.stopBackgroundMusic();
  }
  
  setBackgroundMusicVolume(volume) {
    // Simplified - no background music for now
    console.log(`Background music volume: ${volume}`);
  }
  
  getMusicForGameMode(gameMode) {
    switch (gameMode) {
      case GameMode.TIME_ATTACK:
      case GameMode.SURVIVAL:
        return 'intense';
      case GameMode.PRECISION:
      case GameMode.CLASSIC:
      default:
        return 'gameplay';
    }
  }
}

const soundManager = new SoundManager();

// Multiplayer System
let multiplayerManager = null;
let multiplayerUI = null;
let isMultiplayerMode = false;

// Initialize multiplayer if supported
function initializeMultiplayer() {
  if (typeof MultiplayerManager !== 'undefined') {
    multiplayerManager = new MultiplayerManager();
    multiplayerUI = new MultiplayerUI(multiplayerManager);
    console.log('🎮 Multiplayer system ready');
    return true;
  } else {
    console.warn('⚠️ Multiplayer not available');
    return false;
  }
}

// Advanced Particle System
let advancedParticles = null;

// Initialize advanced particle system
function initializeAdvancedParticles() {
  if (typeof AdvancedParticleSystem !== 'undefined') {
    advancedParticles = new AdvancedParticleSystem(scene, renderer);
    console.log('🌟 Advanced particle system ready');
    return true;
  } else {
    console.warn('⚠️ Advanced particles not available');
    return false;
  }
}

// XR (VR/AR) System
let xrManager = null;
let xrUIManager = null;

// Initialize XR system
function initializeXR() {
  if (typeof XRManager !== 'undefined') {
    xrManager = new XRManager(scene, camera, renderer);
    xrUIManager = new XRUIManager(xrManager);
    
    // Set up XR event handlers
    xrManager.onTargetHit = (position) => {
      // Handle XR target hit
      handleXRTargetHit(position);
    };
    
    xrManager.onTargetMiss = () => {
      // Handle XR target miss
      handleXRTargetMiss();
    };
    
    console.log('🥽 XR system ready');
    return true;
  } else {
    console.warn('⚠️ XR not available');
    return false;
  }
}

// Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 100);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('webglCanvas'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(ambientLight, dirLight);

// Background particles
const bgParticlesCount = 2000;
const bgPositions = new Float32Array(bgParticlesCount * 3);
for (let i = 0; i < bgParticlesCount; i++) {
  bgPositions[i * 3] = (Math.random() - 0.5) * 20;
  bgPositions[i * 3 + 1] = (Math.random() - 0.5) * 20;
  bgPositions[i * 3 + 2] = (Math.random() - 0.5) * 20;
}
const bgGeometry = new THREE.BufferGeometry();
bgGeometry.setAttribute('position', new THREE.BufferAttribute(bgPositions, 3));
const bgMaterial = new THREE.PointsMaterial({ size: 0.05, color: 0x00ffff, transparent: true, opacity: 0.3 });
const bgParticles = new THREE.Points(bgGeometry, bgMaterial);
scene.add(bgParticles);

// UI Elements
const scoreEl = document.getElementById('score');
const highScoreEl = document.getElementById('highScore');
const levelEl = document.getElementById('level');
const timerEl = document.getElementById('reaction');
const infoEl = document.getElementById('info');
const progressBar = document.getElementById('progressBar');

// Game variables
let score = 0, highScore = 0, level = 1, gameTime = 30, timer = null;
let spawnDelay = 1500, shapeIndex = 0, reactionStart = null;
let isPaused = false, isShapeChanging = false;
let combo = 0, comboTimer = null, bestReactionTime = 999;
let currentReactionTime = 0, misses = 0, lives = 3;
let gameStartTime = 0; // Track when game started to prevent immediate clicks
const shapes = ['sphere', 'cube', 'torus', 'icosahedron', 'octahedron'];
const colorMap = [0xff69b4, 0x00ffff, 0x00ff00, 0xffa500, 0xff0000];

// UI Elements (add new ones)
const comboEl = document.getElementById('combo');
const missesEl = document.getElementById('misses');
const currentReactionEl = document.getElementById('currentReactionTime');
const bestReactionEl = document.getElementById('bestReactionTime');
const reactionBar = document.getElementById('reactionBar');
const bonusNotifications = document.getElementById('bonusNotifications');
const comboDisplay = document.getElementById('comboDisplay');
const comboMultiplierEl = document.getElementById('comboMultiplier');

// Load settings and high score from localStorage
function loadGameData() {
  const savedSettings = localStorage.getItem('targetGameSettings');
  if (savedSettings) {
    gameSettings = { ...gameSettings, ...JSON.parse(savedSettings) };
  }
  
  const savedHighScore = localStorage.getItem('targetGameHighScore');
  if (savedHighScore) {
    highScore = parseInt(savedHighScore);
  }

  const savedBestReaction = localStorage.getItem('targetGameBestReaction');
  if (savedBestReaction) {
    bestReactionTime = parseFloat(savedBestReaction);
  }
  
  // Apply settings
  document.getElementById('playerNameInput').value = gameSettings.playerName;
  document.getElementById('soundToggle').checked = gameSettings.soundEnabled;
  document.getElementById('particleToggle').checked = gameSettings.particlesEnabled;
  document.getElementById('volumeSlider').value = gameSettings.volume;
  document.getElementById('volumeValue').textContent = gameSettings.volume + '%';
  document.getElementById('timeBonusToggle').checked = gameSettings.timeBonusEnabled;
  
  bgParticles.visible = gameSettings.particlesEnabled;
}

// Save settings and high score
function saveGameData() {
  localStorage.setItem('targetGameSettings', JSON.stringify(gameSettings));
  localStorage.setItem('targetGameHighScore', highScore.toString());
  localStorage.setItem('targetGameBestReaction', bestReactionTime.toString());
}

// Leaderboard management
function getLeaderboard() {
  const saved = localStorage.getItem('targetGameLeaderboard');
  return saved ? JSON.parse(saved) : [];
}

function saveScore(playerName, score, gameMode = 'classic') {
  const leaderboard = getLeaderboard();
  const modeDisplay = {
    'classic': '🎯',
    'time_attack': '⚡',
    'survival': '🛡️',
    'precision': '🔍',
    'multiplayer': '👥'
  };
  
  leaderboard.push({ 
    name: playerName, 
    score: score, 
    mode: gameMode,
    modeIcon: modeDisplay[gameMode] || '🎯',
    date: new Date().toLocaleDateString() 
  });
  leaderboard.sort((a, b) => b.score - a.score);
  const topScores = leaderboard.slice(0, 10); // Keep top 10
  localStorage.setItem('targetGameLeaderboard', JSON.stringify(topScores));
}

function displayLeaderboard() {
  const leaderboard = getLeaderboard();
  const listEl = document.getElementById('leaderboardList');
  
  if (leaderboard.length === 0) {
    listEl.innerHTML = '<div style="text-align: center; color: #666; padding: 20px;">No scores yet!</div>';
    return;
  }
  
  listEl.innerHTML = leaderboard.map((entry, index) => `
    <div class="leaderboard-entry">
      <span class="leaderboard-rank">#${index + 1}</span>
      <span class="leaderboard-mode">${entry.modeIcon || '🎯'}</span>
      <span class="leaderboard-name">${entry.name}</span>
      <span class="leaderboard-score">${entry.score}</span>
    </div>
  `).join('');
}

// State management functions
function setState(newState) {
  currentState = newState;
  
  // Hide all menus
  document.querySelectorAll('.overlay-menu').forEach(menu => menu.classList.add('hidden'));
  document.getElementById('hud').classList.add('hidden');
  
  // Handle background music based on state
  switch (newState) {
    case GameState.MENU:
      document.getElementById('mainMenu').classList.remove('hidden');
      soundManager.playBackgroundMusic('menu');
      break;
    case GameState.MODE_SELECT:
      document.getElementById('modeSelectMenu').classList.remove('hidden');
      soundManager.playBackgroundMusic('menu');
      // Auto-select classic mode if none is selected
      if (!currentGameMode) {
        currentGameMode = GameMode.CLASSIC;
        setTimeout(() => {
          const classicCard = document.querySelector('.mode-card[data-mode="classic"]');
          if (classicCard) {
            classicCard.classList.add('selected');
          }
          // Update start button
          const startBtn = document.getElementById('startSelectedModeBtn');
          const startBtnText = document.getElementById('startButtonText');
          if (startBtn && startBtnText) {
            startBtn.disabled = false;
            startBtn.classList.remove('disabled');
            startBtnText.textContent = 'START GAME';
          }
        }, 100);
      } else {
        // Mode already selected, update button immediately
        const startBtn = document.getElementById('startSelectedModeBtn');
        const startBtnText = document.getElementById('startButtonText');
        if (startBtn && startBtnText) {
          startBtn.disabled = false;
          startBtn.classList.remove('disabled');
          startBtnText.textContent = 'START GAME';
        }
        // Ensure the selected mode card is highlighted
        setTimeout(() => {
          const selectedCard = document.querySelector(`.mode-card[data-mode="${currentGameMode}"]`);
          if (selectedCard) {
            document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
            selectedCard.classList.add('selected');
          }
        }, 100);
      }
      break;
    case GameState.PLAYING:
      document.getElementById('hud').classList.remove('hidden');
      const musicTrack = soundManager.getMusicForGameMode(currentGameMode);
      soundManager.playBackgroundMusic(musicTrack);
      break;
    case GameState.PAUSED:
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('pauseMenu').classList.remove('hidden');
      // Keep current music but lower volume
      soundManager.setBackgroundMusicVolume(0.1);
      break;
    case GameState.GAME_OVER:
      document.getElementById('gameOverMenu').classList.remove('hidden');
      soundManager.fadeOutBackgroundMusic(2000);
      break;
    case GameState.LEADERBOARD:
      document.getElementById('leaderboardMenu').classList.remove('hidden');
      displayLeaderboard();
      soundManager.playBackgroundMusic('menu');
      break;
    case GameState.SETTINGS:
      document.getElementById('settingsMenu').classList.remove('hidden');
      soundManager.playBackgroundMusic('menu');
      break;
    case 'install':
      document.getElementById('howToInstallMenu').classList.remove('hidden');
      break;
  }
}

// Shape generator (unchanged)
function createParticleShape(type, color) {
  const particleCount = 1200;
  const positions = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    let x = 0, y = 0, z = 0;
    if (type === 'sphere') {
      const theta = Math.random() * 2 * Math.PI;
      const phi = Math.acos(2 * Math.random() - 1);
      const r = 0.8 * Math.random();
      x = r * Math.sin(phi) * Math.cos(theta);
      y = r * Math.sin(phi) * Math.sin(theta);
      z = r * Math.cos(phi);
    } else if (type === 'cube') {
      x = (Math.random() - 0.5) * 1.6;
      y = (Math.random() - 0.5) * 1.6;
      z = (Math.random() - 0.5) * 1.6;
    } else if (type === 'torus') {
      const R = 0.8, r = 0.3;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI * 2;
      x = (R + r * Math.cos(phi)) * Math.cos(theta);
      y = r * Math.sin(phi);
      z = (R + r * Math.cos(phi)) * Math.sin(theta);
    } else {
      x = (Math.random() - 0.5) * 1.6;
      y = (Math.random() - 0.5) * 1.6;
      z = (Math.random() - 0.5) * 1.6;
    }
    positions.set([x, y, z], i * 3);
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    size: 0.05,
    color,
    transparent: true,
    opacity: 0.85,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  return new THREE.Points(geometry, material);
}

// Initial target
let targetMesh = createParticleShape(shapes[shapeIndex], colorMap[0]);
scene.add(targetMesh);

function spawnTarget() {
  if (isPaused || currentState !== GameState.PLAYING) return;
  
  const newX = (Math.random() - 0.5) * 6;
  const newY = (Math.random() - 0.5) * 4;
  targetMesh.position.set(newX, newY, 0);
  
  // Adjust target size based on game mode
  let targetScale = 1;
  if (currentGameMode === GameMode.PRECISION) {
    targetScale = 0.6; // Smaller targets for precision mode
  } else if (currentGameMode === GameMode.TIME_ATTACK) {
    targetScale = 1.2; // Slightly larger for fast-paced mode
  }
  
  targetMesh.scale.setScalar(targetScale);
  
  // Trigger spawn particle effect
  if (advancedParticles) {
    advancedParticles.triggerSpawnEffect(targetMesh.position.clone());
  }
  
  reactionStart = performance.now();
}

function updateUI() {
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;
  levelEl.textContent = level;
  comboEl.textContent = combo;
  missesEl.textContent = misses;
  currentReactionEl.textContent = currentReactionTime.toFixed(2) + 's';
  bestReactionEl.textContent = bestReactionTime.toFixed(2) + 's';
  
  // Update timer and progress bar based on game mode
  if (currentGameMode === GameMode.SURVIVAL) {
    timerEl.textContent = `Lives: ${5 - misses}`;
    progressBar.style.width = `${((5 - misses) / 5) * 100}%`;
    progressBar.style.backgroundColor = misses >= 3 ? '#ff6666' : '#00ffff';
  } else {
    // For Classic mode, show both time and lives
    if (currentGameMode === GameMode.CLASSIC) {
      timerEl.textContent = `${gameTime}s | Lives: ${lives}`;
    } else {
      timerEl.textContent = gameTime;
    }
    
    let maxTime = 30; // Default
    
    switch (currentGameMode) {
      case GameMode.TIME_ATTACK:
        maxTime = 60;
        break;
      case GameMode.PRECISION:
        maxTime = 45;
        break;
      case GameMode.CLASSIC:
      default:
        maxTime = 30;
        break;
    }
    
    progressBar.style.width = `${(gameTime / maxTime) * 100}%`;
    // For Classic mode, also consider lives when setting color
    if (currentGameMode === GameMode.CLASSIC) {
      progressBar.style.backgroundColor = (gameTime <= 10 || lives <= 1) ? '#ff6666' : '#00ffff';
    } else {
      progressBar.style.backgroundColor = gameTime <= 10 ? '#ff6666' : '#00ffff';
    }
  }
  
  // Update reaction bar (green = fast, red = slow)
  const reactionPercent = Math.min((currentReactionTime / 2) * 100, 100);
  reactionBar.style.width = `${100 - reactionPercent}%`;
  
  // Update combo display
  if (combo > 1) {
    comboDisplay.classList.remove('hidden');
    comboMultiplierEl.textContent = combo;
  } else {
    comboDisplay.classList.add('hidden');
  }
}

function startGame() {
  // Reset basic game variables
  score = 0; 
  level = 1; 
  isPaused = false;
  isShapeChanging = false;
  combo = 0;
  misses = 0;
  lives = 3; // Reset lives for all modes
  currentReactionTime = 0;
  gameStartTime = performance.now(); // Record when game started
  
  // Initialize sound system on first user interaction
  soundManager.initialize();
  soundManager.playGameStart(); // 🎵 GAME START SOUND
  
  // Configure game based on selected mode
  configureGameMode();
  
  // Set up XR if active
  if (xrManager) {
    xrManager.setGameActive(true);
    xrManager.setTargetMesh(targetMesh);
  }
  
  setState(GameState.PLAYING);
  updateUI(); 
  spawnTarget();
  
  if (timer) clearInterval(timer);
  if (comboTimer) clearTimeout(comboTimer);
  
  timer = setInterval(() => {
    if (!isPaused && currentState === GameState.PLAYING) {
      if (currentGameMode === GameMode.SURVIVAL) {
        // Survival mode doesn't have a time limit, but check for game over conditions
        if (misses >= 5) {
          endGame();
        }
      } else {
        // All other modes have time limits
        gameTime--;
        updateUI();
        if (gameTime <= 0) {
          endGame();
        }
        // Classic mode also checks for lives
        if (currentGameMode === GameMode.CLASSIC && lives <= 0) {
          endGame();
        }
      }
    }
  }, 1000);
}

// Configure game settings based on selected mode
function configureGameMode() {
  switch (currentGameMode) {
    case GameMode.CLASSIC:
      gameTime = 30;
      spawnDelay = 1500;
      break;
      
    case GameMode.TIME_ATTACK:
      gameTime = 60;
      spawnDelay = 800; // Faster spawning
      break;
      
    case GameMode.SURVIVAL:
      gameTime = 999; // Effectively unlimited
      spawnDelay = 1200;
      break;
      
    case GameMode.PRECISION:
      gameTime = 45;
      spawnDelay = 2000; // Slower, more precise
      break;
      
    default:
      gameTime = 30;
      spawnDelay = 1500;
  }
}

function endGame() {
  clearInterval(timer);
  if (comboTimer) clearTimeout(comboTimer);
  
  soundManager.playGameOver(); // 🎵 GAME OVER SOUND
  
  setState(GameState.GAME_OVER);
  
  if (score > highScore) {
    highScore = score;
    saveGameData();
  }

  if (currentReactionTime > 0 && currentReactionTime < bestReactionTime) {
    bestReactionTime = currentReactionTime;
    saveGameData();
  }
  
  // Save score to leaderboard with mode info
  saveScore(gameSettings.playerName, score, currentGameMode);
  
  // Generate mode-specific final display
  let modeInfo = '';
  let modeTitle = '';
  
  switch (currentGameMode) {
    case GameMode.CLASSIC:
      modeTitle = '🎯 Classic Mode';
      const endReason = lives <= 0 ? 'No Lives Left!' : 'Time Up!';
      modeInfo = `<div>Game Over: ${endReason}</div><div>Lives Used: ${3 - lives}/3</div>`;
      break;
    case GameMode.TIME_ATTACK:
      modeTitle = '⚡ Time Attack Mode';
      break;
    case GameMode.SURVIVAL:
      modeTitle = '🛡️ Survival Mode';
      modeInfo = `<div>Survival Time: ${Math.max(0, 999 - gameTime)}s</div>`;
      break;
    case GameMode.PRECISION:
      modeTitle = '🔍 Precision Mode';
      modeInfo = misses === 0 ? '<div style="color: #00ff00;">🎉 PERFECT! No misses!</div>' : '<div style="color: #ff6666;">💥 Game over on miss</div>';
      break;
  }
  
  // Display final score
  document.getElementById('finalScoreDisplay').innerHTML = `
    <div style="font-size: 1.2em; margin-bottom: 15px; color: #00ffff;">${modeTitle}</div>
    <div style="font-size: 1.5em; margin-bottom: 10px;">Final Score: ${score}</div>
    <div>Level Reached: ${level}</div>
    <div>Best Reaction: ${bestReactionTime.toFixed(2)}s</div>
    <div>Max Combo: ${combo}</div>
    <div style="color: #ff6666;">Misses: ${misses}</div>
    ${modeInfo}
    ${score > 0 ? `<div style="margin-top: 10px; color: #00ffff;">Added to Leaderboard!</div>` : ''}
  `;
}

function pauseGame() {
  if (currentState === GameState.PLAYING) {
    isPaused = true;
    setState(GameState.PAUSED);
  }
}

function resumeGame() {
  if (currentState === GameState.PAUSED) {
    isPaused = false;
    setState(GameState.PLAYING);
    // Restore background music volume
    const musicTrack = soundManager.getMusicForGameMode(currentGameMode);
    const volume = musicTrack === 'intense' ? 0.18 : 0.2;
    soundManager.setBackgroundMusicVolume(volume);
  }
}

// Multiplayer Functions
function handleMultiplayerModeSelection() {
  showMultiplayerDialog();
}

function showMultiplayerDialog() {
  const dialog = document.createElement('div');
  dialog.className = 'multiplayer-dialog overlay-menu';
  dialog.innerHTML = `
    <div class="menu-container">
      <h2 class="menu-title">🎮 MULTIPLAYER MODE</h2>
      <div class="multiplayer-options">
        <div class="multiplayer-option">
          <h3>🏠 Host Game</h3>
          <p>Create a room and wait for another player to join</p>
          <button id="hostGameBtn" class="menu-btn primary">HOST GAME</button>
        </div>
        <div class="multiplayer-option">
          <h3>🚪 Join Game</h3>
          <p>Enter a room code to join an existing game</p>
          <input type="text" id="roomCodeInput" placeholder="Enter room code" class="room-code-input">
          <button id="joinGameBtn" class="menu-btn">JOIN GAME</button>
        </div>
        <div class="multiplayer-option">
          <h3>🤖 Practice vs AI</h3>
          <p>Practice multiplayer mechanics against AI</p>
          <button id="practiceAIBtn" class="menu-btn">VS AI</button>
        </div>
      </div>
      <button id="backFromMultiplayerBtn" class="menu-btn">BACK</button>
    </div>
  `;
  
  document.body.appendChild(dialog);
  
  // Add event listeners
  document.getElementById('hostGameBtn').addEventListener('click', () => {
    hostMultiplayerGame();
  });
  
  document.getElementById('joinGameBtn').addEventListener('click', () => {
    const roomCode = document.getElementById('roomCodeInput').value.trim();
    if (roomCode) {
      joinMultiplayerGame(roomCode);
    } else {
      showNotification('Please enter a room code', 'error');
    }
  });
  
  document.getElementById('practiceAIBtn').addEventListener('click', () => {
    startAIPractice();
  });
  
  document.getElementById('backFromMultiplayerBtn').addEventListener('click', () => {
    document.body.removeChild(dialog);
  });
}

async function hostMultiplayerGame() {
  try {
    showNotification('Initializing multiplayer...', 'info');
    
    await multiplayerManager.initialize(gameSettings.playerName);
    const roomCode = await multiplayerManager.createRoom();
    
    showNotification(`Room created: ${roomCode}`, 'success');
    
    currentGameMode = GameMode.MULTIPLAYER;
    isMultiplayerMode = true;
    
    // Show waiting screen
    showWaitingForOpponent(roomCode);
    
  } catch (error) {
    console.error('Failed to host game:', error);
    showNotification('Failed to create room', 'error');
  }
}

async function joinMultiplayerGame(roomCode) {
  try {
    showNotification('Joining game...', 'info');
    
    await multiplayerManager.initialize(gameSettings.playerName);
    await multiplayerManager.joinRoom(roomCode);
    
    showNotification(`Joined room: ${roomCode}`, 'success');
    
    currentGameMode = GameMode.MULTIPLAYER;
    isMultiplayerMode = true;
    
    // Game should start automatically when both players are ready
    
  } catch (error) {
    console.error('Failed to join game:', error);
    showNotification('Failed to join room', 'error');
  }
}

function startAIPractice() {
  // Simulate multiplayer with AI opponent
  currentGameMode = GameMode.MULTIPLAYER;
  isMultiplayerMode = true;
  
  showNotification('Starting AI practice mode...', 'info');
  
  // Initialize with simulated opponent
  if (multiplayerManager) {
    multiplayerManager.initialize(gameSettings.playerName);
  }
  
  setTimeout(() => {
    startGame();
  }, 1500);
}

function showWaitingForOpponent(roomCode) {
  const waitingScreen = document.createElement('div');
  waitingScreen.className = 'waiting-screen overlay-menu';
  waitingScreen.innerHTML = `
    <div class="menu-container">
      <h2 class="menu-title">🎮 WAITING FOR OPPONENT</h2>
      <div class="room-info">
        <div class="room-code-display">
          <span class="room-label">Room Code:</span>
          <span class="room-code">${roomCode}</span>
          <button id="copyRoomCode" class="copy-btn">📋 COPY</button>
        </div>
        <p>Share this code with your friend to join the game!</p>
      </div>
      <div class="waiting-indicator">
        <div class="loading-dots">
          <span></span><span></span><span></span>
        </div>
        <p>Waiting for player to join...</p>
      </div>
      <button id="cancelMultiplayerBtn" class="menu-btn danger">CANCEL</button>
    </div>
  `;
  
  document.body.appendChild(waitingScreen);
  
  // Copy room code functionality
  document.getElementById('copyRoomCode').addEventListener('click', () => {
    navigator.clipboard.writeText(roomCode);
    showNotification('Room code copied!', 'success');
  });
  
  document.getElementById('cancelMultiplayerBtn').addEventListener('click', () => {
    multiplayerManager.disconnect();
    document.body.removeChild(waitingScreen);
    setState(GameState.MODE_SELECT);
  });
}

function showNotification(message, type = 'info') {
  if (multiplayerUI) {
    multiplayerUI.showNotification(message, type);
  } else {
    console.log(`[${type.toUpperCase()}] ${message}`);
  }
}

// XR Event Handlers
function handleXRTargetHit(position) {
  // Simulate a target hit in XR mode
  if (currentState === GameState.PLAYING && !isPaused) {
    const reactionTime = (performance.now() - reactionStart) / 1000;
    currentReactionTime = reactionTime;
    
    // Update best reaction time
    if (reactionTime < bestReactionTime) {
      bestReactionTime = reactionTime;
      showBonusNotification('NEW BEST REACTION!', 'reaction');
    }
    
    // Combo system
    combo++;
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(resetCombo, 3000);
    
    // Score calculation
    const basePoints = 1;
    const comboMultiplier = Math.min(combo, 10);
    const points = basePoints * comboMultiplier;
    score += points;
    
    // Sound and particle effects
    soundManager.playTargetHit();
    if (advancedParticles) {
      advancedParticles.triggerHitEffect(new THREE.Vector3().copy(position), comboMultiplier);
    }
    
    // Level progression
    if (score % 5 === 0) {
      level++;
      soundManager.playLevelUp();
      if (advancedParticles) {
        advancedParticles.triggerLevelUpEffect();
      }
      showBonusNotification(`LEVEL ${level}!`, 'level');
    }
    
    updateUI();
    spawnTarget();
  }
}

function handleXRTargetMiss() {
  // Handle miss in XR mode
  if (currentState === GameState.PLAYING && !isPaused) {
    misses++;
    
    // Handle misses based on game mode
    if (currentGameMode === GameMode.PRECISION) {
      endGame();
      return;
    } else if (currentGameMode === GameMode.SURVIVAL) {
      if (misses >= 5) {
        endGame();
        return;
      }
    } else {
      gameTime = Math.max(0, gameTime - 2);
    }
    
    soundManager.playMiss();
    if (advancedParticles) {
      const missPos = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        0
      );
      advancedParticles.triggerMissEffect(missPos);
    }
    
    if (combo > 0) {
      resetCombo();
    }
    
    updateUI();
  }
}

// Critical notifications (level up, major combos) - slides in from left
function showCriticalNotification(text, type = 'normal') {
  const criticalContainer = document.getElementById('criticalNotifications');
  if (!criticalContainer) return;
  
  const notification = document.createElement('div');
  notification.className = `critical-notification ${type}`;
  notification.textContent = text;
  
  criticalContainer.appendChild(notification);
  
  // Auto-remove after 4 seconds with fade out
  setTimeout(() => {
    notification.style.animation = 'fadeOut 0.5s ease-out forwards';
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 500);
  }, 4000);
  
  // Keep only 3 critical notifications max
  const notifications = criticalContainer.children;
  if (notifications.length > 3) {
    notifications[0].remove();
  }
}

// Floating notification near score
function showFloatingNotification(text, type = 'normal') {
  const floatingContainer = document.getElementById('floatingNotifications');
  if (!floatingContainer) return;
  
  const notification = document.createElement('div');
  notification.className = `floating-notification ${type}`;
  notification.textContent = text;
  
  // Position multiple notifications with slight offset
  const existingCount = floatingContainer.children.length;
  notification.style.top = `${existingCount * -15}px`;
  
  floatingContainer.appendChild(notification);
  
  // Auto-remove after animation
  setTimeout(() => {
    if (notification.parentElement) {
      notification.remove();
    }
  }, 2000);
  
  // Keep only 3 floating notifications max
  while (floatingContainer.children.length > 3) {
    floatingContainer.children[0].remove();
  }
}

// Activity feed notifications (non-intrusive)
function showBonusNotification(text, type = 'bonus') {
  const notification = document.createElement('div');
  notification.className = `bonus-notification ${type}`;
  
  // Add icon based on type
  let icon = '🎯';
  switch (type) {
    case 'combo':
      icon = '🔥';
      break;
    case 'reaction':
      icon = '⚡';
      break;
    case 'level':
      icon = '⬆️';
      break;
    case 'time':
      icon = '⏱️';
      break;
    default:
      icon = '🎯';
  }
  
  notification.innerHTML = `<span style="margin-right: 5px;">${icon}</span>${text}`;
  
  bonusNotifications.appendChild(notification);
  
  // Auto-remove after 3 seconds with fade animation
  setTimeout(() => {
    notification.classList.add('fade-out');
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 300);
  }, 3000);
  
  // Keep only the latest 3 notifications (mobile optimized)
  const notifications = bonusNotifications.children;
  if (notifications.length > 3) {
    notifications[0].remove();
  }
}

function resetCombo() {
  combo = 0;
  comboDisplay.classList.add('hidden');
  if (comboTimer) clearTimeout(comboTimer);
}

function addTimeBonus(seconds, reason) {
  if (!gameSettings.timeBonusEnabled) return;
  
  // Disable time bonuses for Time Attack mode to maintain strict 60-second limit
  if (currentGameMode === GameMode.TIME_ATTACK) {
    return;
  }
  
  gameTime += seconds;
  soundManager.playTimeBonus(); // 🎵 TIME BONUS SOUND
  showBonusNotification(`+${seconds}s TIME! ${reason}`, 'time');
}

function handleClick(event) {
  if (currentState !== GameState.PLAYING || isPaused || isShapeChanging) return;
  
  // Prevent clicks for first 500ms after game start to avoid accidental immediate clicks
  const timeSinceStart = performance.now() - gameStartTime;
  if (timeSinceStart < 500) {
    return;
  }
  
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(targetMesh);
  
  if (intersects.length > 0) {
    const reactionTime = (performance.now() - reactionStart) / 1000;
    currentReactionTime = reactionTime;
    console.log(`Reaction time: ${reactionTime.toFixed(2)}s`);
    
    // Update best reaction time
    if (reactionTime < bestReactionTime) {
      bestReactionTime = reactionTime;
      showBonusNotification('NEW BEST REACTION!', 'reaction');
    }
    
    // Combo system
    combo++;
    if (comboTimer) clearTimeout(comboTimer);
    comboTimer = setTimeout(resetCombo, 3000); // Reset combo after 3 seconds
    
    // Score with combo multiplier
    const basePoints = 1;
    const comboMultiplier = Math.min(combo, 10); // Cap at 10x
    const points = basePoints * comboMultiplier;
    score += points;
    
    // Floating score notification near score display
    if (combo > 1) {
      showFloatingNotification(`+${points} (x${comboMultiplier})`, combo >= 5 ? 'combo' : 'bonus');
    } else {
      showFloatingNotification(`+${points}`, 'normal');
    }
    
    // Sound effects
    soundManager.playTargetHit(); // 🎵 TARGET HIT SOUND
    if (combo > 1) {
      soundManager.playComboSound(combo); // 🎵 COMBO SOUND
    }
    
    // Particle effects
    if (advancedParticles) {
      advancedParticles.triggerHitEffect(targetMesh.position.clone(), comboMultiplier);
      if (combo >= 5) {
        advancedParticles.triggerComboEffect(targetMesh.position.clone(), combo);
      }
    }
    
    // Visual feedback
    scoreEl.classList.add('updated');
    setTimeout(() => scoreEl.classList.remove('updated'), 400);
    
    // Combo notifications
    if (combo === 5) {
      showBonusNotification('5 HIT COMBO!', 'combo');
      showCriticalNotification('🔥 COMBO x5!', 'normal');
      addTimeBonus(2, 'COMBO BONUS');
    } else if (combo === 10) {
      showBonusNotification('10 HIT COMBO!', 'combo');
      showCriticalNotification('🔥 MEGA COMBO!', 'mega');
      addTimeBonus(3, 'MEGA COMBO');
    } else if (combo % 15 === 0) {
      showBonusNotification(`${combo} HIT COMBO!`, 'combo');
      showCriticalNotification(`🔥 ${combo}x ULTIMATE!`, 'mega');
      addTimeBonus(5, 'ULTIMATE COMBO');
    }
    
    // Fast reaction bonuses
    if (reactionTime < 0.5) {
      addTimeBonus(1, 'LIGHTNING FAST');
      showBonusNotification('LIGHTNING REFLEXES!', 'reaction');
      showFloatingNotification('⚡ FAST!', 'bonus');
    } else if (reactionTime < 0.8) {
      addTimeBonus(1, 'QUICK SHOT');
    }
    
    // Level progression
    if (score % 5 === 0) {
      level++;
      soundManager.playLevelUp(); // 🎵 LEVEL UP SOUND
      spawnDelay = Math.max(500, spawnDelay - 200);
      targetMesh.material.size = Math.max(0.02, targetMesh.material.size - 0.005);
      targetMesh.material.color.setHex(colorMap[(level - 1) % colorMap.length]);
      showBonusNotification(`LEVEL ${level}!`, 'level');
      showCriticalNotification(`⬆️ LEVEL ${level}!`, 'level');
      
      // Level up particle effect
      if (advancedParticles) {
        advancedParticles.triggerLevelUpEffect();
      }
      
      // Level up time bonus
      addTimeBonus(3, 'LEVEL UP');
    }
    
    updateUI();
    spawnTarget();
  } else {
    // Miss penalty - increment miss counter, lose time, and reset combo
    misses++;
    
    // Handle misses based on game mode
    if (currentGameMode === GameMode.PRECISION) {
      // Precision mode: Game over on any miss
      endGame();
      return;
    } else if (currentGameMode === GameMode.SURVIVAL) {
      // Survival mode: Check if max misses reached (handled in timer)
      if (misses >= 5) {
        endGame();
        return;
      }
    } else if (currentGameMode === GameMode.CLASSIC) {
      // Classic mode: Lose a life instead of time penalty
      lives--;
    } else {
      // Time Attack: Time penalty for missing
      gameTime = Math.max(0, gameTime - 2);
    }
    
    // Play miss sound and show visual feedback
    soundManager.playMiss(); // 🎵 MISS SOUND
    
    // Particle effects for miss
    if (advancedParticles) {
      // Create a miss effect at a random position around the screen
      const missPos = new THREE.Vector3(
        (Math.random() - 0.5) * 6,
        (Math.random() - 0.5) * 4,
        0
      );
      advancedParticles.triggerMissEffect(missPos);
    }
    
    // Reset combo if any
    if (combo > 0) {
      resetCombo();
      showBonusNotification('COMBO LOST!', 'combo');
    }
    
    // Show appropriate miss notifications based on mode
    if (currentGameMode === GameMode.SURVIVAL) {
      const livesLeft = 5 - misses;
      showFloatingNotification(`${livesLeft} LIVES LEFT!`, 'penalty');
      showBonusNotification(`MISSED! ${livesLeft} LIVES REMAINING`, 'miss');
    } else if (currentGameMode === GameMode.CLASSIC) {
      const livesLeft = lives;
      if (livesLeft > 0) {
        showFloatingNotification(`${livesLeft} LIVES LEFT!`, 'penalty');
        showBonusNotification(`MISSED! ${livesLeft} LIVES REMAINING`, 'miss');
      } else {
        showFloatingNotification('GAME OVER!', 'penalty');
        showBonusNotification('NO LIVES LEFT!', 'miss');
      }
    } else if (currentGameMode !== GameMode.PRECISION) {
      showFloatingNotification('-2s TIME!', 'penalty');
      showBonusNotification('MISSED! -2 SECONDS', 'miss');
    }
    
    showCriticalNotification('❌ MISS!', 'miss');
    
    // Flash the misses counter to draw attention
    if (missesEl) {
      missesEl.classList.add('penalty-flash');
      setTimeout(() => missesEl.classList.remove('penalty-flash'), 600);
    }
    
    updateUI();
  }
}

// Event Listeners
document.getElementById('playButton').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.MODE_SELECT);
});

// Game Mode Selection Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  // Initialize multiplayer system
  initializeMultiplayer();
  
  // Initialize advanced particle system
  initializeAdvancedParticles();
  
  // Initialize XR system
  initializeXR();
  
  // Create XR buttons if supported
  if (xrUIManager && (xrManager?.vrSupported || xrManager?.arSupported)) {
    xrUIManager.createXRButtons();
  }
  
  // Mode card selection
  document.querySelectorAll('.mode-card').forEach(card => {
    card.addEventListener('click', () => {
      soundManager.playButtonClick();
      
      // Handle multiplayer mode
      if (card.dataset.mode === 'multiplayer') {
        if (multiplayerManager) {
          handleMultiplayerModeSelection();
        } else {
          showNotification('Multiplayer not available', 'error');
        }
        return;
      }
      
      // Remove previous selection
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      
      // Select current card
      card.classList.add('selected');
      currentGameMode = card.dataset.mode;
      gameSettings.selectedGameMode = currentGameMode;
      
      // Update start button
      const startBtn = document.getElementById('startSelectedModeBtn');
      const startBtnText = document.getElementById('startButtonText');
      if (startBtn && startBtnText) {
        startBtn.disabled = false;
        startBtn.classList.remove('disabled');
        startBtnText.textContent = 'START GAME';
      }
      
      saveGameData();
    });
  });
  
  // Start selected mode button
  document.getElementById('startSelectedModeBtn').addEventListener('click', () => {
    // Ensure a mode is selected - default to classic if none selected
    if (!currentGameMode) {
      currentGameMode = GameMode.CLASSIC;
      // Visually select the classic mode card
      document.querySelectorAll('.mode-card').forEach(c => c.classList.remove('selected'));
      const classicCard = document.querySelector('.mode-card[data-mode="classic"]');
      if (classicCard) {
        classicCard.classList.add('selected');
      }
    }
    
    soundManager.playButtonClick();
    
    // Add a small delay before starting the game to prevent touch issues
    setTimeout(() => {
      startGame();
    }, 150);
  });
  
  // Back from mode select
  document.getElementById('backFromModeSelectBtn').addEventListener('click', () => {
    soundManager.playButtonClick();
    setState(GameState.MENU);
  });
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  startGame();
});

document.getElementById('leaderboardButton').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.LEADERBOARD);
});

document.getElementById('settingsButton').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.SETTINGS);
});

document.getElementById('howToInstallButton').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState('install');
});

document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.MENU);
});

document.getElementById('backFromSettingsBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.MENU);
});

document.getElementById('backFromInstallBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.MENU);
});

document.getElementById('mainMenuFromPauseBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  clearInterval(timer);
  setState(GameState.MENU);
});

document.getElementById('mainMenuFromGameOverBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  setState(GameState.MENU);
});

document.getElementById('pauseButton').addEventListener('click', () => {
  soundManager.playPause(); // 🎵 PAUSE SOUND
  pauseGame();
});

document.getElementById('resumeButton').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  resumeGame();
});

document.getElementById('restartFromPauseBtn').addEventListener('click', () => {
  soundManager.playButtonClick(); // 🎵 BUTTON CLICK SOUND
  clearInterval(timer);
  startGame();
});

document.getElementById('clearLeaderboardBtn').addEventListener('click', () => {
  localStorage.removeItem('targetGameLeaderboard');
  displayLeaderboard();
});

// Settings event listeners
document.getElementById('playerNameInput').addEventListener('change', (e) => {
  gameSettings.playerName = e.target.value || 'Anonymous';
  saveGameData();
});

document.getElementById('soundToggle').addEventListener('change', (e) => {
  gameSettings.soundEnabled = e.target.checked;
  saveGameData();
  if (e.target.checked) {
    soundManager.playButtonClick(); // Test sound
  }
});

document.getElementById('volumeSlider').addEventListener('input', (e) => {
  gameSettings.volume = parseInt(e.target.value);
  document.getElementById('volumeValue').textContent = gameSettings.volume + '%';
  
  // Update Howler master volume
  soundManager.setMasterVolume(gameSettings.volume);
  
  saveGameData();
  
  // Play test sound at new volume
  if (gameSettings.soundEnabled) {
    soundManager.playButtonClick();
  }
});

document.getElementById('particleToggle').addEventListener('change', (e) => {
  gameSettings.particlesEnabled = e.target.checked;
  bgParticles.visible = e.target.checked;
  saveGameData();
});

document.getElementById('timeBonusToggle').addEventListener('change', (e) => {
  gameSettings.timeBonusEnabled = e.target.checked;
  saveGameData();
});

// Sound test button event listeners
document.getElementById('testTargetHit').addEventListener('click', () => {
  soundManager.initialize().then(() => soundManager.playTargetHit());
});

document.getElementById('testLevelUp').addEventListener('click', () => {
  soundManager.initialize().then(() => soundManager.playLevelUp());
});

document.getElementById('testCombo').addEventListener('click', () => {
  soundManager.initialize().then(() => soundManager.playComboSound(5));
});

document.getElementById('testTimeBonus').addEventListener('click', () => {
  soundManager.initialize().then(() => soundManager.playTimeBonus());
});

document.getElementById('testMiss').addEventListener('click', () => {
  soundManager.initialize().then(() => soundManager.playMiss());
});

window.addEventListener('click', handleClick);

// Enhanced mobile touch handling - only for game canvas during gameplay
window.addEventListener('touchstart', (e) => {
  // Only handle touches on the game canvas during gameplay
  if (currentState === GameState.PLAYING && !isPaused && e.target.id === 'webglCanvas') {
    e.preventDefault(); // Prevent scrolling and other touch behaviors
    const touch = e.touches[0];
    handleClick({ 
      clientX: touch.clientX, 
      clientY: touch.clientY,
      target: e.target 
    });
  }
}, { passive: false });

// Prevent double-handling on devices that support both touch and mouse
window.addEventListener('touchend', (e) => {
  if (currentState === GameState.PLAYING && !isPaused) {
    e.preventDefault(); // Prevent mouse events from firing after touch
  }
}, { passive: false });

// Prevent context menu on long press - only during gameplay
window.addEventListener('contextmenu', (e) => {
  if (currentState === GameState.PLAYING && e.target.id === 'webglCanvas') {
    e.preventDefault();
  }
});

// Handle orientation changes
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }, 100);
});

document.getElementById('shape-btn').addEventListener('click', () => {
  if (currentState !== GameState.PLAYING || isPaused) return;
  
  soundManager.playShapeChange(); // 🎵 SHAPE CHANGE SOUND
  
  isShapeChanging = true; // Prevent scoring during shape change
  scene.remove(targetMesh);
  shapeIndex = (shapeIndex + 1) % shapes.length;
  const color = colorMap[(level - 1) % colorMap.length];
  targetMesh = createParticleShape(shapes[shapeIndex], color);
  scene.add(targetMesh);
  infoEl.textContent = `Shape: ${shapes[shapeIndex].charAt(0).toUpperCase() + shapes[shapeIndex].slice(1)}`;
  
  // Reset combo when changing shapes (prevents exploiting)
  resetCombo();
  
  setTimeout(() => {
    spawnTarget();
    isShapeChanging = false; // Re-enable scoring after shape change
  }, 500);
});

// Keyboard controls
window.addEventListener('keydown', (e) => {
  switch (e.code) {
    case 'Escape':
      if (currentState === GameState.PLAYING) {
        pauseGame();
      } else if (currentState === GameState.PAUSED) {
        resumeGame();
      }
      break;
    case 'Space':
      if (currentState === GameState.PAUSED) {
        resumeGame();
      }
      e.preventDefault();
      break;
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // Update dynamic viewport height for mobile browsers
  updateMobileViewport();
});

// Handle orientation changes with dynamic viewport updates
window.addEventListener('orientationchange', () => {
  setTimeout(() => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    updateMobileViewport();
  }, 100);
});

// Update mobile viewport height dynamically - COMPREHENSIVE mobile support
function updateMobileViewport() {
  // Only run on mobile devices
  if (window.innerWidth <= 768) {
    // Set CSS custom property for consistent viewport height
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty('--vh', `${vh}px`);
    
    // Force canvas sizing for mobile
    const canvas = document.getElementById('webglCanvas');
    if (canvas) {
      canvas.style.width = '100vw';
      canvas.style.height = '100vh';
      canvas.style.position = 'fixed';
      canvas.style.top = '0';
      canvas.style.left = '0';
    }
    
    // Optimize HUD positioning for mobile browsers
    const bottomHud = document.getElementById('bottomHud');
    const topHud = document.getElementById('topHud');
    
    if (bottomHud) {
      // Smart bottom HUD positioning
      const isLandscape = window.innerWidth > window.innerHeight;
      const viewportHeight = window.innerHeight;
      const safeAreaBottom = getComputedStyle(document.documentElement).getPropertyValue('--sab') || '0px';
      
      // Position based on actual viewport and orientation
      if (isLandscape && viewportHeight < 500) {
        bottomHud.style.bottom = `max(10px, ${safeAreaBottom})`;
      } else if (viewportHeight < 600) {
        bottomHud.style.bottom = `max(15px, ${safeAreaBottom})`;
      } else {
        bottomHud.style.bottom = `max(20px, ${safeAreaBottom})`;
      }
      
      // Ensure buttons are touchable
      bottomHud.style.pointerEvents = 'auto';
      bottomHud.style.zIndex = '999';
    }
    
    if (topHud) {
      // Minimize top HUD interference
      topHud.style.pointerEvents = 'auto';
      topHud.style.opacity = '0.9';
    }
    
    // Force layout recalculation
    setTimeout(() => {
      if (bottomHud) {
        const rect = bottomHud.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        
        // If bottom HUD is still not visible, force it higher
        if (rect.bottom > viewportHeight - 5) {
          const adjustment = (rect.bottom - viewportHeight) + 25;
          bottomHud.style.bottom = `${adjustment}px`;
          console.log(`📱 Mobile: Adjusted bottom HUD by ${adjustment}px for visibility`);
        }
      }
    }, 200);
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  if (gameSettings.particlesEnabled) {
    bgParticles.rotation.y += 0.0005;
  }
  
  if (!isPaused) {
    targetMesh.rotation.y += 0.01;
    targetMesh.rotation.x += 0.005;
  }
  
  // Update advanced particle system
  if (advancedParticles) {
    advancedParticles.update();
  }
  
  // Update XR system
  if (xrManager && xrManager.isXRActive) {
    const frame = renderer.xr.getFrame();
    const referenceSpace = renderer.xr.getReferenceSpace();
    
    xrManager.update(frame, referenceSpace);
    
    // Update XR UI
    if (xrManager.xrMode) {
      xrManager.updateXRUI(score, level, gameTime);
    }
  }
  
  renderer.render(scene, camera);
}

// Initialize game
loadGameData();
updateUI();
setState(GameState.MENU);
handleURLParams(); // Handle URL shortcuts

// Initialize sound system after page load
window.addEventListener('load', () => {
  soundManager.initialize().then(() => {
    console.log('🎵 Sound system ready!');
    // Set initial master volume
    soundManager.setMasterVolume(gameSettings.volume);
  });
  
  // Initialize mobile viewport handling
  updateMobileViewport();
});

// Also update viewport when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateMobileViewport();
});

animate();