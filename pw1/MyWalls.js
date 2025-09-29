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

        let wallGeometry = new THREE.PlaneGeometry( 10, 5 );
        
        this.frontWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.frontWall.position.set(0, 2.5, -5);
        this.add(this.frontWall);
        
        this.backWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.backWall.position.set(0, 2.5, 5);
        this.backWall.rotation.y = Math.PI;
        this.add(this.backWall);
        

        this.wallTexture = new THREE.TextureLoader().load('textures/window.jpg');
        this.wallTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.wallTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.wallTexture.repeat.set(5, 2.5);
        this.wallTexture.offset.set(-2, -1);

        this.wallMaterial1 = new THREE.MeshPhongMaterial({ 
            color: "#ffffff", 
            specular: "#808080", 
            emissive: "#000000", 
            shininess: 100,
            map: this.wallTexture, 
            side: THREE.DoubleSide 
        });
        
        this.leftWall = new THREE.Mesh( wallGeometry, this.wallMaterial1 );
        this.leftWall.position.set(-5, 2.5, 0);
        this.leftWall.rotation.y = Math.PI / 2;
        this.add(this.leftWall);

        this.rightWall = new THREE.Mesh( wallGeometry, this.wallMaterial );
        this.rightWall.position.set(5, 2.5, 0);
        this.rightWall.rotation.y = -Math.PI / 2;
        this.add(this.rightWall);
    }

    setWrapMode(mode) {
        if (!this.wallTexture) return;
        if (mode === 'ClampToEdge') {
            this.wallTexture.wrapS = THREE.ClampToEdgeWrapping;
            this.wallTexture.wrapT = THREE.ClampToEdgeWrapping;
        } else if (mode === 'Repeat') {
            this.wallTexture.wrapS = THREE.RepeatWrapping;
            this.wallTexture.wrapT = THREE.RepeatWrapping;
        }
        this.wallTexture.needsUpdate = true;
    }
}

MyWalls.prototype.isGroup = true;

export { MyWalls };