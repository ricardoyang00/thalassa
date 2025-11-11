import * as THREE from 'three';
import { MyShark } from './MyShark.js';
import { MyFishModel } from '../fish/MyFishModel.js';

class MySharkLOD extends THREE.LOD {
    constructor(app, {
        size = 1,
        assetsPath = 'models/shark/',
        gltfFile = 'scene.gltf',
        onLoad = null
    } = {}) {
        super();

        this.highDetailModel = null;
        // Need 2 references: one to the group, one to the fish model inside it
        this.lowDetailModelGroup = null;
        this.lowDetailFishModel = null; 
        this.app = app;
        
        this.animationTime = 0;

        const lowDetailGroup = new THREE.Group();

        const fishModel = new MyFishModel({
            scale: 1.5,
            color: 0x545557,
            texturePath: null,
            numBones: 5
        });

        fishModel.rotation.y = -Math.PI / 2;
        lowDetailGroup.add(fishModel);
        this.lowDetailModelGroup = lowDetailGroup;
        this.lowDetailFishModel = fishModel;

        const self = this;
        const alignedOnLoad = function (loadedObject) {
            try {
                self.updateWorldMatrix(true, true);
                
                self.highDetailModel.updateWorldMatrix(true, true);
                const highBox = new THREE.Box3().setFromObject(self.highDetailModel);
                const highCenterWorld = new THREE.Vector3();
                highBox.getCenter(highCenterWorld);
                const highCenterLocal = self.worldToLocal(highCenterWorld.clone());

                self.lowDetailModelGroup.position.set(0, 0, 0); 
                self.lowDetailModelGroup.quaternion.set(0, 0, 0, 1);
                self.lowDetailModelGroup.scale.set(1, 1, 1);
                self.lowDetailModelGroup.updateWorldMatrix(true, true); 

                const lowBox = new THREE.Box3().setFromObject(self.lowDetailModelGroup);
                const lowCenterWorld = new THREE.Vector3();
                lowBox.getCenter(lowCenterWorld);
                const lowCenterLocal = self.worldToLocal(lowCenterWorld.clone());

                const localOffset = new THREE.Vector3().subVectors(highCenterLocal, lowCenterLocal);
                const adjustment = new THREE.Vector3(0, 0, -1);
                
                self.lowDetailModelGroup.position.copy(localOffset).add(adjustment);

            } catch (e) {
                console.warn('MySharkLOD: failed to align LODs', e);
            }

            if (typeof onLoad === 'function') onLoad(loadedObject);
        };

        const highDetailParams = {
            size: 1,
            assetsPath,
            gltfFile,
            onLoad: alignedOnLoad
        };

        this.#buildShark(highDetailParams);

        this.addLevel(this.highDetailModel, 0);
        this.addLevel(this.lowDetailModelGroup, 200);

        this.scale.setScalar(size || 1);
    }

    #buildShark(highDetailParams) {
        this.highDetailModel = new MyShark(this.app, highDetailParams);
    }

    animate(dt, speedFactor = 0) {
        if (this.lowDetailFishModel && typeof this.lowDetailFishModel.animate === 'function') {
            this.lowDetailFishModel.animate(this, dt, speedFactor);
        }

        if (this.highDetailModel && typeof this.highDetailModel.update === 'function') {
            this.highDetailModel.update(dt);
        }
    }
}

export { MySharkLOD };