// 设备检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// 初始化场景
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x000000);

// 初始化相机
const camera = new THREE.PerspectiveCamera(
    isMobile ? 75 : 60, 
    window.innerWidth / window.innerHeight, 
    0.1, 
    1000
);
camera.position.z = isMobile ? 6 : 5;

// 初始化渲染器
const renderer = new THREE.WebGLRenderer({ 
    antialias: true,
    powerPreference: isMobile ? "low-power" : "high-performance"
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));
document.body.appendChild(renderer.domElement);

// 添加控制器
const controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.minDistance = 3;
controls.maxDistance = 10;

// 添加光源
const ambientLight = new THREE.AmbientLight(0x111111);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 0.3 : 0.5);
directionalLight.position.set(1, 1, 1);
scene.add(directionalLight);

// 创建魔方
const cubeSize = isMobile ? 2 : 2.5;
const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);

// 主立方体材质
const innerMaterial = new THREE.MeshPhongMaterial({
    color: 0x00aaff,
    transparent: true,
    opacity: isMobile ? 0.1 : 0.2,
    shininess: 100
});

const cube = new THREE.Mesh(cubeGeometry, innerMaterial);
scene.add(cube);

// 创建发光边缘
const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
const edgeMaterial = new THREE.LineBasicMaterial({ 
    color: 0x00ffff,
    linewidth: 1,
    transparent: true,
    opacity: 0.8
});
const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
cube.add(edges);

// 脉冲发光效果
let pulseIntensity = 0;
function updateGlow() {
    pulseIntensity += 0.01;
    const glow = 0.5 + Math.sin(pulseIntensity) * 0.3;
    edgeMaterial.opacity = glow;
    edgeMaterial.color.setHSL((0.55 + Math.sin(pulseIntensity * 0.5) * 0.1 % 1, 0.9, 0.7);
}

// 移动端控制
if (isMobile) {
    document.getElementById('mobile-controls').style.display = 'flex';
    let rotateSpeed = 0;
    
    document.getElementById('rotate-left').addEventListener('touchstart', () => {
        rotateSpeed = -0.05;
    });
    
    document.getElementById('rotate-right').addEventListener('touchstart', () => {
        rotateSpeed = 0.05;
    });
    
    ['rotate-left', 'rotate-right'].forEach(id => {
        document.getElementById(id).addEventListener('touchend', () => {
            rotateSpeed = 0;
        });
    });
    
    // 触摸控制
    let touchStartX = 0;
    document.addEventListener('touchstart', (e) => {
        touchStartX = e.touches[0].clientX;
    }, { passive: true });
    
    document.addEventListener('touchmove', (e) => {
        const touchX = e.touches[0].clientX;
        cube.rotation.y += (touchX - touchStartX) * 0.01;
        touchStartX = touchX;
    }, { passive: false });
}

// 窗口大小调整
function onResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    if (isMobile) {
        camera.position.z = window.innerWidth < window.innerHeight ? 7 : 5;
    }
}
window.addEventListener('resize', onResize);

// 移除加载器
document.getElementById('loader').remove();

// 动画循环
function animate() {
    requestAnimationFrame(animate);
    
    if (!isMobile || !controls.enabled) {
        cube.rotation.x += 0.005;
        cube.rotation.y += 0.007;
    }
    
    updateGlow();
    controls.update();
    renderer.render(scene, camera);
}

animate();
