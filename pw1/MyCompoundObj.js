import * as THREE from 'three';

class MyCompoundObj extends THREE.Object3D {

    constructor(app, {
        screenWidth = 9.3,
        screenHeight = 4,
        depth = 0.1,
        frameWidth = 0.15,
        standHeight = 1,
        baseRadius = 0.8,
        screenColor = 0x000000,
        frameColor = 0x2c2c2c,
        standColor = 0x666666,
        baseColor = 0x444444
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load black stainless steel texture
        const inoxBlackTexture = new THREE.TextureLoader().load('textures/inox_black.jpg');
        inoxBlackTexture.wrapS = THREE.RepeatWrapping;
        inoxBlackTexture.wrapT = THREE.RepeatWrapping;
        inoxBlackTexture.repeat.set(1, 1);

        // Create materials using MeshPhongMaterial
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: screenColor,
            emissive: 0x000000,
            emissiveIntensity: 0,
            specular: 0x111111,
            shininess: 100,
            side: THREE.DoubleSide
        });

        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: frameColor,
            specular: 0x666666,
            shininess: 80,
            map: inoxBlackTexture
        });

        const standMaterial = new THREE.MeshPhongMaterial({ 
            color: standColor,
            specular: 0x888888,
            shininess: 90,
            map: inoxBlackTexture
        });

        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: baseColor,
            specular: 0x777777,
            shininess: 85,
            map: inoxBlackTexture
        });

        const powerButtonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xff0000,
            emissive: 0x330000,
            emissiveIntensity: 0.3,
            specular: 0xff6666,
            shininess: 100
        });

        // Screen
        const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, 0.01);
        this.screen = new THREE.Mesh(screenGeometry, screenMaterial);
        this.screen.position.set(0, standHeight + screenHeight/2, 0);
        this.add(this.screen);

        // Frame around screen
        const frameGeometry = new THREE.BoxGeometry(
            screenWidth + frameWidth, 
            screenHeight + frameWidth, 
            depth
        );
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, standHeight + screenHeight/2, -depth/2);
        this.add(frame);

        // Back
        const backGeometry = new THREE.BoxGeometry(
            screenWidth + frameWidth - 0.02, 
            screenHeight + frameWidth - 0.02, 
            depth * 3
        );
        const back = new THREE.Mesh(backGeometry, frameMaterial);
        back.position.set(0, standHeight + screenHeight/2, -depth * 2);
        this.add(back);

        // Stand
        const standGeometry = new THREE.CylinderGeometry(0.15, 0.15, standHeight, 8);
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(0, standHeight/2, -0.1);
        this.add(stand);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(baseRadius, baseRadius, 0.1, 16);
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 0.05, -0.1);
        this.add(base);

        // Power button
        const buttonGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.02, 8);
        const powerButton = new THREE.Mesh(buttonGeometry, powerButtonMaterial);
        powerButton.rotation.x = Math.PI / 2;
        powerButton.position.set(screenWidth/2 - 0.2, standHeight/2 + 0.47, 0);
        this.add(powerButton);

        // Store reference to screen for methods
        this.screenMaterial = screenMaterial;

        this.screenMaterial.color.setHex(0xffffff);
        this.screenMaterial.emissive.setHex(0xffffff);
        this.screenMaterial.emissiveIntensity = 0.5;
    }

}

MyCompoundObj.prototype.isGroup = true;

export { MyCompoundObj };