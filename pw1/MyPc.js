import * as THREE from 'three';

class MyPc extends THREE.Object3D {
    constructor(app, caseColor = 0x2c2c2c) {
        super();
        this.app = app;
        this.type = 'Group';

        const plasticTexture = new THREE.TextureLoader().load('textures/plastic.jpg');
        plasticTexture.wrapS = THREE.RepeatWrapping;
        plasticTexture.wrapT = THREE.RepeatWrapping;
        plasticTexture.repeat.set(1, 1);

        const plastic2Texture = new THREE.TextureLoader().load('textures/grey_plastic.jpg');
        plastic2Texture.wrapS = THREE.RepeatWrapping;
        plastic2Texture.wrapT = THREE.RepeatWrapping;
        plastic2Texture.repeat.set(1, 1);

        const caseMaterial = new THREE.MeshPhongMaterial({ 
            color: caseColor,
            shininess: 30,
            specular: 0x111111,
            map: plasticTexture,
        });

        const panelMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x555555,
            shininess: 20,
            map: plastic2Texture,
        });

        const ventMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 5,
        });

        const ledMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00ff00,
            emissive: 0x002200,
            shininess: 100,
        });

        const caseGeometry = new THREE.BoxGeometry(1.0, 0.8, 0.45);
        const caseMesh = new THREE.Mesh(caseGeometry, caseMaterial);
        caseMesh.position.set(0, 0.4, 0);
        this.add(caseMesh);

        const frontPanelGeometry = new THREE.BoxGeometry(0.01, 0.6, 0.35);
        const frontPanelMesh = new THREE.Mesh(frontPanelGeometry, panelMaterial);
        frontPanelMesh.position.set(0.505, 0.4, 0);
        this.add(frontPanelMesh);

        const powerButtonGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.01, 12);
        const powerButtonMesh = new THREE.Mesh(powerButtonGeometry, caseMaterial);
        powerButtonMesh.position.set(0.51, 0.65, 0.1);
        powerButtonMesh.rotation.z = Math.PI / 2;
        this.add(powerButtonMesh);

        const ledGeometry = new THREE.SphereGeometry(0.005, 8, 6);
        const ledMesh = new THREE.Mesh(ledGeometry, ledMaterial);
        ledMesh.position.set(0.51, 0.65, 0.05);
        this.add(ledMesh);

        const driveSlotGeometry = new THREE.BoxGeometry(0.005, 0.03, 0.2);
        const driveSlotMesh = new THREE.Mesh(driveSlotGeometry, ventMaterial);
        driveSlotMesh.position.set(0.508, 0.5, 0);
        this.add(driveSlotMesh);

        for (let i = 0; i < 2; i++) {
            const usbGeometry = new THREE.BoxGeometry(0.005, 0.02, 0.05);
            const usbMesh = new THREE.Mesh(usbGeometry, ventMaterial);
            usbMesh.position.set(0.508, 0.3, -0.05 + i * 0.1);
            this.add(usbMesh);
        }

        for (let i = 0; i < 8; i++) {
            const ventGeometry = new THREE.BoxGeometry(0.5, 0.01, 0.005);
            const ventMesh = new THREE.Mesh(ventGeometry, ventMaterial);
            ventMesh.position.set(0, 0.15 + i * 0.08, 0.228);
            this.add(ventMesh);
        }

        const backPanelGeometry = new THREE.BoxGeometry(0.01, 0.3, 0.25);
        const backPanelMesh = new THREE.Mesh(backPanelGeometry, panelMaterial);
        backPanelMesh.position.set(-0.505, 0.55, 0);
        this.add(backPanelMesh);
    }
}

MyPc.prototype.isGroup = true;

export { MyPc };