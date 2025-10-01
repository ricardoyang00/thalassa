import * as THREE from 'three';

class MyGuitarStand extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load textures
        const blackWoodTexture = new THREE.TextureLoader().load('textures/wood_black.jpg');
        blackWoodTexture.wrapS = THREE.RepeatWrapping;
        blackWoodTexture.wrapT = THREE.RepeatWrapping;
        blackWoodTexture.repeat.set(1, 2);

        const inoxBlackTexture = new THREE.TextureLoader().load('textures/inox_black.jpg');
        inoxBlackTexture.wrapS = THREE.RepeatWrapping;
        inoxBlackTexture.wrapT = THREE.RepeatWrapping;
        inoxBlackTexture.repeat.set(1, 1);

        // Create materials
        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",        // Dark gray tint for black wood
            specular: "#1a1a1a",     // Much darker specular (reduced from "#404040")
            emissive: "#000000",
            shininess: 10,           // Much lower shininess (reduced from 40 to 10)
            map: blackWoodTexture
        });

        const inoxBlackMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",        // Very dark gray for black steel
            specular: "#666666",     // Bright specular for metallic shine
            emissive: "#000000",
            shininess: 90,           // High shininess for polished metal
            map: inoxBlackTexture
        });

        // Base legs (black stainless steel)
        const baseGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16);

        const leftBase = new THREE.Mesh(baseGeometry, inoxBlackMaterial);
        leftBase.position.set(-0.2, 0.05, 0);
        leftBase.rotation.x = Math.PI / 2;
        this.add(leftBase);

        const rightBase = new THREE.Mesh(baseGeometry, inoxBlackMaterial);
        rightBase.position.set(0.2, 0.05, 0);
        rightBase.rotation.x = Math.PI / 2;
        this.add(rightBase);

        // Base feet (black stainless steel)
        const baseAdditionGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 16);

        const leftFrontBase = new THREE.Mesh(baseAdditionGeometry, inoxBlackMaterial);
        leftFrontBase.position.set(-0.2, 0.05, 0.17);
        leftFrontBase.rotation.x = Math.PI / 2;
        this.add(leftFrontBase);

        const leftBackBase = new THREE.Mesh(baseAdditionGeometry, inoxBlackMaterial);
        leftBackBase.position.set(-0.2, 0.05, -0.17);
        leftBackBase.rotation.x = Math.PI / 2;
        this.add(leftBackBase);

        const rightFrontBase = new THREE.Mesh(baseAdditionGeometry, inoxBlackMaterial);
        rightFrontBase.position.set(0.2, 0.05, 0.17);
        rightFrontBase.rotation.x = Math.PI / 2;
        this.add(rightFrontBase);

        const rightBackBase = new THREE.Mesh(baseAdditionGeometry, inoxBlackMaterial);
        rightBackBase.position.set(0.2, 0.05, -0.17);
        rightBackBase.rotation.x = Math.PI / 2;
        this.add(rightBackBase);

        // Support arms (black stainless steel)
        const supportGeometry = new THREE.CylinderGeometry(0.017, 0.017, 0.5, 16);
        
        const leftSupport = new THREE.Mesh(supportGeometry, inoxBlackMaterial);
        leftSupport.position.set(-0.1, 0.27, 0);
        leftSupport.rotation.z = - Math.PI / 8;
        this.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, inoxBlackMaterial);
        rightSupport.position.set(0.1, 0.27, 0);
        rightSupport.rotation.z = Math.PI / 8;
        this.add(rightSupport);

        // Top support bar (black stainless steel)
        const topSupport = new THREE.Mesh(baseAdditionGeometry, inoxBlackMaterial);
        topSupport.position.set(0, 0.5, 0);
        topSupport.rotation.z = Math.PI / 2;
        this.add(topSupport);

        // Guitar rest pads (black wood - protective padding)
        const restGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 16);
        
        const leftRest = new THREE.Mesh(restGeometry, blackWoodMaterial);
        leftRest.position.set(-0.11, 0.25, 0.075);
        leftRest.rotation.x = Math.PI / 2;
        this.add(leftRest);

        const rightRest = new THREE.Mesh(restGeometry, blackWoodMaterial);
        rightRest.position.set(0.11, 0.25, 0.075);
        rightRest.rotation.x = Math.PI / 2;
        this.add(rightRest);
    }
}

MyGuitarStand.prototype.isGroup = true;

export { MyGuitarStand };