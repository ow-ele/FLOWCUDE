// 设备检测
const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
const isTablet = /iPad|Android|Tablet/i.test(navigator.userAgent) && !isMobile;

// 等待所有资源加载
window.addEventListener('load', init);

function init() {
    // 移除加载器
    const loader = document.getElementById('loader');
    if (loader) loader.remove();
    
    // 显示移动端控制UI
    if (isMobile || isTablet) {
        document.getElementById('ui').style.display = 'flex';
    }
    
    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // 初始化相机 - 根据设备类型调整参数
    let camera;
    if (isMobile) {
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = window.innerWidth < window.innerHeight ? 8 : 6;
    } else {
        camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 7;
    }
    
    // 初始化渲染器 - 全屏
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: isMobile ? "low-power" : "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(isMobile ? Math.min(window.devicePixelRatio, 1.5) : Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);
    
    // 根据设备类型选择控制器
    let controls;
    if (isMobile || isTablet) {
        // 移动设备使用更适合触摸的TrackballControls
        controls = new THREE.TrackballControls(camera, renderer.domElement);
        controls.rotateSpeed = 1.0;
        controls.zoomSpeed = 0.8;
        controls.panSpeed = 0.2;
        controls.noZoom = false;
        controls.noPan = false;
        controls.staticMoving = true;
        controls.dynamicDampingFactor = 0.3;
    } else {
        // PC使用OrbitControls
        controls = new THREE.OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
    }
    
    controls.minDistance = 3;
    controls.maxDistance = 20;
    
    // 添加光源 - 根据设备调整强度
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, isMobile ? 0.3 : 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 创建魔方 - 根据屏幕尺寸调整大小
    const cubeSize = Math.min(window.innerWidth, window.innerHeight) * (isMobile ? 0.003 : 0.002);
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    // 主立方体材质（半透明）
    const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: isMobile ? 0.05 : 0.1, // 移动端更透明以提升性能
        shininess: 100
    });
    
    // 创建主立方体
    const cube = new THREE.Mesh(cubeGeometry, innerMaterial);
    scene.add(cube);
    
    // 创建外发光边缘 - 移动端简化效果
    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 1,
        transparent: true,
        opacity: isMobile ? 0.6 : 0.8 // 移动端降低透明度
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    cube.add(edges);
    
    // 设置后期处理 - 移动端简化效果
    const renderScene = new THREE.RenderPass(scene, camera);
    
    let bloomComposer;
    if (!isMobile || !isTablet) {
        const bloomPass = new THREE.UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            1.5,   // 强度
            0.4,   // 半径
            0.85   // 阈值
        );
        
        bloomComposer = new THREE.EffectComposer(renderer);
        bloomComposer.renderToScreen = true;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(bloomPass);
    }
    
    // 添加脉冲动画效果
    let pulseIntensity = 0;
    
    function updateGlow() {
        pulseIntensity += 0.01;
        
        // 更新边缘颜色和透明度
        const hue = (0.55 + Math.sin(pulseIntensity * 0.5) * 0.1) % 1;
        edgeMaterial.color.setHSL(hue, 0.9, 0.7);
        edgeMaterial.opacity = (isMobile ? 0.5 : 0.7) + Math.sin(pulseIntensity) * 0.3;
        
        // 轻微缩放增强效果
        const scale = 1 + Math.sin(pulseIntensity * (isMobile ? 0.5 : 0.7)) * 0.02;
        cube.scale.set(scale, scale, scale);
    }
    
    // 移动端控制按钮事件
    if (isMobile || isTablet) {
        const rotationSpeed = 0.1;
        const zoomSpeed = 0.5;
        
        document.getElementById('rotate-left').addEventListener('touchstart', (e) => {
            e.preventDefault();
            cube.userData.rotateY = -rotationSpeed;
        });
        
        document.getElementById('rotate-right').addEventListener('touchstart', (e) => {
            e.preventDefault();
            cube.userData.rotateY = rotationSpeed;
        });
        
        document.getElementById('zoom-in').addEventListener('touchstart', (e) => {
            e.preventDefault();
            camera.position.z -= zoomSpeed;
        });
        
        document.getElementById('zoom-out').addEventListener('touchstart', (e) => {
            e.preventDefault();
            camera.position.z += zoomSpeed;
        });
        
        // 触摸结束事件
        ['rotate-left', 'rotate-right', 'zoom-in', 'zoom-out'].forEach(id => {
            document.getElementById(id).addEventListener('touchend', (e) => {
                e.preventDefault();
                cube.userData.rotateY = 0;
            });
        });
    }
    
    // 响应窗口大小变化
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        
        // 移动设备调整相机距离
        if (isMobile) {
            camera.position.z = window.innerWidth < window.innerHeight ? 8 : 6;
        }
        
        if (bloomComposer) {
            bloomComposer.setSize(window.innerWidth, window.innerHeight);
        }
    }
    
    window.addEventListener('resize', onWindowResize);
    
    // 全屏处理
    function toggleFullscreen() {
        if (!document.fullscreenElement) {
            renderer.domElement.requestFullscreen().catch(err => {
                console.error(`全屏错误: ${err.message}`);
            });
        } else {
            document.exitFullscreen();
        }
    }
    
    // 双击切换全屏（非移动设备）
    if (!isMobile && !isTablet) {
        renderer.domElement.addEventListener('dblclick', toggleFullscreen);
    }
    
    // 自动旋转控制
    let autoRotate = true;
    
    // 点击切换自动旋转
    renderer.domElement.addEventListener('click', () => {
        if (!isMobile && !isTablet) {
            autoRotate = !autoRotate;
            if (controls.enableDamping) {
                controls.autoRotate = autoRotate;
            }
        }
    });
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 更新控制器
        if (controls.update) controls.update();
        
        // 自动旋转或按钮控制旋转
        if (autoRotate && !controls.enabled) {
            cube.rotation.x += 0.003;
            cube.rotation.y += 0.005;
        } else if (cube.userData?.rotateY) {
            cube.rotation.y += cube.userData.rotateY;
        }
        
        // 更新发光效果
        updateGlow();
        
        // 使用后期处理渲染或直接渲染
        if (bloomComposer) {
            bloomComposer.render();
        } else {
            renderer.render(scene, camera);
        }
    }
    
    animate();
}
