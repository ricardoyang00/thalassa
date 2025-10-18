import * as THREE from 'three';

class BrainCoral extends THREE.LOD {
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
            new THREE.SphereGeometry(radius, undefined, undefined, 0, Math.PI)
        );

        const highMaterial = new THREE.MeshPhongMaterial({
                color,
                map: texture,
                bumpMap: texture,
                bumpScale: 4,
                displacementMap: texture,
                displacementScale: 0.1 * radius,
        })

        const highDetailObj = sphere.clone();
        highDetailObj.rotateX(-Math.PI / 2);
        highDetailObj.material = highMaterial;

        const mediumMaterial = new THREE.MeshPhongMaterial({
            color,
            map: texture
        });

        const mediumDetailObj = sphere.clone();
        mediumDetailObj.rotateX(-Math.PI / 2);
        mediumDetailObj.material = mediumMaterial;

        const lowMaterial = new THREE.MeshPhongMaterial({
            color
        });
        
        const lowDetailObj = sphere.clone();
        lowDetailObj.rotateX(-Math.PI / 2);
        lowDetailObj.material = lowMaterial;


        this.addLevel(highDetailObj, 0);
        this.addLevel(mediumDetailObj, 100);
        this.addLevel(lowDetailObj, 200);
    }
}

export { BrainCoral };
