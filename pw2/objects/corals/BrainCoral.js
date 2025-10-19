import * as THREE from 'three';

class BrainCoral extends THREE.LOD {
    static #texture = (() => {
        const texture = new THREE.TextureLoader().load('textures/brain-coral.png');
        texture.repeat = new THREE.Vector2(1.2, 1.2);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        return texture;
    })();

    constructor(color = 0xffffff, diameter = 1) {
        super();
        const texture = BrainCoral.#texture.clone();

        const radius = diameter / 2;
        const sphereGen = (segments) => new THREE.Mesh(new THREE.SphereGeometry(radius, segments, segments, -0.1 * Math.PI, 1.1 * Math.PI));

        const highMaterial = new THREE.MeshPhongMaterial({
                color,
                map: texture,
                bumpMap: texture,
                bumpScale: 5,
                displacementMap: texture,
                displacementScale: 0.2 * radius,
        })

        const highDetailObj = sphereGen(128);
        highDetailObj.rotateX(-Math.PI / 2);
        highDetailObj.material = highMaterial;

        const mediumDetailObj = sphereGen(16);
        mediumDetailObj.rotateX(-Math.PI / 2);
        mediumDetailObj.material = highMaterial;

        const lowMaterial = new THREE.MeshPhongMaterial({
            color
        });
        
        const lowDetailObj = sphereGen(4);
        const lowerDetailScale = (1 + highMaterial.displacementScale / diameter);
        lowDetailObj.scale.set(lowerDetailScale, lowerDetailScale, lowerDetailScale);
        lowDetailObj.rotateX(-Math.PI / 2);
        lowDetailObj.material = lowMaterial;


        this.addLevel(highDetailObj, 0);
        this.addLevel(mediumDetailObj, 30);
        this.addLevel(lowDetailObj, 200);
    }
}

export { BrainCoral };
