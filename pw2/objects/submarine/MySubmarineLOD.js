import * as THREE from 'three';
import { MySubmarine } from './MySubmarine.js';
import { SubmarineControls } from './SubmarineControls.js';

class MySubmarineLOD extends THREE.LOD {
    constructor(app, {
        size = 1,
        assetsPath = 'models/submarine/',
        gltfFile = 'scene.gltf',
        onLoad = null
    } = {}) {
        super();

        this.app = app;
        this.highDetailModel = null;
        this.lowDetailModelGroup = null;
        this.controls = null;
        this.onLoadCallback = onLoad;

        // Submarine physics properties
        this.forwardSpeed = 0;
        this.verticalSpeed = 0;
        this.maxForwardSpeed = 10;
        this.maxVerticalSpeed = 5;
        this.minY = 5;
        this.maxY = 30;
        this.forwardAccel = 6;
        this.verticalAccel = 4;
        this.yawRate = Math.PI;
        this.controlsEnabled = false;

        // Create low-detail LOD (cylinder)
        const lowDetailGroup = new THREE.Group();
        
        const hullLength = 3.0;
        const hullRadius = 0.5;
        const hullGeo = new THREE.CylinderGeometry(hullRadius, hullRadius, hullLength, 24, 1);
        const hullMat = new THREE.MeshPhongMaterial({
            color: 0xffdd77,
            shininess: 30,
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.z = Math.PI / 2;
        lowDetailGroup.add(hull);

        this.lowDetailModelGroup = lowDetailGroup;

        // Build high-detail model
        const self = this;
        this.#buildSubmarine({
            size: 1,
            assetsPath,
            gltfFile,
            onLoad: () => {
                self.highDetailModel.rotation.y = -Math.PI / 2;
                
                setTimeout(() => {
                    self.#alignModels();
                    
                    if (typeof self.onLoadCallback === 'function') {
                        self.onLoadCallback(self);
                    }
                }, 100);
            }
        });

        // Add LOD levels
        this.addLevel(this.highDetailModel, 0);
        this.addLevel(this.lowDetailModelGroup, 200);

        this.scale.setScalar(size || 1);

        // FPV camera
        this.fpvCamera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
        this.fpvCamera.position.set(-size * 1.0, size * 0.7, 0);
        this.fpvCamera.rotation.y = Math.PI / 2;
        this.add(this.fpvCamera);
    }

    #buildSubmarine(highDetailParams) {
        this.highDetailModel = new MySubmarine(this.app, highDetailParams);
    }

    #alignModels() {
        try {
            this.updateWorldMatrix(true, true);
            
            if (!this.highDetailModel || !this.lowDetailModelGroup) {
                return;
            }

            const highBox = new THREE.Box3().setFromObject(this.highDetailModel);
            const lowBox = new THREE.Box3().setFromObject(this.lowDetailModelGroup);
            
            if (highBox.isEmpty()) {
                return;
            }

            const highCenterWorld = new THREE.Vector3();
            const highCenterLocal = this.worldToLocal(highBox.getCenter(highCenterWorld).clone());

            this.lowDetailModelGroup.position.set(0, 0, 0); 
            this.lowDetailModelGroup.quaternion.set(0, 0, 0, 1);
            this.lowDetailModelGroup.scale.set(1, 1, 1);
            this.lowDetailModelGroup.updateWorldMatrix(true, true); 

            const lowCenterWorld = new THREE.Vector3();
            const lowCenterLocal = this.worldToLocal(lowBox.getCenter(lowCenterWorld).clone());

            const localOffset = new THREE.Vector3().subVectors(highCenterLocal, lowCenterLocal);

            this.lowDetailModelGroup.position.copy(localOffset);
        } catch (e) {
            console.warn('MySubmarineLOD: failed to align LODs', e);
        }
    }

    initControls() {
        if (!this.controls) {
            this.controls = new SubmarineControls(this);
            this.controlsEnabled = true;
        }
    }

    updateSubmarine(dt) {
        if (!dt || dt <= 0 || typeof dt !== 'number') return;

        if (this.controls && this.controlsEnabled) {
            this.controls.update(dt);
        }

        if (this.highDetailModel && typeof this.highDetailModel.update === 'function') {
            this.highDetailModel.update(dt);
        }
    }

    setControlsEnabled(enabled) {
        this.controlsEnabled = !!enabled;
        if (!this.controlsEnabled && this.controls) {
            this.controls._keys = { w: false, s: false, a: false, d: false, p: false, l: false };
        }
    }

    dispose() {
        if (this.controls) {
            this.controls.dispose();
        }
        
        if (this.highDetailModel && typeof this.highDetailModel.dispose === 'function') {
            this.highDetailModel.dispose();
        }
    }
}

export { MySubmarineLOD };