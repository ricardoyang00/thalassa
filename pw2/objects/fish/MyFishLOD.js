import * as THREE from 'three';
import { MyFishModel } from './MyFishModel.js';
import { FishGeometry } from './FishGeometry.js';

class MyFishLOD extends THREE.LOD {
    /**
     * @param {Object} params - configuration for the fish geometry
     * @param {number} params.scale - overall scale of the fish
     * @param {THREE.Color | number | string} params.color - fish color
     * @param {string} params.texturePath - texture image path
     * @param {number} params.numBones - number of bones in the skeleton (2-4 recommended)
     * @param {boolean} params.showBones - whether to show bone helpers
     */
    constructor({
        scale = 0.3,
        color = 0xff9933,
        texturePath = null,
        numBones = 5,
    } = {}) {
        super();
        this.scaleFactor = scale;
        this.color = color;
        this.texturePath = texturePath;
        this.numBones = numBones;

        this.highDetailModel = null;

        this.#buildFish();

        this.scale.setScalar(this.scaleFactor);
    }

    #buildFish() {
        // high detail - use MyFishModel directly
        this.highDetailModel = new MyFishModel({
            scale: 1,
            color: this.color,
            texturePath: this.texturePath,
            numBones: this.numBones
        });

        // medium detail - body only, no texture, no fins
        const completeFishGeometry = FishGeometry.geometry[1];
        const lowDetailMaterial = FishGeometry.getSharedMaterial(this.color);

        const mediumDetailGroup = new THREE.Group();
        const bodyMeshMedium = new THREE.Mesh(completeFishGeometry, lowDetailMaterial);
        mediumDetailGroup.add(bodyMeshMedium);

        // low detail - simple triangle
        const simpleFishGeometry = FishGeometry.geometry[2];

        const lowDetailGroup = new THREE.Group();
        const bodyMeshLow = new THREE.Mesh(simpleFishGeometry, lowDetailMaterial);
        lowDetailGroup.add(bodyMeshLow);
        
        // LODs
        this.addLevel(this.highDetailModel, 0);
        this.addLevel(mediumDetailGroup, 150);
        this.addLevel(lowDetailGroup, 200);
    }

    /**
     * Animate the fish (forwards to high detail model)
     * @param {number} dt - Delta time.
     * @param {number} speedFactor - Current speed factor (0.0 to 1.0).
     */
    animate(dt, speedFactor) {
        if (this.highDetailModel && this.highDetailModel.animate) {
            this.highDetailModel.animate(dt, speedFactor);
        }
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
        this.scale.setScalar(s);
    }
}

export { MyFishLOD };