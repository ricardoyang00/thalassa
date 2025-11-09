import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';
import { FishGeometry } from './FishGeometry.js';
import { MyFishModel } from './MyFishModel.js';

export class FishOwner extends InstancedMesh2 {
    static #highDetailMat = new THREE.MeshPhongMaterial({
        map: new THREE.TextureLoader().load('textures/fish.jpg'),
    });
    static #lowDetailMat = new THREE.MeshPhongMaterial();

    constructor() {
        const dummy = new MyFishModel();
        const geo = FishGeometry.geometry.map(geo => {
            const bodyGeo = geo.clone();
            const finGroupGeo = FishGeometry.finGroupGeometry.clone();
            [bodyGeo, finGroupGeo].forEach(geo => {
                geo.setAttribute(
                    'skinIndex',
                    new THREE.Uint16BufferAttribute(dummy.skinIndices, 4),
                );
                geo.setAttribute(
                    'skinWeight',
                    new THREE.Float32BufferAttribute(dummy.skinWeights, 4),
                );
            });
            return BufferGeometryUtils.mergeGeometries([bodyGeo, finGroupGeo]);
        });
        super(geo[0], FishOwner.#highDetailMat, {
            createEntities: true,
            allowsEuler: true,
        });
        this.addLOD(geo[1], FishOwner.#highDetailMat, 30);
        this.addLOD(geo[2], FishOwner.#lowDetailMat, 100);

        this.dummy = dummy;
        this.initSkeleton(dummy.skeleton);

        // // high detail - use MyFishModel directly
        // this.highDetailModel = new MyFishModel({
        //     scale: 1,
        //     color: this.color,
        //     texturePath: this.texturePath,
        //     numBones: this.numBones
        // });

        // // medium detail - body only, no texture, no fins
        // const completeFishGeometry = FishGeometry.createBodyGeometry();
        // const lowDetailMaterial = FishGeometry.getSharedMaterial(this.color);

        // const mediumDetailGroup = new THREE.Group();
        // const bodyMeshMedium = new THREE.Mesh(completeFishGeometry, lowDetailMaterial);
        // mediumDetailGroup.add(bodyMeshMedium);

        // // low detail - simple triangle
        // const simpleFishGeometry = FishGeometry.createSimpleGeometry();

        // const lowDetailGroup = new THREE.Group();
        // const bodyMeshLow = new THREE.Mesh(simpleFishGeometry, lowDetailMaterial);
        // lowDetailGroup.add(bodyMeshLow);
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
