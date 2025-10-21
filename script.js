import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';

// Game state management
const GameState = {
  MENU: 'menu',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAME_OVER: 'game_over',
  LEADERBOARD: 'leaderboard',
  SETTINGS: 'settings'
};

let currentState = GameState.MENU;
let gameSettings = {
  playerName: 'Anonymous',
  soundEnabled: true,
  particlesEnabled: true
};

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
const shapes = ['sphere', 'cube', 'torus', 'icosahedron', 'octahedron'];
const colorMap = [0xff69b4, 0x00ffff, 0x00ff00, 0xffa500, 0xff0000];

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
  
  // Apply settings
  document.getElementById('playerNameInput').value = gameSettings.playerName;
  document.getElementById('soundToggle').checked = gameSettings.soundEnabled;
  document.getElementById('particleToggle').checked = gameSettings.particlesEnabled;
  
  bgParticles.visible = gameSettings.particlesEnabled;
}

// Save settings and high score
function saveGameData() {
  localStorage.setItem('targetGameSettings', JSON.stringify(gameSettings));
  localStorage.setItem('targetGameHighScore', highScore.toString());
}

// Leaderboard management
function getLeaderboard() {
  const saved = localStorage.getItem('targetGameLeaderboard');
  return saved ? JSON.parse(saved) : [];
}

function saveScore(playerName, score) {
  const leaderboard = getLeaderboard();
  leaderboard.push({ name: playerName, score: score, date: new Date().toLocaleDateString() });
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
  
  // Show appropriate UI
  switch (newState) {
    case GameState.MENU:
      document.getElementById('mainMenu').classList.remove('hidden');
      break;
    case GameState.PLAYING:
      document.getElementById('hud').classList.remove('hidden');
      break;
    case GameState.PAUSED:
      document.getElementById('hud').classList.remove('hidden');
      document.getElementById('pauseMenu').classList.remove('hidden');
      break;
    case GameState.GAME_OVER:
      document.getElementById('gameOverMenu').classList.remove('hidden');
      break;
    case GameState.LEADERBOARD:
      document.getElementById('leaderboardMenu').classList.remove('hidden');
      displayLeaderboard();
      break;
    case GameState.SETTINGS:
      document.getElementById('settingsMenu').classList.remove('hidden');
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
  reactionStart = performance.now();
}

function updateUI() {
  scoreEl.textContent = score;
  highScoreEl.textContent = highScore;
  levelEl.textContent = level;
  timerEl.textContent = gameTime;
  progressBar.style.width = `${(gameTime / 30) * 100}%`;
}

function startGame() {
  score = 0; 
  level = 1; 
  gameTime = 30; 
  spawnDelay = 1500;
  isPaused = false;
  isShapeChanging = false;
  
  setState(GameState.PLAYING);
  updateUI(); 
  spawnTarget();
  
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    if (!isPaused && currentState === GameState.PLAYING) {
      gameTime--;
      updateUI();
      if (gameTime <= 0) {
        endGame();
      }
    }
  }, 1000);
}

function endGame() {
  clearInterval(timer);
  setState(GameState.GAME_OVER);
  
  if (score > highScore) {
    highScore = score;
    saveGameData();
  }
  
  // Save score to leaderboard
  saveScore(gameSettings.playerName, score);
  
  // Display final score
  document.getElementById('finalScoreDisplay').innerHTML = `
    <div style="font-size: 1.5em; margin-bottom: 10px;">Final Score: ${score}</div>
    <div>Level Reached: ${level}</div>
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
  }
}

function handleClick(event) {
  if (currentState !== GameState.PLAYING || isPaused || isShapeChanging) return;
  
  const rect = renderer.domElement.getBoundingClientRect();
  const mouse = new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObject(targetMesh);
  
  if (intersects.length > 0) {
    const reactionTime = ((performance.now() - reactionStart) / 1000).toFixed(2);
    console.log(`Reaction time: ${reactionTime}s`);
    score++;
    scoreEl.classList.add('updated');
    setTimeout(() => scoreEl.classList.remove('updated'), 400);
    
    if (score % 5 === 0) {
      level++;
      spawnDelay = Math.max(500, spawnDelay - 200);
      targetMesh.material.size = Math.max(0.02, targetMesh.material.size - 0.005);
      targetMesh.material.color.setHex(colorMap[(level - 1) % colorMap.length]);
    }
    updateUI();
    spawnTarget();
  }
}

// Event Listeners
document.getElementById('playButton').addEventListener('click', startGame);
document.getElementById('playAgainBtn').addEventListener('click', startGame);

document.getElementById('leaderboardButton').addEventListener('click', () => setState(GameState.LEADERBOARD));
document.getElementById('settingsButton').addEventListener('click', () => setState(GameState.SETTINGS));

document.getElementById('backFromLeaderboardBtn').addEventListener('click', () => setState(GameState.MENU));
document.getElementById('backFromSettingsBtn').addEventListener('click', () => setState(GameState.MENU));

document.getElementById('mainMenuFromPauseBtn').addEventListener('click', () => {
  clearInterval(timer);
  setState(GameState.MENU);
});

document.getElementById('mainMenuFromGameOverBtn').addEventListener('click', () => setState(GameState.MENU));

document.getElementById('pauseButton').addEventListener('click', pauseGame);
document.getElementById('resumeButton').addEventListener('click', resumeGame);
document.getElementById('restartFromPauseBtn').addEventListener('click', () => {
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
});

document.getElementById('particleToggle').addEventListener('change', (e) => {
  gameSettings.particlesEnabled = e.target.checked;
  bgParticles.visible = e.target.checked;
  saveGameData();
});

window.addEventListener('click', handleClick);
window.addEventListener('touchstart', (e) => {
  if (currentState === GameState.PLAYING && !isPaused) {
    const touch = e.touches[0];
    handleClick({ clientX: touch.clientX, clientY: touch.clientY });
  }
});

document.getElementById('shape-btn').addEventListener('click', () => {
  if (currentState !== GameState.PLAYING || isPaused) return;
  
  isShapeChanging = true; // Prevent scoring during shape change
  scene.remove(targetMesh);
  shapeIndex = (shapeIndex + 1) % shapes.length;
  const color = colorMap[(level - 1) % colorMap.length];
  targetMesh = createParticleShape(shapes[shapeIndex], color);
  scene.add(targetMesh);
  infoEl.textContent = `Shape: ${shapes[shapeIndex].charAt(0).toUpperCase() + shapes[shapeIndex].slice(1)}`;
  
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
});

function animate() {
  requestAnimationFrame(animate);
  
  if (gameSettings.particlesEnabled) {
    bgParticles.rotation.y += 0.0005;
  }
  
  if (!isPaused) {
    targetMesh.rotation.y += 0.01;
    targetMesh.rotation.x += 0.005;
  }
  
  renderer.render(scene, camera);
}

// Initialize game
loadGameData();
updateUI();
setState(GameState.MENU);
animate();