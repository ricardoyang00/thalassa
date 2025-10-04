import * as THREE from 'three';

class MyFloorLamp extends THREE.Object3D {
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

        const baseGeometry = new THREE.CylinderGeometry(0.3, 0.3, 0.08, 32);
        const baseMesh = new THREE.Mesh(baseGeometry, blackWoodMaterial);
        baseMesh.position.set(0, 0, 0);
        this.add(baseMesh);

        const base2Geometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 32);
        const base2Mesh = new THREE.Mesh(base2Geometry, blackWoodMaterial);
        base2Mesh.position.set(0, 0.05, 0);
        this.add(base2Mesh);

        const mainStemGeometry = new THREE.CylinderGeometry(0.03, 0.03, 2.8, 16);
        const mainStem = new THREE.Mesh(mainStemGeometry, blackWoodMaterial);
        mainStem.position.set(0, 1.4, 0);
        this.add(mainStem);

        const supportGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32);
        const supportMesh = new THREE.Mesh(supportGeometry, blackWoodMaterial);
        supportMesh.position.set(0, 2.6, 0);
        this.add(supportMesh);

        const lampGeometry = new THREE.CylinderGeometry(0.16, 0.16, 0.25, 32);
        const lampMesh = new THREE.Mesh(lampGeometry, lightMaterial);
        lampMesh.position.set(0, 2.75, 0);
        this.add(lampMesh);

        // Store reference to lamp mesh for toggling emissive
        this.lampMesh = lampMesh;

        this.spotLight = new THREE.SpotLight(0xffffaa, 4, 2, Math.PI / 4, 0.2, 0.5);
        this.spotLight.position.set(0, 2.75, 0);
        this.spotLight.target.position.set(0, 5, 0);
        this.add(this.spotLight);
        this.add(this.spotLight.target);

        this.spotLightHelper = new THREE.SpotLightHelper(this.spotLight);
        this.spotLightHelper.visible = false;
        this.add(this.spotLightHelper);

        this.toggleLamp = (enabled) => {
            this.spotLight.visible = enabled;
            if (enabled) {
                this.lampMesh.material.emissive.setHex(0xffffaa);
                this.lampMesh.material.emissiveIntensity = 0.8;
            } else {
                this.lampMesh.material.emissive.setHex(0x000000);
                this.lampMesh.material.emissiveIntensity = 0;
            }
        };
    }

    setHelperVisible(visible) {
        if (this.spotLightHelper) {
            this.spotLightHelper.visible = visible;
            this.spotLightHelper.update();
        }
    }
}

MyFloorLamp.prototype.isGroup = true;

export { MyFloorLamp };