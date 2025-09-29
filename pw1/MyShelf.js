import * as THREE from 'three';

class MyShelf extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const legMaterial = new THREE.MeshBasicMaterial( {color: 0x563232} );
        const legGeometry = new THREE.CylinderGeometry( 0.02, 0.02, 3.5, 32);
        
        const leg1Mesh = new THREE.Mesh(legGeometry, legMaterial);
        leg1Mesh.position.set(0.7, 1.75, 0.25);
        this.add(leg1Mesh);

        const leg2Mesh = new THREE.Mesh(legGeometry, legMaterial);
        leg2Mesh.position.set(0.7, 1.75, -0.25);
        this.add(leg2Mesh);

        const leg3Mesh = new THREE.Mesh(legGeometry, legMaterial);
        leg3Mesh.position.set(-0.7, 1.75, -0.25);
        this.add(leg3Mesh);

        const leg4Mesh = new THREE.Mesh(legGeometry, legMaterial);
        leg4Mesh.position.set(-0.7, 1.75, 0.25);
        this.add(leg4Mesh);

        const baseMaterial = new THREE.MeshBasicMaterial( {color: 0x563232} );
        const baseGeometry = new THREE.BoxGeometry( 1.5, 0.05, 0.6);
        
        const base1Mesh = new THREE.Mesh(baseGeometry, baseMaterial);
        base1Mesh.position.set(0, 0.2, 0);
        this.add(base1Mesh);

        const base2Mesh = new THREE.Mesh(baseGeometry, baseMaterial);
        base2Mesh.position.set(0, 1, 0);
        this.add(base2Mesh);

        const base3Mesh = new THREE.Mesh(baseGeometry, baseMaterial);
        base3Mesh.position.set(0, 1.8, 0);
        this.add(base3Mesh);

        const base4Mesh = new THREE.Mesh(baseGeometry, baseMaterial);
        base4Mesh.position.set(0, 2.6, 0);
        this.add(base4Mesh);

        const base5Mesh = new THREE.Mesh(baseGeometry, baseMaterial);
        base5Mesh.position.set(0, 3.4, 0);
        this.add(base5Mesh);
    }
}

MyShelf.prototype.isGroup = true;

export { MyShelf };