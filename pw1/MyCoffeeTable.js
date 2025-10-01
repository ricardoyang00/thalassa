import * as THREE from 'three';

class MyCoffeeTable extends THREE.Object3D {

    constructor(app, tableMaterial) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load black wood texture
        const blackWoodTexture = new THREE.TextureLoader().load('textures/wood_black.jpg');
        blackWoodTexture.wrapS = THREE.RepeatWrapping;
        blackWoodTexture.wrapT = THREE.RepeatWrapping;
        blackWoodTexture.repeat.set(2, 2); // Adjust for realistic wood grain scale

        // Load black stainless steel texture for legs
        const inoxBlackTexture = new THREE.TextureLoader().load('textures/inox_black.jpg');
        inoxBlackTexture.wrapS = THREE.RepeatWrapping;
        inoxBlackTexture.wrapT = THREE.RepeatWrapping;
        inoxBlackTexture.repeat.set(1, 2); // Vertical repeat for cylindrical legs

        // Create realistic black wood material for tabletop
        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",        // Dark gray tint to enhance black wood
            specular: "#404040",     // Medium gray specular for subtle shine
            emissive: "#000000",
            shininess: 60,           // Semi-glossy finish typical of finished wood
            map: blackWoodTexture
        });

        // Create black stainless steel material for legs
        const inoxBlackMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",        // Very dark gray for black steel
            specular: "#666666",     // Bright specular for metallic shine
            emissive: "#000000",
            shininess: 90,           // High shininess for polished metal
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

        // Use black stainless steel material for legs
        for (const p of legs) {
            const leg = new THREE.Mesh(legGeometry, inoxBlackMaterial);
            leg.position.set(p[0], p[1], p[2]);
            this.add(leg);
        }

        // Create top with different texture repeat for tabletop grain direction
        const topTexture = blackWoodTexture.clone();
        topTexture.repeat.set(4, 2); // Longer grain along width
        
        const topMaterial = blackWoodMaterial.clone();
        topMaterial.map = topTexture;

        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        // top sits above legs: leg top is at y = 0, so place top at half thickness
        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);

        // slightly raise object so top surface is around y = 0.3 (common coffee table height)
        // current top center at y = topThickness/2 (~0.03) so we'll offset entire group
        this.position.y = 0.28;
    }
}

MyCoffeeTable.prototype.isGroup = true;

export { MyCoffeeTable };