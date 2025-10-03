import * as THREE from 'three';

class MyLightWall extends THREE.Object3D {
    constructor() {
        super();
        this.type = 'Group';

        const hexRadius = 0.3;
        const spacingX = hexRadius * 2;
        const spacingY = hexRadius * 1.78;

        const customColors = [
            "#a62c00",

            "#d33800",

            "#FF4500",
            "#e23c00",

            "rgba(224, 93, 32, 1)",
            "#FF6600",

            "#FF7F00",

            "#FF8C00",
            "#FFA500",
            "#FFB347",

            "#FFCC5C",
            "#FFD580",
            "#FFE5B4",

            "#FFF5E6"
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