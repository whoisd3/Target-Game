import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.163.0/build/three.module.js';

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

let score = 0, highScore = 0, level = 1, gameTime = 30, timer = null;
let spawnDelay = 1500, shapeIndex = 0, reactionStart = null;
const shapes = ['sphere', 'cube', 'torus', 'icosahedron', 'octahedron'];
const colorMap = [0xff69b4, 0x00ffff, 0x00ff00, 0xffa500, 0xff0000];

// Shape generator
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
  score = 0; level = 1; gameTime = 30; spawnDelay = 1500;
  updateUI(); spawnTarget();
  if (timer) clearInterval(timer);
  timer = setInterval(() => {
    gameTime--;
    updateUI();
    if (gameTime <= 0) {
      clearInterval(timer);
      if (score > highScore) highScore = score;
      updateUI();
      alert("⏰ Time's up! Final score: " + score);
    }
  }, 1000);
}

function handleClick(event) {
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
document.getElementById('startButton').addEventListener('click', startGame);
document.getElementById('restartGameBtn').addEventListener('click', startGame);

window.addEventListener('click', handleClick);
window.addEventListener('touchstart', (e) => {
  const touch = e.touches[0];
  handleClick({ clientX: touch.clientX, clientY: touch.clientY });
});

document.getElementById('shape-btn').addEventListener('click', () => {
  scene.remove(targetMesh);
  shapeIndex = (shapeIndex + 1) % shapes.length;
  const color = colorMap[(level - 1) % colorMap.length];
  targetMesh = createParticleShape(shapes[shapeIndex], color);
  scene.add(targetMesh);
  infoEl.textContent = `Shape: ${shapes[shapeIndex].charAt(0).toUpperCase() + shapes[shapeIndex].slice(1)}`;
  spawnTarget();
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  bgParticles.rotation.y += 0.0005;
  targetMesh.rotation.y += 0.01;
  targetMesh.rotation.x += 0.005;
  renderer.render(scene, camera);
}
animate();