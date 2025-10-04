import * as THREE from 'three';

class MyTV extends THREE.Object3D {
    constructor(app, inoxBlackTexture) {
        super();
        this.app = app;
        this.type = 'Group';
        this.screenWidth = 5,
        this.screenHeight = 2.8,
        this.depth = 0.08,
        this.frameWidth = 0.04,
        this.standWidth = 0.75,
        this.standHeight = 0.05,
        this.standDepth = 0.3

        // Create black stainless steel material
        const inoxBlackMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",
            specular: "#666666",
            emissive: "#000000",
            shininess: 90,
            map: inoxBlackTexture
        });

        // Materials
        const screenMaterial = new THREE.MeshPhongMaterial({ 
            color: "#ffffff",
            emissive: "#ffffff",
            emissiveIntensity: 0.8,
            shininess: 100
        });
        
        // Use inox material for frame and stand
        const frameMaterial = inoxBlackMaterial;
        const standMaterial = inoxBlackMaterial;

        // Screen (main display area)
        const screenGeometry = new THREE.BoxGeometry(this.screenWidth, this.screenHeight, 0.02);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, this.screenHeight/2 + this.standHeight + 0.04, this.depth/2 + 0.01);
        this.add(screen);

        // Store reference to screen for toggling
        this.screenMesh = screen;

        // Frame around screen
        const frameThickness = this.frameWidth;
        const frameHeight = this.screenHeight + frameThickness * 2;
        const frameWidthTotal = this.screenWidth + frameThickness * 2;

        const frameGeometry = new THREE.BoxGeometry(frameWidthTotal, frameHeight, this.depth);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, frameHeight/2 + this.standHeight, 0);
        this.add(frame);

        // TV Stand/Base
        const standGeometry = new THREE.BoxGeometry(this.standWidth, this.standHeight, this.standDepth);
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(0, this.standHeight/2, 0);
        this.add(stand);

        this.toggleTV = (enabled) => {
            if (enabled) {
                this.screenMesh.material.emissive.setHex(0xffffff);
                this.screenMesh.material.emissiveIntensity = 0.8;
            } else {
                this.screenMesh.material.emissive.setHex(0x000000);
                this.screenMesh.material.emissiveIntensity = 0;
            }
        };
    }
}

MyTV.prototype.isGroup = true;

export { MyTV };