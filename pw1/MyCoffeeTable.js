import * as THREE from 'three';

class MyCoffeeTable extends THREE.Object3D {

    constructor(app, blackWoodTexture, inoxBlackTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#404040",
            emissive: "#000000",
            shininess: 60,
            map: blackWoodTexture
        });

        // legs
        const inoxBlackMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",
            specular: "#666666",
            emissive: "#000000",
            shininess: 90,
            map: inoxBlackTexture
        });

        // smaller coffee table proportions
        const legHeight = 0.3;
        const legGeometry = new THREE.CylinderGeometry( 0.04, 0.04, legHeight, 12);

        // top size: smaller than main table
        const topWidth = 2;
        const topDepth = 1;
        const topThickness = 0.06;

        // legs positions relative to top
        const legOffsetX = topWidth/2 - 0.12;
        const legOffsetZ = topDepth/2 - 0.12;

        const legs = [
            [ legOffsetX, -(legHeight/2),  legOffsetZ ],
            [-legOffsetX, -(legHeight/2),  legOffsetZ ],
            [ legOffsetX, -(legHeight/2), -legOffsetZ ],
            [-legOffsetX, -(legHeight/2), -legOffsetZ ],
        ];

        // black stainless steel material for legs
        for (const p of legs) {
            const leg = new THREE.Mesh(legGeometry, inoxBlackMaterial);
            leg.position.set(p[0], p[1], p[2]);
            this.add(leg);
        }

        // top with different texture repeat for tabletop grain direction
        const topTexture = blackWoodTexture.clone();
        topTexture.repeat.set(4, 2); 
        
        const topMaterial = blackWoodMaterial.clone();
        topMaterial.map = topTexture;

        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);

        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);

    }
}

MyCoffeeTable.prototype.isGroup = true;

export { MyCoffeeTable };