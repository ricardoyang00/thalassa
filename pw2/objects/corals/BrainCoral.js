import * as THREE from 'three';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';

export class BrainCoralsOwner extends InstancedMesh2 {
    static #texture = (() => {
        const texture = new THREE.TextureLoader().load('textures/brain-coral.png');
        texture.repeat = new THREE.Vector2(1.2, 1.2);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        return texture;
    })();

    static #highDetailMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: this.#texture,
            bumpMap: this.#texture,
            bumpScale: 5,
            displacementMap: this.#texture,
            displacementScale: 0.2,
    });

    static #lowDetailMat = (() => {
        const mat = BrainCoralsOwner.#highDetailMat.clone();
        mat.displacementMap = null;
        mat.bumpMap = null;
        return mat;
    })();

    static #geo = [
        new THREE.SphereGeometry(1, 128, 128).rotateZ(Math.PI / 2),
        new THREE.SphereGeometry(1, 16, 16).rotateZ(Math.PI / 2),
        ((geo) => {
            const scale = 1 + BrainCoralsOwner.#highDetailMat.displacementScale;
            return geo.scale(scale, scale, scale);
        })(new THREE.SphereGeometry(1, 4, 4).rotateZ(Math.PI / 2)),
    ];

    constructor() {
        const geo = BrainCoralsOwner.#geo;
        super(geo[0], BrainCoralsOwner.#highDetailMat, {createEntities: true});
        this.addLOD(geo[1], BrainCoralsOwner.#highDetailMat, 40);
        this.addLOD(geo[2], BrainCoralsOwner.#lowDetailMat, 150);
    }
}

export class BrainCoral extends MultiInstancedEntity {
    static defaultOwner = new BrainCoralsOwner();

    constructor(color = 0xffffff, size = 1, owner = BrainCoral.defaultOwner) {
        super(owner);
        const radius = size / 2;
        this.addInstances(1, (obj, i) => {
            obj.scale.setScalar(radius);
            owner.setColorAt(i, color);
        });
    }
}
