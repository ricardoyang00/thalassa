import * as THREE from 'three';

class MyWalls extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        this.wallMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x5d5d5d, 
            side: THREE.DoubleSide
        })

        let wallGeometry = new THREE.PlaneGeometry( 4, 2 );
        
        this.frontWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.frontWall.position.set(0, 1, -2);
        this.add(this.frontWall);
        
        this.backWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.backWall.position.set(0, 1, 2);
        this.backWall.rotation.y = Math.PI;
        this.add(this.backWall);
        
        this.leftWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.leftWall.position.set(-2, 1, 0);
        this.leftWall.rotation.y = Math.PI / 2;
        this.add(this.leftWall);
        
        this.rightWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.rightWall.position.set(2, 1, 0);
        this.rightWall.rotation.y = -Math.PI / 2;
        this.add(this.rightWall);
    }
}

MyWalls.prototype.isGroup = true;

export { MyWalls };