import * as THREE from 'three';

class MyGuitar extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const woodMaterial = new THREE.MeshBasicMaterial({color: 0x8B4513});
        const stringMaterial = new THREE.MeshBasicMaterial({color: 0xFFD700});
        const blackMaterial = new THREE.MeshBasicMaterial({color: 0x000000});

        // lower bout
        const lowerGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
        const lowerMesh = new THREE.Mesh(lowerGeometry, woodMaterial);
        lowerMesh.position.set(0, -0.5, 0);
        lowerMesh.rotation.x = Math.PI / 2;
        this.add(lowerMesh);

        // upper bout
        const upperGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 32);
        const upperMesh = new THREE.Mesh(upperGeometry, woodMaterial);
        upperMesh.position.set(0, 0.8, 0);
        upperMesh.rotation.x = Math.PI / 2;
        this.add(upperMesh);

        // sound hole
        const holeGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 32);
        const holeMesh = new THREE.Mesh(holeGeometry, blackMaterial);
        holeMesh.position.set(0, 0.8, 0);
        holeMesh.rotation.x = Math.PI / 2;
        this.add(holeMesh);

        // neck
        const neckGeometry = new THREE.BoxGeometry(0.15, 2.5, 0.1);
        const neckMesh = new THREE.Mesh(neckGeometry, woodMaterial);
        neckMesh.position.set(0, 2.0, 0.05);
        this.add(neckMesh);

        // headstock
        const headGeometry = new THREE.BoxGeometry(0.22, 0.4, 0.08);
        const headMesh = new THREE.Mesh(headGeometry, woodMaterial);
        headMesh.position.set(0, 3.4, 0.05);
        this.add(headMesh);

        // fretboard
        const fretboardGeometry = new THREE.BoxGeometry(0.16, 2.0, 0.02);
        const fretboardMesh = new THREE.Mesh(fretboardGeometry, blackMaterial);
        fretboardMesh.position.set(0, 1.8, 0.11);
        this.add(fretboardMesh);

        // frets
        for (let i = 0; i < 12; i++) {
            const fretGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.16, 8);
            const fretMesh = new THREE.Mesh(fretGeometry, stringMaterial);
            fretMesh.position.set(0, 0.9 + (i * 0.15), 0.12);
            fretMesh.rotation.z = Math.PI / 2;
            this.add(fretMesh);
        }

        // bridge
        const bridgeGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.05);
        const bridgeMesh = new THREE.Mesh(bridgeGeometry, blackMaterial);
        bridgeMesh.position.set(0, -0.3, 0.125);
        this.add(bridgeMesh);

        // strings
        for (let i = 0; i < 6; i++) {
            const stringGeometry = new THREE.CylinderGeometry(0.002, 0.002, 3.8, 8);
            const stringMesh = new THREE.Mesh(stringGeometry, stringMaterial);
            stringMesh.position.set(-0.05 + (i * 0.02), 1.66, 0.12);
            this.add(stringMesh);
        }
    }
}

MyGuitar.prototype.isGroup = true;

export { MyGuitar };