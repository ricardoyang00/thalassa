import * as THREE from 'three';

class MyCarpet extends THREE.Object3D {
    constructor(app, {
        width = 3.0,
        depth = 2.0,
        thickness = 0.02,
        texturePath = 'textures/carpet.jpg',
        color = 0xff6b35, // Orange color matching the light bars
        repeatX = 2,
        repeatY = 2,
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load carpet texture
        const carpetTexture = new THREE.TextureLoader().load(texturePath);
        carpetTexture.wrapS = THREE.RepeatWrapping;
        carpetTexture.wrapT = THREE.RepeatWrapping;
        carpetTexture.repeat.set(repeatX, repeatY);

        // Create carpet material with orange tint and reduced shininess
        const carpetMaterial = new THREE.MeshPhongMaterial({ 
            color: color,               // Orange color matching light bars
            specular: "#2a1a0a",       // Dark brown specular for fabric
            emissive: "#000000",
            shininess: 5,              // Very low shininess for carpet texture
            map: carpetTexture,
            side: THREE.DoubleSide 
        });

        const geom = new THREE.BoxGeometry(width, thickness, depth);
        const mesh = new THREE.Mesh(geom, carpetMaterial);

        // set origin at floor level (y=0) with top surface slightly above plane
        mesh.position.set(0, thickness/2, 0);
        this.add(mesh);

        this.mesh = mesh;
    }

    // Method to change carpet color while keeping texture
    setCarpetColor(color) {
        this.mesh.material.color.setHex(color);
    }
}

MyCarpet.prototype.isGroup = true;

export { MyCarpet };