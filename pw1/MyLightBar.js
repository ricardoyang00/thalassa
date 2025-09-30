import * as THREE from 'three';

class MyLightBar extends THREE.Object3D {
    constructor(app, {
        length = 4, // Length of the light bar in units
        color = 0x8000ff, // Default purple color
        intensity = 1, // Light intensity
        width = 0.2, // Width of the bar
        height = 0.2, // Height of the bar
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Create the light bar geometry and material
        const geometry = new THREE.BoxGeometry(length, height, width);
        const material = new THREE.MeshPhongMaterial({
            color: color,
            emissive: color, // Emissive to simulate glow
            emissiveIntensity: 0.5 * intensity,
            shininess: 100, // High shininess for a smooth, glowing look
        });

        // Create the mesh for the light bar
        this.barMesh = new THREE.Mesh(geometry, material);
        this.add(this.barMesh);

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

    // Method to update the color of the light bar and light
    setColor(color) {
        this.barMesh.material.color.set(color);
        this.barMesh.material.emissive.set(color);
        this.light.color.set(color);
    }

    // Method to update the light intensity
    setIntensity(intensity) {
        this.barMesh.material.emissiveIntensity = 0.5 * intensity;
        this.light.intensity = intensity;
    }
}

MyLightBar.prototype.isGroup = true;

export { MyLightBar };