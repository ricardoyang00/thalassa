import * as THREE from 'three';

class MyMouse extends THREE.Object3D {

    constructor(app, feltTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x2c2c2c,
            shininess: 30 
        });

        const matMaterial = new THREE.MeshPhongMaterial({ 
            map: feltTexture,
            shininess: 5 
        });

        const bodyGeometry = new THREE.SphereGeometry(0.5, 32, 16);
        bodyGeometry.scale(1.4, 0.6, 2.0);
        const bodyMesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        bodyMesh.position.set(0, 0.15, 0);
        bodyMesh.rotation.y = Math.PI / 6
        this.add(bodyMesh);

        const matGeometry = new THREE.BoxGeometry(5, 0.05, 4);
        const matMesh = new THREE.Mesh(matGeometry, matMaterial);
        matMesh.position.set(0, 0.025, 0);
        this.add(matMesh);
    }
}

MyMouse.prototype.isGroup = true;

export { MyMouse };