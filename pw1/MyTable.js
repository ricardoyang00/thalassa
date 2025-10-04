import * as THREE from 'three';

class MyTable extends THREE.Object3D {

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

        const legGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 1, 32);

        const leg1Mesh = new THREE.Mesh(legGeometry, inoxBlackMaterial);
        leg1Mesh.position.set(2, 0.5, 0.7);
        this.add(leg1Mesh);

        const leg2Mesh = new THREE.Mesh(legGeometry, inoxBlackMaterial);
        leg2Mesh.position.set(2, 0.5, -0.7);
        this.add(leg2Mesh);

        const leg3Mesh = new THREE.Mesh(legGeometry, inoxBlackMaterial);
        leg3Mesh.position.set(-2, 0.5, -0.7);
        this.add(leg3Mesh);

        const leg4Mesh = new THREE.Mesh(legGeometry, inoxBlackMaterial);
        leg4Mesh.position.set(-2, 0.5, 0.7);
        this.add(leg4Mesh);

        const topGeometry = new THREE.BoxGeometry( 4.2, 0.1, 1.6);
        
        const topMesh = new THREE.Mesh(topGeometry, blackWoodMaterial);
        topMesh.position.set(0, 1, 0);
        this.add(topMesh);
    }
}

MyTable.prototype.isGroup = true;

export { MyTable };