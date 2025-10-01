import * as THREE from 'three';

class MyTVTable extends THREE.Object3D {

    constructor(app, tableMaterial) {
        super();
        this.app = app;
        this.type = 'Group';

        // TV table proportions - wider and lower than coffee table
        const topWidth = 4;
        const topDepth = 1.2;
        const topThickness = 0.08;
        const supportHeight = 0.4;

        // Create parallelogram supports (one on each side)
        const supportWidth = 0.15;
        const supportDepth = topDepth - 0.2; // slightly narrower than top
        const supportGeometry = new THREE.BoxGeometry(supportWidth, supportHeight, supportDepth);
        
        // Left support (parallelogram shape by rotation and positioning)
        const leftSupport = new THREE.Mesh(supportGeometry, tableMaterial);
        leftSupport.position.set(-topWidth/2 + 0.3, -(supportHeight/2), 0);
        //leftSupport.rotation.z = Math.PI / 12; // slight angle to create parallelogram effect
        this.add(leftSupport);

        // Right support (parallelogram shape by rotation and positioning)
        const rightSupport = new THREE.Mesh(supportGeometry, tableMaterial);
        rightSupport.position.set(topWidth/2 - 0.3, -(supportHeight/2), 0);
        //rightSupport.rotation.z = -Math.PI / 12; // opposite angle
        this.add(rightSupport);

        // Create the top surface
        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, tableMaterial);
        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);

        // Position the entire table at appropriate height for a TV table
        this.position.y = 0.35;
    }
}

MyTVTable.prototype.isGroup = true;

export { MyTVTable };