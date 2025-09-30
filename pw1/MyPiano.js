import * as THREE from 'three';

class MyPiano extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const baseGeometry = new THREE.BoxGeometry(2, 0.15, 0.8);
        const baseMaterial = new THREE.MeshBasicMaterial({color: 0x563232});
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.set(0, 0.075, 0);
        this.add(baseMesh);

        // white keys
        const whiteKeyGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.6);
        const whiteKeyMaterial = new THREE.MeshBasicMaterial({color: 0xffffff});
        
        const whiteKeyPositions = [-0.84, -0.72, -0.6, -0.48, -0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84];
        
        whiteKeyPositions.forEach((xPos) => {
            const whiteKey = new THREE.Mesh(whiteKeyGeometry, whiteKeyMaterial);
            whiteKey.position.set(xPos, 0.175, 0.1);
            this.add(whiteKey);
        });

        // black keys
        const blackKeyGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.36);
        const blackKeyMaterial = new THREE.MeshBasicMaterial({color: 0x000000});
        
        const blackKeyPositions = [-0.78, -0.66, -0.42, -0.3, -0.18, 0.06, 0.18, 0.3, 0.54, 0.66, 0.78];
        
        blackKeyPositions.forEach((xPos) => {
            const blackKey = new THREE.Mesh(blackKeyGeometry, blackKeyMaterial);
            blackKey.position.set(xPos, 0.2, 0.225);
            this.add(blackKey);
        });

        // power button
        const buttonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
        const buttonMaterial = new THREE.MeshBasicMaterial({color: 0xff0000});
        const powerButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        powerButton.position.set(0.8, 0.16, -0.25);
        this.add(powerButton);

        // small display screen
        const screenGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.15);
        const screenMaterial = new THREE.MeshBasicMaterial({color: 0x001100});
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-0.6, 0.16, -0.25);
        this.add(screen);
    }
}

MyPiano.prototype.isGroup = true;

export { MyPiano };