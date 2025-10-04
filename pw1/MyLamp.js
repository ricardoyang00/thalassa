import * as THREE from 'three';

class MyLamp extends THREE.Object3D {
    constructor(app, blackWoodTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const blackWoodMaterial = new THREE.MeshPhongMaterial({
            color: "#2a2a2a",
            specular: "#404040",
            emissive: "#000000",
            shininess: 10,
            map: blackWoodTexture
        });

        const lightMaterial = new THREE.MeshPhongMaterial({
            color: "#ffffaa",
            emissive: "#ffffaa",
            emissiveIntensity: 0.8,
            shininess: 100
        });

        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.05, 32);
        const baseMesh = new THREE.Mesh(baseGeometry, blackWoodMaterial);
        baseMesh.position.set(0, 0, 0);
        this.add(baseMesh);

        const base2Geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 32);
        const base2Mesh = new THREE.Mesh(base2Geometry, blackWoodMaterial);
        base2Mesh.position.set(0, 0.05, 0);
        this.add(base2Mesh);

        const mainStemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 1.2, 16);
        const mainStem = new THREE.Mesh(mainStemGeometry, blackWoodMaterial);
        mainStem.position.set(0, 0.6, 0);
        this.add(mainStem);

        const jointGeometry = new THREE.SphereGeometry(0.06, 16, 16);
        const jointMesh = new THREE.Mesh(jointGeometry, blackWoodMaterial);
        jointMesh.position.set(0, 1.2, 0);
        this.add(jointMesh);

        const upperStemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.5, 16);
        const upperStem = new THREE.Mesh(upperStemGeometry, blackWoodMaterial);
        upperStem.rotation.x = Math.PI / 3; 
        upperStem.position.set(0, 1.33, 0.25);
        this.add(upperStem);

        const joint2Mesh = new THREE.Mesh(jointGeometry, blackWoodMaterial);
        joint2Mesh.position.set(0, 1.46, 0.5);
        this.add(joint2Mesh);

        const downwardStemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.3, 16);
        const downwardStem = new THREE.Mesh(downwardStemGeometry, blackWoodMaterial);
        downwardStem.position.set(0, 1.26, 0.5);
        this.add(downwardStem);

        const supportGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.05, 32);
        const supportMesh = new THREE.Mesh(supportGeometry, blackWoodMaterial);
        supportMesh.position.set(0, 1.1, 0.5);
        this.add(supportMesh);

        const lampGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.25, 32);
        const lampMesh = new THREE.Mesh(lampGeometry, lightMaterial);
        lampMesh.position.set(0, 0.95, 0.5);
        this.add(lampMesh);

        this.spotLight = new THREE.SpotLight(0xffffaa, 10, 1, Math.PI / 4, 0.2, 0.5);
        this.spotLight.position.set(0, 0.9, 0.5);
        this.spotLight.target.position.set(0, 0, 0.5);
        this.add(this.spotLight);
        this.add(this.spotLight.target);

        //const lightHelper = new THREE.SpotLightHelper(this.spotLight);
        //this.add(lightHelper);
    }
}

MyLamp.prototype.isGroup = true;

export { MyLamp };