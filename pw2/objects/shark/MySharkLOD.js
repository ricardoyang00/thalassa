import * as THREE from 'three';
import { MyShark } from './MyShark.js';
import { FishGeometry } from '../fish/FishGeometry.js';

class MySharkLOD extends THREE.LOD {
    /**
     * @param {MyApp} app - The main application object
     * @param {Object} params - Configuration for the shark
     * @param {number} params.size - Overall scale (default 1)
     */
    constructor(app, {
        size = 1,
        assetsPath = 'models/shark/',
        mtlFile = 'Shark_1.mtl',
        objFile = 'Shark_1.obj',
        onLoad = null
    } = {}) {
        super();

        this.highDetailModel = null;
        this.lowDetailModel = null;
        this.app = app;

        // --- Create the low-detail LOD ---
        const completeFishGeometry = FishGeometry.createBodyGeometry();
        const lowDetailMaterial = FishGeometry.getSharedMaterial(0x999999);
        const lowDetailGroup = new THREE.Group();
        const bodyMeshLow = new THREE.Mesh(completeFishGeometry, lowDetailMaterial);

        // Correct the base rotation and scale of the low-detail geometry
        // to match the high-detail model's default orientation and size.
        bodyMeshLow.rotation.y = -Math.PI / 2;
        const lowDetailScale = 1.5;
        bodyMeshLow.scale.setScalar(lowDetailScale);
        
        lowDetailGroup.add(bodyMeshLow);
        this.lowDetailModel = lowDetailGroup;

        // This callback aligns the visual centers of the high and low detail models
        // once the high-detail model has finished loading.
        const self = this;
        const alignedOnLoad = function (loadedObject) {
            try {
                // Ensure world matrices are up-to-date for correct box calculations
                self.updateWorldMatrix(true, true);
                
                // Get high-detail model's visual center in LOD's local space
                self.highDetailModel.updateWorldMatrix(true, true);
                const highBox = new THREE.Box3().setFromObject(self.highDetailModel);
                const highCenterWorld = new THREE.Vector3();
                highBox.getCenter(highCenterWorld);
                const highCenterLocal = self.worldToLocal(highCenterWorld.clone());

                // Get low-detail model's visual center in LOD's local space.
                // We must reset its transform first to get its 'natural' center.
                self.lowDetailModel.position.set(0, 0, 0); 
                self.lowDetailModel.quaternion.set(0, 0, 0, 1);
                self.lowDetailModel.scale.set(1, 1, 1);
                self.lowDetailModel.updateWorldMatrix(true, true); 

                const lowBox = new THREE.Box3().setFromObject(self.lowDetailModel);
                const lowCenterWorld = new THREE.Vector3();
                lowBox.getCenter(lowCenterWorld);
                const lowCenterLocal = self.worldToLocal(lowCenterWorld.clone());

                // Calculate the offset vector from the low-center to the high-center
                const localOffset = new THREE.Vector3().subVectors(highCenterLocal, lowCenterLocal);

                // Apply this offset to the low-detail model's position
                self.lowDetailModel.position.copy(localOffset);

                // Copy rotation/scale from the high-detail container (MyShark)
                self.lowDetailModel.quaternion.copy(self.highDetailModel.quaternion);
                self.lowDetailModel.scale.copy(self.highDetailModel.scale);

            } catch (e) {
                console.warn('MySharkLOD: failed to align LODs', e);
            }

            if (typeof onLoad === 'function') onLoad(loadedObject);
        };

        // Build high-detail model with size=1 (LOD container will be scaled)
        const highDetailParams = {
            size: 1,
            assetsPath,
            mtlFile,
            objFile,
            onLoad: alignedOnLoad
        };

        this.#buildShark(highDetailParams);

        // Add LOD levels
        this.addLevel(this.highDetailModel, 0);
        this.addLevel(this.lowDetailModel, 200);

        // Apply the overall scale to the LOD object itself
        this.scale.setScalar(size || 1);
    }

    #buildShark(highDetailParams) {
        this.highDetailModel = new MyShark(this.app, highDetailParams);
    }

    animate(dt) {
        // Propagate animation update to the high-detail model if it has an update method
        if (this.highDetailModel && typeof this.highDetailModel.update === 'function') {
            this.highDetailModel.update(dt);
        }
    }
}

export { MySharkLOD };