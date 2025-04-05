// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 初始化相机
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// 添加轨道控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;

// 添加光源
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(1, 1, 1);
directionalLight.castShadow = true;
scene.add(directionalLight);

// 创建发光魔方
const cubeSize = 2;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

// 创建发光材质
const cubeMaterial = new THREE.MeshPhongMaterial({
  color: 0x00ff00,
  emissive: 0x00aa00,
  emissiveIntensity: 0.5,
  shininess: 100,
  transparent: true,
  opacity: 0.9,
  side: THREE.DoubleSide
});

// 创建魔方网格
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true;
scene.add(cube);

// 添加边缘光晕效果
const edges = new THREE.EdgesGeometry(cubeGeometry);
const lineMaterial = new THREE.LineBasicMaterial({ 
  color: 0x00ffff, 
  linewidth: 2,
  transparent: true,
  opacity: 0.8
});
const edgesMesh = new THREE.LineSegments(edges, lineMaterial);
cube.add(edgesMesh);

// 脉冲发光动画
let pulseSpeed = 0.01;
function updatePulse() {
  cubeMaterial.emissiveIntensity += pulseSpeed;
  if (cubeMaterial.emissiveIntensity > 0.8 || cubeMaterial.emissiveIntensity < 0.2) {
    pulseSpeed *= -1;
  }
  
  lineMaterial.opacity = cubeMaterial.emissiveIntensity * 0.8;
}

// 自动旋转动画
let autoRotate = true;
let rotateSpeed = 0.005;

// 点击切换自动旋转
window.addEventListener('click', () => {
  autoRotate = !autoRotate;
});

// 窗口大小调整
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// 动画循环
function animate() {
  requestAnimationFrame(animate);
  
  // 更新控制器
  controls.update();
  
  // 自动旋转
  if (autoRotate) {
    cube.rotation.x += rotateSpeed;
    cube.rotation.y += rotateSpeed * 0.7;
  }
  
  // 更新脉冲效果
  updatePulse();
  
  renderer.render(scene, camera);
}

animate();
