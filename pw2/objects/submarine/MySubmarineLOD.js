import * as THREE from 'three';
import { MySubmarine } from './MySubmarine.js';
import { SubmarineControls } from './SubmarineControls.js';
import { createLowDetailSubmarine } from './SubmarineGeometry.js';
import { createShieldMaterial } from '../../shaders/ShieldShader.js';
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
                self.bvh = self.highDetailModel.bvh;
                self.bvhhelper = self.highDetailModel.bvhhelper;
                self.userData.boundingSphere = self.highDetailModel.userData.boundingSphere;
                
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
        this.fpvCamera.position.set(-size * 0.4, size * 0.18, 0);
        this.fpvCamera.rotation.y = Math.PI / 2;
        this.add(this.fpvCamera);

        // Periscope camera
        this.periscopeCamera = new THREE.PerspectiveCamera(60, 1.0, 0.1, 1000);
        this.periscopeCamera.position.set(0, size * 0.6, 0);
        this.periscopeCamera.rotation.y = Math.PI / 2;
        this.add(this.periscopeCamera);

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

        // Periscope warning light (red, flashing)
        const periscopeLight = new THREE.PointLight(0xFF0000, 1500);
        periscopeLight.position.set(size * 0.2, size * 0.5, 0);
        periscopeLight.distance = 40;
        periscopeLight.decay = 5;
        periscopeLight.castShadow = true;
        this.add(periscopeLight);
        this.periscopeLight = periscopeLight;
        this.periscopeLightIntensity = 1500;
        this.periscopeLightFlashTime = 0;
        this._flashCycle = 0.6;
        this._flashOn = 0.3;

        // Shield
        this.shieldMesh = null;
        this.shieldActive = false;
        this.shieldColor = new THREE.Color(0x00FFFF);
        this.shieldSize = size * 1.5;
        this.shieldOpacity = 0.3;
        this.#createShield(size);
    }

    #buildSubmarine(highDetailParams) {
        this.highDetailModel = new MySubmarine(this.app, highDetailParams);
    }

    #createShield() {
        const shieldGeometry = new THREE.IcosahedronGeometry(this.shieldSize / 2, 16);
        const shieldMaterial = createShieldMaterial({
            color: this.shieldColor,
            opacity: this.shieldOpacity
        });

        this.shieldMesh = new THREE.Mesh(shieldGeometry, shieldMaterial);
        this.shieldMesh.visible = false;
        this.add(this.shieldMesh);
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

    initControls(colliders = []) {
        if (!this.controls) {
            this.controls = new SubmarineControls(this, colliders);
            this.controlsEnabled = true;
        }
    }

    setBubbleSystem(bubbleSystem) {
        this.bubbleSystem = bubbleSystem;
    }

    toggleShield() {
        this.shieldActive = !this.shieldActive;
        if (this.shieldMesh) {
            this.shieldMesh.visible = this.shieldActive;
        }
        return this.shieldActive;
    }

    setShieldActive(active) {
        this.shieldActive = !!active;
        if (this.shieldMesh) {
            this.shieldMesh.visible = this.shieldActive;
        }
    }

    updateSubmarine(dt) {
        if (!dt || dt <= 0 || typeof dt !== 'number') return;

        // Flash periscope light
        this.periscopeLightFlashTime += dt;
        const timeInCycle = this.periscopeLightFlashTime % this._flashCycle;
        this.periscopeLight.intensity = timeInCycle < this._flashOn ? this.periscopeLightIntensity : 0;

        if (this.controls && this.controlsEnabled) {
            this.controls.update(dt);
        }

        if (this.highDetailModel && typeof this.highDetailModel.update === 'function') {
            this.highDetailModel.update(dt);
        }

        if (this.bubbleSystem) {
            const speed = Math.abs(this.forwardSpeed);
            const verticalPush = -this.verticalSpeed * 0.8;
            
            // Check if we're only turning (A/D without W/P/L)
            if (this.turningBubbleDirection) {
                let activeEmitters = [];
                if (this.turningBubbleDirection === 'left') {
                    activeEmitters = this.emitters.filter(e => e.id === 'left');
                } else if (this.turningBubbleDirection === 'right') {
                    activeEmitters = this.emitters.filter(e => e.id === 'right');
                }
                
                activeEmitters.forEach(emitter => {
                    if (Math.random() > 0.5) {
                        let baseSize = 0.1 * this.scale.x;
                        let finalSize = baseSize * emitter.sizeMult;
                        // Submarine bubbles: more intense with higher glow and concentrated particles
                        this.bubbleSystem.spawnFromObject(this, emitter.pos, finalSize, 0, 0.7, 2500);
                    }
                });
            } else {
                this.emitters.forEach(emitter => {
                    if (speed > 0.5 || Math.abs(this.verticalSpeed) > 0.5) {
                        if (Math.random() > 0.5) { 
                            let baseSize = 0.1 * this.scale.x + (speed * 0.015);
                        
                            let finalSize = baseSize * emitter.sizeMult;
                            // Submarine bubbles: more intense glow and concentrated particles
                            this.bubbleSystem.spawnFromObject(this, emitter.pos, finalSize, verticalPush, 0.8, 2500);                    
                        }
                    }
                });
            }
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