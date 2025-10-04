import * as THREE from 'three';

class MyPiano extends THREE.Object3D {

    constructor(app, blackWoodTexture_, inoxBlackTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const blackWoodTexture = blackWoodTexture_.clone();
        blackWoodTexture.repeat.set(3, 1); 

        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#404040",
            emissive: "#000000",
            shininess: 60,
            map: blackWoodTexture
        });

        const whiteKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#f8f8f8",
            specular: "#ffffff",
            emissive: "#000000",
            shininess: 80,
        });

        const blackKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#0a0a0a",
            specular: "#2a2a2a",
            emissive: "#000000",
            shininess: 90,
        });

        const metalMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",
            specular: "#666666",
            emissive: "#000000",
            shininess: 90,
            map: inoxBlackTexture
        });

        const buttonMaterial = new THREE.MeshPhongMaterial({
            color: "#cc0000",
            specular: "#ff6666",
            emissive: "#330000",
            emissiveIntensity: 0.3,
            shininess: 100,
        });

        const screenMaterial = new THREE.MeshPhongMaterial({
            color: "#002200",
            specular: "#004400",
            emissive: "#001100",
            emissiveIntensity: 0.5,
            shininess: 50,
        });

        // Piano body (black wood)
        const baseGeometry = new THREE.BoxGeometry(2, 0.15, 0.8);
        const baseMesh = new THREE.Mesh(baseGeometry, blackWoodMaterial);
        baseMesh.position.set(0, 0.075, 0);
        this.add(baseMesh);

        const whiteKeyGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.6);
        const whiteKeyPositions = [-0.84, -0.72, -0.6, -0.48, -0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84];
        
        whiteKeyPositions.forEach((xPos) => {
            const whiteKey = new THREE.Mesh(whiteKeyGeometry, whiteKeyMaterial);
            whiteKey.position.set(xPos, 0.175, 0.1);
            this.add(whiteKey);
        });

        const blackKeyGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.36);
        const blackKeyPositions = [-0.78, -0.66, -0.42, -0.3, -0.18, 0.06, 0.18, 0.3, 0.54, 0.66, 0.78];
        
        blackKeyPositions.forEach((xPos) => {
            const blackKey = new THREE.Mesh(blackKeyGeometry, blackKeyMaterial);
            blackKey.position.set(xPos, 0.2, -0.03);
            this.add(blackKey);
        });

        const buttonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
        const powerButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        powerButton.position.set(0.8, 0.16, -0.25);
        this.add(powerButton);

        const screenGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.15);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-0.6, 0.16, -0.25);
        this.add(screen);

        const knobGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12);
        const volumeKnob = new THREE.Mesh(knobGeometry, metalMaterial);
        volumeKnob.position.set(0.5, 0.165, -0.25);
        this.add(volumeKnob);

        const tempoKnob = new THREE.Mesh(knobGeometry, metalMaterial);
        tempoKnob.position.set(0.3, 0.165, -0.25);
        this.add(tempoKnob);

        const footGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 8);
        const footPositions = [
            [-0.9, 0, -0.35],
            [0.9, 0, -0.35],
            [-0.9, 0, 0.35],
            [0.9, 0, 0.35]
        ];

        footPositions.forEach(([x, y, z]) => {
            const foot = new THREE.Mesh(footGeometry, metalMaterial);
            foot.position.set(x, y, z);
            this.add(foot);
        });
    }
}

MyPiano.prototype.isGroup = true;

export { MyPiano };