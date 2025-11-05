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
        const highMaterial = new THREE.MeshPhongMaterial({
                color,
                map: texture,
                bumpMap: texture,
                bumpScale: 5,
                displacementMap: texture,
                displacementScale: 0.2 * radius,
        });

        const mediumMaterial = highMaterial;

        const lowMaterial = mediumMaterial.clone();
        lowMaterial.bumpMap = null;
        lowMaterial.displacementMap = null;

        const sphereGen = (segments, material) => new THREE.Mesh(
            new THREE.SphereGeometry(radius, segments, segments),
            material,
        ).rotateZ(Math.PI / 2);

        this.addLevel(sphereGen(128, highMaterial), 0);
        this.addLevel(sphereGen(16, mediumMaterial), size * 20);

        const lowObj = sphereGen(4, lowMaterial);
        const lowScale = (1 + highMaterial.displacementScale);
        lowObj.scale.set(lowScale, lowScale, lowScale);
        this.addLevel(lowObj, size * 75);
    }
}

export { BrainCoral };
