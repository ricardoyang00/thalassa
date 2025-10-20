import * as THREE from 'three';

class BrainCoral extends THREE.LOD {
    static #texture = (() => {
        const texture = new THREE.TextureLoader().load('textures/brain-coral.png');
        texture.repeat = new THREE.Vector2(1.2, 1.2);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        return texture;
    })();

    constructor(color = 0xffffff, size = 1) {
        super();
        const texture = BrainCoral.#texture.clone();

        const radius = size / 2;
        const material = new THREE.MeshPhongMaterial({
                color,
                map: texture,
                bumpMap: texture,
                bumpScale: 5,
                displacementMap: texture,
                displacementScale: 0.2 * radius,
        });
        const sphereGen = (segments) => new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            material,
        ).rotateZ(Math.PI / 2);

        this.addLevel(sphereGen(128), 0);
        this.addLevel(sphereGen(16), size * 20);
        this.addLevel(sphereGen(4), size * 50);
    }
}

export { BrainCoral };
