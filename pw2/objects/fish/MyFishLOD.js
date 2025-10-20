import * as THREE from 'three';
import { MyFishModel } from './MyFishModel.js';
import { FishGeometry } from './FishGeometry.js';

/**
 * Fish with LOD (Level of Detail) implementation
 */
class MyFishLOD extends THREE.LOD {
    /**
     * @param {Object} params - configuration for the fish geometry
     * @param {number} params.scale - overall scale of the fish
     * @param {THREE.Color | number | string} params.color - fish color
     * @param {string} params.texturePath - texture image path
     */
    constructor({
        scale = 1,
        color = 0xff9933,
        texturePath = null
    } = {}) {
        super();
        this.scaleFactor = scale;
        this.color = color;
        this.texturePath = texturePath;

        this.#buildFish();

        this.scale.setScalar(this.scaleFactor);
    }

    #buildFish() {
        // high detail - use MyFishModel directly
        const highDetailGroup = new MyFishModel({
            scale: 1,
            color: this.color,
            texturePath: this.texturePath
        });

        // medium detail - body only, no texture, no fins
        const completeFishGeometry = FishGeometry.createBodyGeometry();
        const lowDetailMaterial = FishGeometry.getSharedMaterial(this.color);

        const mediumDetailGroup = new THREE.Group();
        const bodyMeshMedium = new THREE.Mesh(completeFishGeometry, lowDetailMaterial);
        mediumDetailGroup.add(bodyMeshMedium);

        // low detail - simple triangle
        const simpleFishGeometry = FishGeometry.createSimpleGeometry();

        const lowDetailGroup = new THREE.Group();
        const bodyMeshLow = new THREE.Mesh(simpleFishGeometry, lowDetailMaterial);
        lowDetailGroup.add(bodyMeshLow);
        
        // LODs
        this.addLevel(highDetailGroup, 0);
        this.addLevel(mediumDetailGroup, 150);
        this.addLevel(lowDetailGroup, 200);
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
        this.scale.setScalar(s);
    }
}

export { MyFishLOD };
