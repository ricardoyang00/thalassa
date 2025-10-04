import * as THREE from 'three';

class MyCarpet extends THREE.Object3D {
    constructor(app, carpetTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        this.width = 3.0
        this.depth = 2.0
        this.thickness = 0.02
        this.color = "#ff6b35"

        const carpetMaterial = new THREE.MeshPhongMaterial({ 
            color: this.color,
            specular: "#2a1a0a",
            emissive: "#000000",
            shininess: 5,
            map: carpetTexture
        });

        const geom = new THREE.BoxGeometry(this.width, this.thickness, this.depth);
        const mesh = new THREE.Mesh(geom, carpetMaterial);

        mesh.position.set(0, this.thickness / 2, 0);
        this.add(mesh);

        this.mesh = mesh;
    }
}

MyCarpet.prototype.isGroup = true;

export { MyCarpet };