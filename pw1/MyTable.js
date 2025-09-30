import * as THREE from 'three';

class MyTable extends THREE.Object3D {

    constructor(app, tableMaterial) {
        super();
        this.app = app;
        this.type = 'Group';

        //const tableMaterial = new THREE.MeshBasicMaterial( {color: 0x563232} );

        const legGeometry = new THREE.CylinderGeometry( 0.05, 0.05, 1, 32);
        
        const leg1Mesh = new THREE.Mesh(legGeometry, tableMaterial);
        leg1Mesh.position.set(2, 0.5, 0.7);
        this.add(leg1Mesh);

        const leg2Mesh = new THREE.Mesh(legGeometry, tableMaterial);
        leg2Mesh.position.set(2, 0.5, -0.7);
        this.add(leg2Mesh);

        const leg3Mesh = new THREE.Mesh(legGeometry, tableMaterial);
        leg3Mesh.position.set(-2, 0.5, -0.7);
        this.add(leg3Mesh);

        const leg4Mesh = new THREE.Mesh(legGeometry, tableMaterial);
        leg4Mesh.position.set(-2, 0.5, 0.7);
        this.add(leg4Mesh);

        const topGeometry = new THREE.BoxGeometry( 4.2, 0.1, 1.6);
        
        const topMesh = new THREE.Mesh(topGeometry, tableMaterial);
        topMesh.position.set(0, 1, 0);
        this.add(topMesh);
    }
}

MyTable.prototype.isGroup = true;

export { MyTable };