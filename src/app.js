// 替换原来的单个立方体创建代码

const cubeSize = 3;
const cubeletSize = 0.9;
const gap = 0.05;

const materials = [
  new THREE.MeshPhongMaterial({ color: 0xff0000 }), // 右 - 红
  new THREE.MeshPhongMaterial({ color: 0x00ff00 }), // 左 - 绿
  new THREE.MeshPhongMaterial({ color: 0x0000ff }), // 上 - 蓝
  new THREE.MeshPhongMaterial({ color: 0xffff00 }), // 下 - 黄
  new THREE.MeshPhongMaterial({ color: 0xff8800 }), // 前 - 橙
  new THREE.MeshPhongMaterial({ color: 0xffffff })  // 后 - 白
];

const cubeGroup = new THREE.Group();

for (let x = -1; x <= 1; x++) {
  for (let y = -1; y <= 1; y++) {
    for (let z = -1; z <= 1; z++) {
      if (x === 0 && y === 0 && z === 0) continue; // 跳过中心
      
      const cubelet = new THREE.Mesh(
        new THREE.BoxGeometry(cubeletSize, cubeletSize, cubeletSize),
        materials
      );
      
      cubelet.position.set(
        x * (cubeletSize + gap),
        y * (cubeletSize + gap),
        z * (cubeletSize + gap)
      );
      
      cubeGroup.add(cubelet);
    }
  }
}

scene.add(cubeGroup);
