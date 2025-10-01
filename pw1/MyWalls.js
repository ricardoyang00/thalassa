import * as THREE from 'three';

class MyWalls extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load concrete texture - change to the darker concrete.jpg
        const concreteTexture = new THREE.TextureLoader().load('textures/concrete_light.jpg');
        concreteTexture.wrapS = THREE.RepeatWrapping;
        concreteTexture.wrapT = THREE.RepeatWrapping;
        concreteTexture.repeat.set(3, 2); // Repeat for seamless wall coverage

        // Create realistic concrete material with darker appearance
        const concreteMaterial = new THREE.MeshPhongMaterial({ 
            color: "#bcbcbcff",        // Darker gray to match the concrete.jpg texture
            specular: "#1a1a1a",     // Very dark specular for minimal shine
            emissive: "#000000", 
            shininess: 5,            // Very low shininess for rough concrete finish
            map: concreteTexture,
            side: THREE.DoubleSide
        });

        // Keep window texture for left wall
        this.wallTexture = new THREE.TextureLoader().load('textures/window.jpg');
        this.wallTexture.wrapS = THREE.ClampToEdgeWrapping;
        this.wallTexture.wrapT = THREE.ClampToEdgeWrapping;
        this.wallTexture.repeat.set(4.5, 2.25);
        this.wallTexture.offset.set(-2, -1);

        this.wallMaterial1 = new THREE.MeshPhongMaterial({ 
            color: "#ffffff", 
            specular: "#808080", 
            emissive: "#000000", 
            shininess: 100,
            map: this.wallTexture, 
            side: THREE.DoubleSide 
        });

        let wallGeometry = new THREE.PlaneGeometry( 9, 5 );
        
        // Front wall - concrete
        this.frontWall = new THREE.Mesh( wallGeometry, concreteMaterial );
        this.frontWall.position.set(0, 2.25, -4.5);
        this.add(this.frontWall);
        
        // Back wall - concrete
        this.backWall = new THREE.Mesh( wallGeometry, concreteMaterial );
        this.backWall.position.set(0, 2.25, 4.5);
        this.backWall.rotation.y = Math.PI;
        this.add(this.backWall);
        
        // Left wall - windows (keep existing)
        //this.leftWall = new THREE.Mesh( wallGeometry, this.wallMaterial1 );
        this.leftWall = new THREE.Mesh( wallGeometry, concreteMaterial );
        this.leftWall.position.set(-4.5, 2.25, 0);
        this.leftWall.rotation.y = Math.PI / 2;
        this.add(this.leftWall);

        // Right wall - concrete
        this.rightWall = new THREE.Mesh( wallGeometry, concreteMaterial );
        this.rightWall.position.set(4.5, 2.25, 0);
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