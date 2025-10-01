import * as THREE from 'three';

class MyPiano extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load textures
        const blackWoodTexture = new THREE.TextureLoader().load('textures/wood_black.jpg');
        blackWoodTexture.wrapS = THREE.RepeatWrapping;
        blackWoodTexture.wrapT = THREE.RepeatWrapping;
        blackWoodTexture.repeat.set(3, 1); // Horizontal grain for piano body

        const inoxBlackTexture = new THREE.TextureLoader().load('textures/inox_black.jpg');
        inoxBlackTexture.wrapS = THREE.RepeatWrapping;
        inoxBlackTexture.wrapT = THREE.RepeatWrapping;
        inoxBlackTexture.repeat.set(1, 1);

        // Create realistic materials
        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",        // Dark gray tint for black wood
            specular: "#404040",     // Medium gray specular for subtle shine
            emissive: "#000000",
            shininess: 60,           // Semi-glossy finish typical of finished wood
            map: blackWoodTexture
        });

        const whiteKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#f8f8f8",        // Slightly off-white for realism
            specular: "#ffffff",     // White specular for plastic/ivory shine
            emissive: "#000000",
            shininess: 80,           // High shine for smooth key surface
        });

        const blackKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#0a0a0a",        // Very dark for black keys
            specular: "#2a2a2a",     // Dark specular
            emissive: "#000000",
            shininess: 90,           // High shine for polished black keys
        });

        const metalMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a",        // Very dark gray for black metal
            specular: "#666666",     // Bright specular for metallic shine
            emissive: "#000000",
            shininess: 90,           // High shininess for polished metal
            map: inoxBlackTexture
        });

        const buttonMaterial = new THREE.MeshPhongMaterial({
            color: "#cc0000",        // Deep red for power button
            specular: "#ff6666",     // Bright red specular
            emissive: "#330000",     // Slight red glow
            emissiveIntensity: 0.3,
            shininess: 100,          // Very shiny for plastic button
        });

        const screenMaterial = new THREE.MeshPhongMaterial({
            color: "#002200",        // Dark green for LCD screen
            specular: "#004400",     // Green specular
            emissive: "#001100",     // Green glow for active screen
            emissiveIntensity: 0.5,
            shininess: 50,           // Medium shine for screen surface
        });

        // Piano body (black wood)
        const baseGeometry = new THREE.BoxGeometry(2, 0.15, 0.8);
        const baseMesh = new THREE.Mesh(baseGeometry, blackWoodMaterial);
        baseMesh.position.set(0, 0.075, 0);
        this.add(baseMesh);

        // White keys with realistic material
        const whiteKeyGeometry = new THREE.BoxGeometry(0.12, 0.05, 0.6);
        
        const whiteKeyPositions = [-0.84, -0.72, -0.6, -0.48, -0.36, -0.24, -0.12, 0, 0.12, 0.24, 0.36, 0.48, 0.6, 0.72, 0.84];
        
        whiteKeyPositions.forEach((xPos) => {
            const whiteKey = new THREE.Mesh(whiteKeyGeometry, whiteKeyMaterial);
            whiteKey.position.set(xPos, 0.175, 0.1);
            this.add(whiteKey);
        });

        // Black keys with realistic material
        const blackKeyGeometry = new THREE.BoxGeometry(0.08, 0.05, 0.36);
        
        const blackKeyPositions = [-0.78, -0.66, -0.42, -0.3, -0.18, 0.06, 0.18, 0.3, 0.54, 0.66, 0.78];
        
        blackKeyPositions.forEach((xPos) => {
            const blackKey = new THREE.Mesh(blackKeyGeometry, blackKeyMaterial);
            blackKey.position.set(xPos, 0.2, -0.03);
            this.add(blackKey);
        });

        // Power button with glowing effect
        const buttonGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.02, 16);
        const powerButton = new THREE.Mesh(buttonGeometry, buttonMaterial);
        powerButton.position.set(0.8, 0.16, -0.25);
        this.add(powerButton);

        // Small display screen with green glow
        const screenGeometry = new THREE.BoxGeometry(0.3, 0.02, 0.15);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(-0.6, 0.16, -0.25);
        this.add(screen);

        // Add some metal control knobs/sliders
        const knobGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.015, 12);
        
        // Volume knob
        const volumeKnob = new THREE.Mesh(knobGeometry, metalMaterial);
        volumeKnob.position.set(0.5, 0.165, -0.25);
        this.add(volumeKnob);

        // Tempo knob
        const tempoKnob = new THREE.Mesh(knobGeometry, metalMaterial);
        tempoKnob.position.set(0.3, 0.165, -0.25);
        this.add(tempoKnob);

        // Add small metal feet for the piano
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

        // Store references for potential future use
        this.screen = screen;
        this.powerButton = powerButton;
        this.volumeKnob = volumeKnob;
        this.tempoKnob = tempoKnob;
    }

    // Method to change screen color (for different modes)
    setScreenColor(color) {
        this.screen.material.color.setHex(color);
        this.screen.material.emissive.setHex(color & 0x333333); // Darker emissive
    }

    // Method to toggle power button glow
    setPowerButtonGlow(intensity) {
        this.powerButton.material.emissiveIntensity = intensity;
    }
}

MyPiano.prototype.isGroup = true;

export { MyPiano };