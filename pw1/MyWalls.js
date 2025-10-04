import * as THREE from 'three';

class MyWalls extends THREE.Object3D {
    constructor(app, concreteTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const concreteMaterial = new THREE.MeshPhongMaterial({ 
            color: "#bcbcbc", 
            specular: "#1a1a1a",
            emissive: "#000000", 
            shininess: 5,
            map: concreteTexture
        });

        // // Keep window texture for left wall
        // this.wallTexture = new THREE.TextureLoader().load('textures/window.jpg');
        // this.wallTexture.wrapS = THREE.ClampToEdgeWrapping;
        // this.wallTexture.wrapT = THREE.ClampToEdgeWrapping;
        // this.wallTexture.repeat.set(4.5, 2.25);
        // this.wallTexture.offset.set(-2, -1);

        // this.wallMaterial1 = new THREE.MeshPhongMaterial({ 
        //     color: "#ffffff", 
        //     specular: "#808080", 
        //     emissive: "#000000", 
        //     shininess: 100,
        //     map: this.wallTexture, 
        //     side: THREE.DoubleSide 
        // });

        const wallThickness = 0.1;
        const halfThickness = -wallThickness / 2;
        
        const wallGeometry = new THREE.BoxGeometry(9 + wallThickness * 2, 5, wallThickness);
        
        // Front wall
        this.frontWall = new THREE.Mesh(wallGeometry, concreteMaterial);
        this.frontWall.position.set(0, 2.25, -4.5 + halfThickness);
        this.add(this.frontWall);
        
        // Back wall
        this.backWall = new THREE.Mesh(wallGeometry, concreteMaterial);
        this.backWall.position.set(0, 2.25, 4.5 - halfThickness);
        this.add(this.backWall);
        

        const sideWallGeometry = new THREE.BoxGeometry(wallThickness, 5, 9);
        // Left wall
        this.leftWall = new THREE.Mesh(sideWallGeometry, concreteMaterial);
        this.leftWall.position.set(-4.5 + halfThickness, 2.25, 0);
        this.add(this.leftWall);

        // Right wall
        this.rightWall = new THREE.Mesh(sideWallGeometry, concreteMaterial);
        this.rightWall.position.set(4.5 - halfThickness, 2.25, 0);
        this.add(this.rightWall);
    }

    // setWrapMode(mode) {
    //     if (!this.wallTexture) return;
    //     if (mode === 'ClampToEdge') {
    //         this.wallTexture.wrapS = THREE.ClampToEdgeWrapping;
    //         this.wallTexture.wrapT = THREE.ClampToEdgeWrapping;
    //     } else if (mode === 'Repeat') {
    //         this.wallTexture.wrapS = THREE.RepeatWrapping;
    //         this.wallTexture.wrapT = THREE.RepeatWrapping;
    //     }
    //     this.wallTexture.needsUpdate = true;
    // }
}

MyWalls.prototype.isGroup = true;

export { MyWalls };