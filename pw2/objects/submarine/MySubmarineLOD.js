import * as THREE from 'three';
import { MySubmarine } from './MySubmarine.js';
import { SubmarineControls } from './SubmarineControls.js';
import { createLowDetailSubmarine } from './SubmarineGeometry.js';
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
        this.minY = 7;
        this.maxY = 30;
        this.forwardAccel = 4;
        this.verticalAccel = 2;
        this.yawRate = Math.PI;
        this.controlsEnabled = false;

        this.bubbleSystem = null;
        this.emitters = [
            { pos: new THREE.Vector3(1.1 * size, 0, 0), sizeMult: 0.8, id: 'main' },      // Main Engine
            { pos: new THREE.Vector3(0.8 * size, -0.3 * size, 0.75 * size), sizeMult: 0.6, id: 'left' }, // Left Thruster
            { pos: new THREE.Vector3(0.8 * size, -0.3 * size, -0.75 * size), sizeMult: 0.6, id: 'right'} // Right Thruster
        ];

        const lowDetailGroup = createLowDetailSubmarine();
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

        // Front spotlight
        const frontLight = new THREE.SpotLight(0xFFD700, 2000);
        frontLight.position.set(-size * 0.4, -size * 0.2, 0);
        frontLight.target.position.set(-size * 2.0, -size * 1.5, 0);
        frontLight.angle = Math.PI / 6;
        frontLight.penumbra = 0.3;
        frontLight.decay = 2.5;
        frontLight.distance = 80;
        frontLight.castShadow = true;
        this.add(frontLight);
        this.add(frontLight.target);
        this.frontLight = frontLight;
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

    setBubbleSystem(bubbleSystem) {
        this.bubbleSystem = bubbleSystem;
    }

    updateSubmarine(dt) {
        if (!dt || dt <= 0 || typeof dt !== 'number') return;

        if (this.controls && this.controlsEnabled) {
            this.controls.update(dt);
        }

        if (this.highDetailModel && typeof this.highDetailModel.update === 'function') {
            this.highDetailModel.update(dt);
        }

        if (this.bubbleSystem) {
            const speed = Math.abs(this.forwardSpeed);
            const verticalPush = -this.verticalSpeed * 0.8;
            this.emitters.forEach(emitter => {
                // Uncomment to show debug helper
                //this.bubbleSystem.updateSpawnHelper(this, emitter.pos, emitter.id);

                if (speed > 0.5 || Math.abs(this.verticalSpeed) > 0.5) {
                    if (Math.random() > 0.7) { 
                        let baseSize = 0.07 * this.scale.x + (speed * 0.01);
                    
                        // Apply specific emitter multiplier (Main engine = bigger bubbles)
                        let finalSize = baseSize * emitter.sizeMult; 
                        
                        this.bubbleSystem.spawnFromObject(this, emitter.pos, finalSize, verticalPush);                    
                    }
                }
            });
        }
    }

    setControlsEnabled(enabled) {
        this.controlsEnabled = !!enabled;
        if (!this.controlsEnabled && this.controls) {
            this.controls._keys = { w: false, s: false, a: false, d: false, p: false, l: false, o: false};
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