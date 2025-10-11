import * as THREE from 'three';

class MyRock extends THREE.Object3D {
    constructor(app, size = 1, randomFunc = Math.random) {
        super();
        this.app = app;
        this.size = size;
        this.random = randomFunc;
        this.buildRock();
    }

    buildRock() {
        const rockGeometry = new THREE.BoxGeometry(
            this.size * (0.8 + this.random() * 0.4),
            this.size * (0.6 + this.random() * 0.8),
            this.size * (0.8 + this.random() * 0.4)
        );

        const rockMaterial = new THREE.MeshPhongMaterial({ 
            color: "#696969",
            wireframe: false 
        });

        const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
        
        rockMesh.rotation.x = this.random() * 0.3;
        rockMesh.rotation.y = this.random() * Math.PI;
        rockMesh.rotation.z = this.random() * 0.3;

        this.add(rockMesh);
        this.rockMesh = rockMesh;
    }

    toggleWireframe(wireframe) {
        this.rockMesh.material.wireframe = wireframe;
    }
}

export { MyRock };