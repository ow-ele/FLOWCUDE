// 等待所有资源加载
window.addEventListener('load', init);

function init() {
    // 移除加载器
    document.getElementById('loader').remove();
    
    // 初始化场景
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x000000);
    
    // 初始化相机 - 使用更大的视野角度填满屏幕
    const camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 7;
    
    // 初始化渲染器 - 全屏
    const renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        powerPreference: "high-performance"
    });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ReinhardToneMapping;
    document.body.appendChild(renderer.domElement);
    
    // 添加轨道控制器
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.minDistance = 3;
    controls.maxDistance = 20;
    
    // 添加光源
    const ambientLight = new THREE.AmbientLight(0x111111);
    scene.add(ambientLight);
    
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
    directionalLight.position.set(1, 1, 1);
    scene.add(directionalLight);
    
    // 创建魔方
    const cubeSize = 3;
    const cubeGeometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
    
    // 主立方体材质（半透明）
    const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0x00aaff,
        transparent: true,
        opacity: 0.1,
        shininess: 100
    });
    
    // 创建主立方体
    const cube = new THREE.Mesh(cubeGeometry, innerMaterial);
    scene.add(cube);
    
    // 创建外发光边缘
    const edgesGeometry = new THREE.EdgesGeometry(cubeGeometry);
    const edgeMaterial = new THREE.LineBasicMaterial({ 
        color: 0x00ffff,
        linewidth: 1,
        transparent: true,
        opacity: 0.8
    });
    const edges = new THREE.LineSegments(edgesGeometry, edgeMaterial);
    cube.add(edges);
    
    // 设置后期处理 - 实现高级发光效果
    const renderScene = new THREE.RenderPass(scene, camera);
    
    const bloomPass = new THREE.UnrealBloomPass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        1.5,   // 强度
        0.4,   // 半径
        0.85   // 阈值
    );
    
    const bloomComposer = new THREE.EffectComposer(renderer);
    bloomComposer.renderToScreen = true;
    bloomComposer.addPass(renderScene);
    bloomComposer.addPass(bloomPass);
    
    // 添加脉冲动画效果
    let pulseIntensity = 0;
    
    function updateGlow() {
        pulseIntensity += 0.01;
        
        // 更新边缘颜色和透明度
        const hue = (0.55 + Math.sin(pulseIntensity * 0.5) * 0.1) % 1;
        edgeMaterial.color.setHSL(hue, 0.9, 0.7);
        edgeMaterial.opacity = 0.7 + Math.sin(pulseIntensity) * 0.3;
        
        // 轻微缩放增强效果
        const scale = 1 + Math.sin(pulseIntensity * 0.7) * 0.02;
        cube.scale.set(scale, scale, scale);
    }
    
    // 响应窗口大小变化
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
        bloomComposer.setSize(window.innerWidth, window.innerHeight);
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
    
    // 双击切换全屏
    renderer.domElement.addEventListener('dblclick', toggleFullscreen);
    
    // 自动旋转控制
    let autoRotate = true;
    
    // 点击切换自动旋转
    renderer.domElement.addEventListener('click', () => {
        autoRotate = !autoRotate;
        controls.autoRotate = autoRotate;
    });
    
    // 动画循环
    function animate() {
        requestAnimationFrame(animate);
        
        // 更新控制器
        controls.update();
        
        // 自动旋转
        if (autoRotate && !controls.enabled) {
            cube.rotation.x += 0.003;
            cube.rotation.y += 0.005;
        }
        
        // 更新发光效果
        updateGlow();
        
        // 使用后期处理渲染
        bloomComposer.render();
    }
    
    animate();
}
