import * as THREE from 'three';

class BrainCoral extends THREE.Object3D {
    static #texture = (() => {
        const texture = new THREE.TextureLoader().load('textures/brain-coral.png');
        texture.repeat = new THREE.Vector2(5, 5);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        return texture;
    })();

    constructor(color = 0xffffff, radius = 1) {
        super();
        const texture = BrainCoral.#texture.clone();

        const sphere = new THREE.Mesh(
            new THREE.SphereGeometry(radius, undefined, undefined, 0, Math.PI),
            new THREE.MeshPhongMaterial({
                color,
                map: texture,
                bumpMap: texture,
                bumpScale: 4,
                displacementMap: texture,
                displacementScale: 0.1 * radius,
            })
        );
        this.add(sphere);
        this.rotateX(-Math.PI / 2);
    }
}

export { BrainCoral };
