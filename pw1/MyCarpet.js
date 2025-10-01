import * as THREE from 'three';

class MyCarpet extends THREE.Object3D {
    constructor(app, {
        width = 3.0,
        depth = 2.0,
        thickness = 0.02,
        texturePath = 'textures/uv_grid.jpg',
        color = 0xffffff,
        repeatX = 2,
        repeatY = 2,
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // load texture
        const tex = new THREE.TextureLoader().load(texturePath);
        tex.wrapS = THREE.RepeatWrapping;
        tex.wrapT = THREE.RepeatWrapping;
        tex.repeat.set(repeatX, repeatY);

        const mat = new THREE.MeshPhongMaterial({ color: color, map: tex, side: THREE.DoubleSide });

        const geom = new THREE.BoxGeometry(width, thickness, depth);
        const mesh = new THREE.Mesh(geom, mat);

        // set origin at floor level (y=0) with top surface slightly above plane
        mesh.position.set(0, thickness/2, 0);
        this.add(mesh);

        this.mesh = mesh;
    }
}

MyCarpet.prototype.isGroup = true;

export { MyCarpet };
