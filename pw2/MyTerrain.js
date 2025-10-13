import * as THREE from 'three';

class MyTerrain extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;
        this.buildTerrain();
    }

    buildTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(50, 50, 64, 64);
        
        let terrainMap = new THREE.TextureLoader().load('images/heightmap.jpg');

        terrainMap.wrapS = terrainMap.wrapT = THREE.RepeatWrapping;
        terrainMap.repeat.set(1, 1);

        const terrainMaterial = new THREE.MeshPhongMaterial({ 
            color: "#8B7355",
            wireframe: false, 
            displacementMap: terrainMap,
            displacementScale: 2.5
        });

        const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        terrainMesh.rotation.x = -Math.PI / 2;
        terrainMesh.position.y = -2;

        this.add(terrainMesh);
    }
}

export { MyTerrain };