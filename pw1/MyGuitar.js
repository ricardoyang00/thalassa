import * as THREE from 'three';

class MyGuitar extends THREE.Object3D {

    constructor(app, lightWoodTexture, darkWoodTexture, goldTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const lightWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#d4a574",
            specular: "#8b7355",
            emissive: "#000000",
            shininess: 30,
            map: lightWoodTexture
        });

        const darkWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a1f14",
            specular: "#1a1a1a",
            emissive: "#000000",
            shininess: 40,
            map: darkWoodTexture
        });

        const goldMaterial = new THREE.MeshPhongMaterial({
            color: "#ffd700",
            specular: "#ffff99",
            emissive: "#000000",
            shininess: 80,
            map: goldTexture
        });

        const blackMaterial = new THREE.MeshPhongMaterial({
            color: "#0a0a0a",
            specular: "#1a1a1a",
            emissive: "#000000",
            shininess: 5
        });

        // lower bout (light wood body)
        const lowerGeometry = new THREE.CylinderGeometry(1.2, 1.2, 0.2, 32);
        const lowerMesh = new THREE.Mesh(lowerGeometry, lightWoodMaterial);
        lowerMesh.position.set(0, -0.5, 0);
        lowerMesh.rotation.x = Math.PI / 2;
        this.add(lowerMesh);

        // upper bout (light wood body)
        const upperGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 32);
        const upperMesh = new THREE.Mesh(upperGeometry, lightWoodMaterial);
        upperMesh.position.set(0, 0.8, 0);
        upperMesh.rotation.x = Math.PI / 2;
        this.add(upperMesh);

        // sound hole
        const holeGeometry = new THREE.CylinderGeometry(0.35, 0.35, 0.22, 32);
        const holeMesh = new THREE.Mesh(holeGeometry, blackMaterial);
        holeMesh.position.set(0, 0.8, 0);
        holeMesh.rotation.x = Math.PI / 2;
        this.add(holeMesh);

        // neck (light wood)
        const neckGeometry = new THREE.BoxGeometry(0.15, 2.5, 0.1);
        const neckMesh = new THREE.Mesh(neckGeometry, lightWoodMaterial);
        neckMesh.position.set(0, 2.0, 0.05);
        this.add(neckMesh);

        // headstock (light wood)
        const headGeometry = new THREE.BoxGeometry(0.22, 0.4, 0.08);
        const headMesh = new THREE.Mesh(headGeometry, lightWoodMaterial);
        headMesh.position.set(0, 3.4, 0.05);
        this.add(headMesh);

        // fretboard (dark wood - ebony)
        const fretboardGeometry = new THREE.BoxGeometry(0.16, 2.0, 0.02);
        const fretboardMesh = new THREE.Mesh(fretboardGeometry, darkWoodMaterial);
        fretboardMesh.position.set(0, 1.8, 0.11);
        this.add(fretboardMesh);

        // frets (gold/brass)
        for (let i = 0; i < 12; i++) {
            const fretGeometry = new THREE.CylinderGeometry(0.003, 0.003, 0.16, 8);
            const fretMesh = new THREE.Mesh(fretGeometry, goldMaterial);
            fretMesh.position.set(0, 0.9 + (i * 0.15), 0.12);
            fretMesh.rotation.z = Math.PI / 2;
            this.add(fretMesh);
        }

        // bridge (dark wood)
        const bridgeGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.05);
        const bridgeMesh = new THREE.Mesh(bridgeGeometry, darkWoodMaterial);
        bridgeMesh.position.set(0, -0.3, 0.125);
        this.add(bridgeMesh);

        // strings (gold/brass - representing bronze strings)
        for (let i = 0; i < 6; i++) {
            const stringGeometry = new THREE.CylinderGeometry(0.002, 0.002, 3.8, 8);
            const stringMesh = new THREE.Mesh(stringGeometry, goldMaterial);
            stringMesh.position.set(-0.05 + (i * 0.02), 1.66, 0.12);
            this.add(stringMesh);
        }
    }
}

MyGuitar.prototype.isGroup = true;

export { MyGuitar };