import * as THREE from 'three';

class MyTVTable extends THREE.Object3D {

    constructor(app, tableMaterial) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load black wood texture
        const blackWoodTexture = new THREE.TextureLoader().load('textures/wood_black.jpg');
        blackWoodTexture.wrapS = THREE.RepeatWrapping;
        blackWoodTexture.wrapT = THREE.RepeatWrapping;
        blackWoodTexture.repeat.set(2, 2);

        // Create realistic black wood material
        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",        // Dark gray tint to enhance black wood
            specular: "#404040",     // Medium gray specular for subtle shine
            emissive: "#000000",
            shininess: 60,           // Semi-glossy finish typical of finished wood
            map: blackWoodTexture
        });

        // TV table proportions - wider and lower than coffee table
        const topWidth = 4;
        const topDepth = 1.2;
        const topThickness = 0.08;
        const supportHeight = 0.4;

        // Create parallelogram supports (one on each side) with vertical grain
        const supportWidth = 0.15;
        const supportDepth = topDepth - 0.2; // slightly narrower than top
        const supportTexture = blackWoodTexture.clone();
        supportTexture.repeat.set(1, 3); // Vertical grain for supports
        
        const supportMaterial = blackWoodMaterial.clone();
        supportMaterial.map = supportTexture;
        
        const supportGeometry = new THREE.BoxGeometry(supportWidth, supportHeight, supportDepth);
        
        // Left support (parallelogram shape by rotation and positioning)
        const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        leftSupport.position.set(-topWidth/2 + 0.3, -(supportHeight/2), 0);
        //leftSupport.rotation.z = Math.PI / 12; // slight angle to create parallelogram effect
        this.add(leftSupport);

        // Right support (parallelogram shape by rotation and positioning)
        const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        rightSupport.position.set(topWidth/2 - 0.3, -(supportHeight/2), 0);
        //rightSupport.rotation.z = -Math.PI / 12; // opposite angle
        this.add(rightSupport);

        // Create the top surface with horizontal grain
        const topTexture = blackWoodTexture.clone();
        topTexture.repeat.set(6, 2); // Horizontal grain along width
        
        const topMaterial = blackWoodMaterial.clone();
        topMaterial.map = topTexture;

        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);

        // Position the entire table at appropriate height for a TV table
        this.position.y = 0.35;
    }
}

MyTVTable.prototype.isGroup = true;

export { MyTVTable };