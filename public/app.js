// 检测移动设备
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 初始化Three.js场景
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ 
  canvas: document.getElementById('canvas'),
  antialias: true,
  alpha: true
});

// 根据设备类型设置渲染器
if (isMobile) {
  renderer.setPixelRatio(window.devicePixelRatio);
  camera.position.z = 5;
} else {
  camera.position.z = 3;
}

renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('loading').style.display = 'none';

// 添加光源
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 创建发光魔方
const createCube = () => {
  const cubeSize = isMobile ? 0.8 : 1;
  const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
  const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0x00ff00,
    emissive: 0x00aa00,
    emissiveIntensity: 0.5,
    shininess: 100,
    transparent: true,
    opacity: 0.9
  });

  const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
  return cube;
};

const cube = createCube();
scene.add(cube);

// 添加控制器
let controls;
if (!isMobile) {
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
}

// 移动端旋转控制
if (isMobile) {
  let rotateX = 0;
  let rotateY = 0;
  const rotationSpeed = 0.02;
  
  document.getElementById('rotate-left').addEventListener('click', () => {
    rotateY -= rotationSpeed;
  });
  
  document.getElementById('rotate-right').addEventListener('click', () => {
    rotateY += rotationSpeed;
  });
  
  // 触摸控制
  let touchStartX = 0;
  let touchStartY = 0;
  
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });
  
  document.addEventListener('touchmove', (e) => {
    if (!touchStartX || !touchStartY) return;
    
    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;
    
    rotateY += (touchEndX - touchStartX) * 0.005;
    rotateX += (touchEndY - touchStartY) * 0.005;
    
    touchStartX = touchEndX;
    touchStartY = touchEndY;
    
    e.preventDefault();
  }, { passive: false });
}

// 添加脉冲发光效果
let pulseDirection = 0.01;
function updatePulse() {
  cube.material.emissiveIntensity += pulseDirection;
  if (cube.material.emissiveIntensity > 0.8 || cube.material.emissiveIntensity < 0.2) {
    pulseDirection *= -1;
  }
}

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  if (isMobile) {
    cube.rotation.x = rotateX;
    cube.rotation.y = rotateY;
  } else {
    if (controls) controls.update();
  }
  
  updatePulse();
  renderer.render(scene, camera);
}

animate();

// 响应式调整
function handleResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  
  // 移动设备调整相机距离
  if (isMobile) {
    camera.position.z = window.innerWidth < window.innerHeight ? 6 : 5;
  }
}

window.addEventListener('resize', handleResize);
handleResize(); // 初始调用
