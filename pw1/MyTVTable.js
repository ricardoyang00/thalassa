import * as THREE from 'three';

class MyTVTable extends THREE.Object3D {

    constructor(app, blackWoodTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        // material
        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#404040",
            emissive: "#000000",
            shininess: 60,
            map: blackWoodTexture
        });

        // TV table proportions
        const topWidth = 4;
        const topDepth = 1.2;
        const topThickness = 0.08;
        const supportHeight = 0.4;

        // parallelogram supports (one on each side) with vertical grain
        const supportWidth = 0.15;
        const supportDepth = topDepth - 0.2;
        const supportTexture = blackWoodTexture.clone();
        supportTexture.repeat.set(1, 3);
        
        const supportMaterial = blackWoodMaterial.clone();
        supportMaterial.map = supportTexture;
        
        const supportGeometry = new THREE.BoxGeometry(supportWidth, supportHeight, supportDepth);
        
        const leftSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        leftSupport.position.set(-topWidth/2 + 0.3, -(supportHeight/2), 0);
        this.add(leftSupport);

        // Right support (parallelogram shape by rotation and positioning)
        const rightSupport = new THREE.Mesh(supportGeometry, supportMaterial);
        rightSupport.position.set(topWidth/2 - 0.3, -(supportHeight/2), 0);
        this.add(rightSupport);

        // top surface with horizontal grain
        const topTexture = blackWoodTexture.clone();
        topTexture.repeat.set(6, 2);
        
        const topMaterial = blackWoodMaterial.clone();
        topMaterial.map = topTexture;

        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, topMaterial);
        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);
    }
}

MyTVTable.prototype.isGroup = true;

export { MyTVTable };