import * as THREE from 'three';

class MyLightWall extends THREE.Object3D {
    constructor() {
        super();
        this.type = 'Group';

        const hexRadius = 0.3;
        const spacingX = hexRadius * 2;
        const spacingY = hexRadius * 1.78;

        const customColors = [
            0x012A4A,

            0x013A63,

            0x01497C,
            0x01497C,

            0x014F86,
            0x014F86,

            0x2A6F97,

            0x2C7DA0,
            0x2C7DA0,
            0x61A5C2,

            0x468FAF,
            0x61A5C2,
            0x89C2D9,

            0xA9D6E5
        ];

        const positions = [
            [-spacingX * 4 - 0.2, spacingY / 2, 0],

            [-spacingX * 4 + 0.26, 0, 0],

            [-spacingX * 3 + 0.13, spacingY / 2, 0],
            [-spacingX * 3 + 0.13, -spacingY / 2, 0],

            [-spacingX * 2, spacingY, 0],
            [-spacingX * 2, 0, 0],

            [-spacingX - 0.13, spacingY / 2, 0],

            [-spacingX / 2 + 0.04, spacingY * 2, 0],
            [-spacingX / 2 + 0.04 , spacingY, 0],
            [-spacingX / 2 + 0.04 , 0, 0],

            [spacingX / 2 - 0.09, 5 * spacingY / 2, 0],
            [spacingX / 2 - 0.09, 3 * spacingY / 2, 0],
            [spacingX / 2 - 0.09, spacingY / 2, 0],

            [spacingX + 0.09, spacingY * 2, 0]
        ];

        positions.slice(0, 14).forEach((pos, index) => {
            const hexGeometry = new THREE.CylinderGeometry(hexRadius, hexRadius, 0.05, 6);
            
            hexGeometry.rotateX(Math.PI / 2);
            hexGeometry.rotateZ(Math.PI / 6);
            
            const color = customColors[index];
            
            const material = new THREE.MeshPhongMaterial({
                color,
                emissive: color,
                emissiveIntensity: 1,
                shininess: 80
            });

            const hexMesh = new THREE.Mesh(hexGeometry, material);
            hexMesh.position.set(...pos);

            //const light = new THREE.PointLight(color, 0.8, 2);
            //light.position.set(pos[0], pos[1], pos[2] + 0.2);
            //this.add(hexMesh, light);
            this.add(hexMesh);
        });
    }
}

MyLightWall.prototype.isGroup = true;

export { MyLightWall };