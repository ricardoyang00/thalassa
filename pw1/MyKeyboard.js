import * as THREE from 'three';

class MyKeyboard extends THREE.Object3D {

    constructor(app, inoxBlackTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const baseMaterial = new THREE.MeshPhongMaterial({
            color: "#404040",
            specular: "#666666",
            emissive: "#000000",
            shininess: 60,
            map: inoxBlackTexture
        });

        const whiteKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#f0f0f0",
            specular: "#333333",
            emissive: "#000000",
            shininess: 5
        });

        const darkKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#222222",
            emissive: "#000000",
            shininess: 5
        });

        const specialKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#505050",
            specular: "#333333",
            emissive: "#000000",
            shininess: 8
        });

        // Gaming accent keys - colorful for gaming setup but matte
        const wasdMaterial = new THREE.MeshPhongMaterial({
            color: "#ff3366",
            specular: "#442233",
            emissive: "#330011",
            emissiveIntensity: 0.2,
            shininess: 10
        });

        const escapeKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#ff6600",
            specular: "#443322",
            emissive: "#331100",
            emissiveIntensity: 0.3,
            shininess: 10
        });

        const enterKeyMaterial = new THREE.MeshPhongMaterial({
            color: "#0066ff",
            specular: "#223344",
            emissive: "#001133",
            emissiveIntensity: 0.2,
            shininess: 10
        });

        const knobMaterial = new THREE.MeshPhongMaterial({
            color: "#808080",
            specular: "#aaaaaa",
            emissive: "#000000",
            shininess: 80,
            map: inoxBlackTexture
        });

        // Keyboard base with metallic texture
        const baseGeometry = new THREE.BoxGeometry(3.2, 0.25, 1.4);
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        baseMesh.position.set(0, 0.125, 0);
        this.add(baseMesh);

        const rows = [
            { count: 12, y: 0.28, startX: -1.2, spacing: 0.2, z: 0.45, height: 0.04, width: 0.11 },
            { count: 12, y: 0.28, startX: -1.2, spacing: 0.2, z: 0.25, height: 0.06, width: 0.12 },
            { count: 10, y: 0.28, startX: -1.0, spacing: 0.2, z: 0.05, height: 0.06, width: 0.12 },
            { count: 9, y: 0.28, startX: -0.9, spacing: 0.2, z: -0.15, height: 0.06, width: 0.12 },
            { count: 7, y: 0.28, startX: -0.6, spacing: 0.2, z: -0.35, height: 0.06, width: 0.12 }
        ];

        rows.forEach((row, rowIndex) => {
            for (let i = 0; i < row.count; i++) {
                const customKeyGeometry = new THREE.BoxGeometry(row.width, row.height, 0.12);
                let keyMaterial = whiteKeyMaterial;

                // Special colored keys for gaming
                if (rowIndex === 1 && i === 0) keyMaterial = escapeKeyMaterial; // Escape key
                if (rowIndex === 2 && [1, 3, 4, 6].includes(i)) keyMaterial = wasdMaterial; // WASD keys
                
                const keyMesh = new THREE.Mesh(customKeyGeometry, keyMaterial);
                keyMesh.position.set(
                    row.startX + (i * row.spacing), 
                    row.y, 
                    row.z
                );
                this.add(keyMesh);
            }
        });

        // Special keys with enhanced materials
        const tabGeometry = new THREE.BoxGeometry(0.25, 0.06, 0.12);
        const tabKey = new THREE.Mesh(tabGeometry, specialKeyMaterial);
        tabKey.position.set(-1.35, 0.28, 0.05);
        this.add(tabKey);

        const capsGeometry = new THREE.BoxGeometry(0.3, 0.06, 0.12);
        const capsKey = new THREE.Mesh(capsGeometry, specialKeyMaterial);
        capsKey.position.set(-1.25, 0.28, -0.15);
        this.add(capsKey);

        const leftShiftGeometry = new THREE.BoxGeometry(0.4, 0.06, 0.12);
        const leftShift = new THREE.Mesh(leftShiftGeometry, specialKeyMaterial);
        leftShift.position.set(-1.1, 0.28, -0.35);
        this.add(leftShift);

        // Enter key with blue color
        const enterGeometry = new THREE.BoxGeometry(0.35, 0.06, 0.12);
        const enterKey = new THREE.Mesh(enterGeometry, enterKeyMaterial);
        enterKey.position.set(1.15, 0.28, 0.05);
        this.add(enterKey);

        const rightShiftGeometry = new THREE.BoxGeometry(0.5, 0.06, 0.12);
        const rightShift = new THREE.Mesh(rightShiftGeometry, specialKeyMaterial);
        rightShift.position.set(1.05, 0.28, -0.35);
        this.add(rightShift);

        // Bottom row keys
        const ctrlGeometry = new THREE.BoxGeometry(0.2, 0.06, 0.12);
        const leftCtrl = new THREE.Mesh(ctrlGeometry, darkKeyMaterial);
        leftCtrl.position.set(-1.2, 0.28, -0.55);
        this.add(leftCtrl);

        const winGeometry = new THREE.BoxGeometry(0.15, 0.06, 0.12);
        const leftWin = new THREE.Mesh(winGeometry, darkKeyMaterial);
        leftWin.position.set(-0.95, 0.28, -0.55);
        this.add(leftWin);

        const altGeometry = new THREE.BoxGeometry(0.15, 0.06, 0.12);
        const leftAlt = new THREE.Mesh(altGeometry, darkKeyMaterial);
        leftAlt.position.set(-0.75, 0.28, -0.55);
        this.add(leftAlt);

        const spaceGeometry = new THREE.BoxGeometry(1.0, 0.06, 0.12);
        const spacebar = new THREE.Mesh(spaceGeometry, whiteKeyMaterial);
        spacebar.position.set(0, 0.28, -0.55);
        this.add(spacebar);

        const rightAlt = new THREE.Mesh(altGeometry, darkKeyMaterial);
        rightAlt.position.set(0.65, 0.28, -0.55);
        this.add(rightAlt);

        const rightCtrl = new THREE.Mesh(ctrlGeometry, darkKeyMaterial);
        rightCtrl.position.set(0.9, 0.28, -0.55);
        this.add(rightCtrl);

        // Volume knob with metallic finish
        const knobGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
        const volumeKnob = new THREE.Mesh(knobGeometry, knobMaterial);
        volumeKnob.position.set(1.4, 0.26, 0.5);
        this.add(volumeKnob);

        // Add LED indicator
        const ledGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.01, 8);
        const ledMaterial = new THREE.MeshPhongMaterial({
            color: 0x00ff00,
            emissive: 0x003300,
            emissiveIntensity: 0.5,
            shininess: 100
        });
        const ledIndicator = new THREE.Mesh(ledGeometry, ledMaterial);
        ledIndicator.position.set(-1.4, 0.27, 0.6);
        this.add(ledIndicator);
    }
}

MyKeyboard.prototype.isGroup = true;

export { MyKeyboard };