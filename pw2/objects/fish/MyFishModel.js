import * as THREE from 'three';
import { FishGeometry } from './FishGeometry.js';

class MyFishModel extends THREE.Group {
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
        this.finSize = 0.8;

        this.#buildFish();

        this.scale.setScalar(this.scaleFactor);
    }

    #buildFish() {
        // Create body mesh using shared geometry
        const completeFishGeometry = FishGeometry.createBodyGeometry();
        const highDetailMaterial = FishGeometry.getSharedMaterial(this.color, this.texturePath);
        
        const bodyMeshHigh = new THREE.Mesh(completeFishGeometry, highDetailMaterial);
        this.add(bodyMeshHigh);
        
        // Create fins using shared geometry
        const finGeom = FishGeometry.createFinGeometry(this.finSize);
        const finMaterial = (highDetailMaterial && highDetailMaterial.clone) ? highDetailMaterial.clone() : new THREE.MeshPhongMaterial({ color: this.color });
        finMaterial.side = THREE.DoubleSide;

        // dorsal fin (top)
        const dorsalFin = new THREE.Mesh(finGeom, finMaterial);
        dorsalFin.position.set(-0.5, 0.7, 0);
        dorsalFin.rotateY(Math.PI);
        dorsalFin.rotateZ(-Math.PI / 6);
        this.add(dorsalFin);

        // belly fin (left)
        const bellyFinLeft = new THREE.Mesh(finGeom, finMaterial);
        bellyFinLeft.position.set(-1.2, -1, 0.6);
        bellyFinLeft.rotateX(-Math.PI / 6);
        this.add(bellyFinLeft);

        // belly fin (right)
        const bellyFinRight = new THREE.Mesh(finGeom, finMaterial);
        bellyFinRight.position.set(-1.2, -1, -0.6);
        bellyFinRight.rotateX(Math.PI / 6);
        this.add(bellyFinRight);
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
        this.scale.setScalar(s);
    }
}

export { MyFishModel };
