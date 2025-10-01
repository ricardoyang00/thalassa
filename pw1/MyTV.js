import * as THREE from 'three';

class MyTV extends THREE.Object3D {
    constructor(app, {
        screenWidth = 2.8,
        screenHeight = 1.6,
        depth = 0.1,
        frameWidth = 0.05,
        standWidth = 0.5,
        standHeight = 0.06,
        standDepth = 0.2,
        screenColor = 0x000000,
        frameColor = 0x2c2c2c,
        standColor = 0x1a1a1a
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Materials
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xffffff,
            emissive: 0xffffff,
            emissiveIntensity: 0.3,
            shininess: 100
        });
        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: frameColor,
            shininess: 30
        });
        const standMaterial = new THREE.MeshPhongMaterial({ 
            color: standColor,
            shininess: 20
        });

        // Screen (main display area)
        const screenGeometry = new THREE.BoxGeometry(screenWidth, screenHeight, 0.02);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, screenHeight/2 + standHeight + 0.03, depth/2 + 0.01);
        this.add(screen);

        // Frame around screen
        const frameThickness = frameWidth;
        const frameHeight = screenHeight + frameThickness * 2;
        const frameWidthTotal = screenWidth + frameThickness * 2;
        
        const frameGeometry = new THREE.BoxGeometry(frameWidthTotal, frameHeight, depth);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, frameHeight/2 + standHeight, 0);
        this.add(frame);

        // TV Stand/Base
        const standGeometry = new THREE.BoxGeometry(standWidth, standHeight, standDepth);
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(0, standHeight/2, 0);
        this.add(stand);


        // Store references
        this.screen = screen;
        this.frame = frame;
        this.stand = stand;
    }

    // Method to change screen color (simulate different content)
    setScreenColor(color) {
        this.screen.material.color.setHex(color);
        this.screen.material.emissive.setHex(color);
        this.screen.material.emissiveIntensity = 0.3;
    }

    // Method to set glowing white screen
    setGlowingWhite() {
        this.screen.material.color.setHex(0xffffff);
        this.screen.material.emissive.setHex(0xffffff);
        this.screen.material.emissiveIntensity = 0.4;
    }


}

MyTV.prototype.isGroup = true;

export { MyTV };