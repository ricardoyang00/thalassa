import * as THREE from 'three';

class MyRubikCube extends THREE.Object3D {
    constructor() {
        super();
        this.type = 'Group';

        const colors = {
            white: 0xffffff,
            yellow: 0xffff00,
            red: 0xff0000,
            orange: 0xff6500,
            green: 0x00ff00,
            blue: 0x0000ff,
            black: 0x000000
        };

        const cubeSize = 0.3;
        const gap = 0.02;
        const totalSize = cubeSize + gap;

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                for (let z = 0; z < 3; z++) {
                    // Skip the center cube
                    if (x === 1 && y === 1 && z === 1) continue;

                    const geometry = new THREE.BoxGeometry(cubeSize, cubeSize, cubeSize);
                    
                    const materials = [
                        new THREE.MeshPhongMaterial({ color: x === 2 ? colors.red : colors.black }),    // right (red)
                        new THREE.MeshPhongMaterial({ color: x === 0 ? colors.orange : colors.black }), // left (orange)
                        new THREE.MeshPhongMaterial({ color: y === 2 ? colors.white : colors.black }),  // top (white)
                        new THREE.MeshPhongMaterial({ color: y === 0 ? colors.yellow : colors.black }), // bottom (yellow)
                        new THREE.MeshPhongMaterial({ color: z === 2 ? colors.green : colors.black }),  // front (green)
                        new THREE.MeshPhongMaterial({ color: z === 0 ? colors.blue : colors.black })    // back (blue)
                    ];

                    const cube = new THREE.Mesh(geometry, materials);
                    
                    cube.position.set(
                        (x - 1) * totalSize,
                        (y - 1) * totalSize,
                        (z - 1) * totalSize
                    );

                    this.add(cube);
                }
            }
        }
    }
}

MyRubikCube.prototype.isGroup = true;

export { MyRubikCube };