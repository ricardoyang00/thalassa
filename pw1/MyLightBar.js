import * as THREE from 'three';

class MyLightBar extends THREE.Object3D {
    constructor(app, {
        length = 4,
        color = "#8000ff",
        intensity = 1,
        width = 0.2, 
        height = 0.2,
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        const geometry = new THREE.BoxGeometry(length, height, width);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color,
            emissiveIntensity: 0.5 * intensity,
            shininess: 100,
        });

        this.barMesh = new THREE.Mesh(geometry, material);
        this.add(this.barMesh);

        // Store reference to bar mesh for toggling emissive
        this.originalColor = color;
        this.originalIntensity = 0.5 * intensity;

        this.toggleLightBar = (enabled) => {
            if (enabled) {
                this.barMesh.material.emissive.set(this.originalColor);
                this.barMesh.material.emissiveIntensity = this.originalIntensity;
            } else {
                this.barMesh.material.emissive.setHex(0x000000);
                this.barMesh.material.emissiveIntensity = 0;
            }
        };

        // Add a PointLight to simulate light emission
        //this.light = new THREE.PointLight(color, intensity, 10, 2);
        //this.light.position.set(0, 0, height); // Position light slightly above the bar
        //this.add(this.light);
//
        //// Enable shadows if the renderer supports it
        //this.light.castShadow = true;
        //this.light.shadow.mapSize.width = 512;
        //this.light.shadow.mapSize.height = 512;
        //this.light.shadow.camera.near = 0.1;
        //this.light.shadow.camera.far = 20;
    }
}

MyLightBar.prototype.isGroup = true;

export { MyLightBar };