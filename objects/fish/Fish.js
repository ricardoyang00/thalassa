import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';
import { FishGeometry } from './FishGeometry.js';
import { MyFishModel } from './MyFishModel.js';

/**
 * @brief Stores all instances related to fish.
 */
export class FishOwner extends InstancedMesh2 {
    static #highDetailMat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/fish.jpg'),
    });
    static #lowDetailMat = new THREE.MeshPhongMaterial();

    constructor() {
        // Dummy mesh will be used to update bones
        const dummy = new MyFishModel();
        const geo = FishGeometry.geometry.map(geo => {
            const bodyGeo = geo.clone();
            const finGroupGeo = FishGeometry.finGroupGeometry.clone();

            // Build skinIndex and skinWeight for fins (use only the middle bone, index = 2)
            const boneIdx = 2; // hard-coded :p
            const vertexCount = geo.attributes.position.count;
            const skinIndices = new Uint16Array(vertexCount * 4);
            const skinWeights = new Float32Array(vertexCount * 4);
            for (let i = 0; i < vertexCount; ++i) {
                skinIndices[4*i] = boneIdx;
                skinWeights[4*i] = 1.0;
            }

            finGroupGeo.setAttribute(
                'skinIndex',
                new THREE.Uint16BufferAttribute(skinIndices, 4),
            );
            finGroupGeo.setAttribute(
                'skinWeight',
                new THREE.Float32BufferAttribute(skinWeights, 4),
            );

            bodyGeo.setAttribute(
                'skinIndex',
                new THREE.Uint16BufferAttribute(dummy.skinIndices, 4),
            );
            bodyGeo.setAttribute(
                'skinWeight',
                new THREE.Float32BufferAttribute(dummy.skinWeights, 4),
            );
            return BufferGeometryUtils.mergeGeometries([bodyGeo, finGroupGeo]).rotateY(-Math.PI/2);
        });
        super(geo[0], FishOwner.#highDetailMat, {
            createEntities: true,
            allowsEuler: true,
        });
        this.addLOD(geo[1], FishOwner.#highDetailMat, 30);
        this.addLOD(geo[2], FishOwner.#lowDetailMat, 100);

        this.dummy = dummy;
        this.initSkeleton(dummy.skeleton); // skeleton is updated when calling animate() on the dummy

        this.frustumCulled = false;
    }
}

export class Fish extends MultiInstancedEntity {
    static defaultOwner = new FishOwner();

    constructor({
        color = 0xffffff,
        scale = 0.3,
        owner = Fish.defaultOwner,
    }) {
        super(owner);
        this.addInstances(1, (obj, i) => {
            owner.setColorAt(i, color);
        });
        this.scale.setScalar(scale);
        this.animationTime = 0;
    }
}
