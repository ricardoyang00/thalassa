import * as THREE from 'three';

class MyCompoundObj extends THREE.Object3D {

    constructor(app, inoxBlackTexture_) {
        super();
        this.app = app;
        this.type = 'Group';

        const screenWidth = 9.3
        const screenHeight = 4
        const depth = 0.1
        const frameWidth = 0.15
        const standHeight = 1
        const baseRadius = 0.8
        const screenColor = 0x000000
        const frameColor = 0x2c2c2c
        const standColor = 0x666666
        const baseColor = 0x444444

        const inoxBlackTexture = inoxBlackTexture_.clone()
        inoxBlackTexture.repeat.set(1,1)

        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: screenColor,
            emissive: "#ffffff",
            emissiveIntensity: 0.8,
            specular: "#111111",
            shininess: 100
        });

        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: frameColor,
            specular: "#666666",
            shininess: 80,
            map: inoxBlackTexture
        });

        const standMaterial = new THREE.MeshPhongMaterial({ 
            color: standColor,
            specular: "#888888",
            shininess: 90,
            map: inoxBlackTexture
        });

        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: baseColor,
            specular: "#777777",
            shininess: 85,
            map: inoxBlackTexture
        });

        const powerButtonMaterial = new THREE.MeshPhongMaterial({ 
            color: "#ff0000",
            emissive: "#330000",
            emissiveIntensity: 1,
            specular: "#ff6666",
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
        const buttonGeometry = new THREE.ConeGeometry(0.03, 0.04, 8);
        const powerButton = new THREE.Mesh(buttonGeometry, powerButtonMaterial);
        powerButton.rotation.x = Math.PI / 2;
        powerButton.position.set(screenWidth/2 - 0.2, standHeight/2 + 0.47, 0);
        this.add(powerButton);

        this.toggleScreen = (enabled) => {
            if (enabled) {
                this.screen.material.emissive.setHex(0xffffff);
                this.screen.material.emissiveIntensity = 0.8;
            } else {
                this.screen.material.emissive.setHex(0x000000);
                this.screen.material.emissiveIntensity = 0;
            }
        };
    }

}

MyCompoundObj.prototype.isGroup = true;

export { MyCompoundObj };