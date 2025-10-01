import * as THREE from 'three';

class MyKeyboard extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const baseMaterial = new THREE.MeshBasicMaterial({color: 0x1a1a1a});
        const whiteKeyMaterial = new THREE.MeshBasicMaterial({color: 0xe8e8e8});
        const darkKeyMaterial = new THREE.MeshBasicMaterial({color: 0x2a2a2a});
        const specialKeyMaterial = new THREE.MeshBasicMaterial({color: 0x404040});

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

        rows.forEach((row) => {
            for (let i = 0; i < row.count; i++) {
                const customKeyGeometry = new THREE.BoxGeometry(row.width, row.height, 0.12);
                const keyMesh = new THREE.Mesh(customKeyGeometry, whiteKeyMaterial);
                keyMesh.position.set(
                    row.startX + (i * row.spacing), 
                    row.y, 
                    row.z
                );
                this.add(keyMesh);
            }
        });

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

        const enterGeometry = new THREE.BoxGeometry(0.35, 0.06, 0.12);
        const enterKey = new THREE.Mesh(enterGeometry, specialKeyMaterial);
        enterKey.position.set(1.15, 0.28, 0.05);
        this.add(enterKey);

        const rightShiftGeometry = new THREE.BoxGeometry(0.5, 0.06, 0.12);
        const rightShift = new THREE.Mesh(rightShiftGeometry, specialKeyMaterial);
        rightShift.position.set(1.05, 0.28, -0.35);
        this.add(rightShift);

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

        const knobGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.12, 16);
        const knobMaterial = new THREE.MeshBasicMaterial({color: 0x606060});
        const volumeKnob = new THREE.Mesh(knobGeometry, knobMaterial);
        volumeKnob.position.set(1.4, 0.26, 0.5);
        this.add(volumeKnob);
    }
}

MyKeyboard.prototype.isGroup = true;

export { MyKeyboard };