import * as THREE from 'three';

/**
 * MyFish
 * Defines a 3D fish model made from BufferGeometry.
 * The fish size and color/texture can vary through parameters.
 */
class MyFish extends THREE.Object3D {
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

        this.buildFish();

        this.scale.setScalar(this.scaleFactor);
    }

    buildFish() {
        const vertices = new Float32Array([
            0, 0, -0.5, // 0 right front
            0, 1, 0,    // 1 top
            0, 0, 0.5,  // 2 left front
            0, -1, 0,   // 3 bottom
            1, 0, 0,    // 4 middle
            
            -4, 0, 0,   // 5 tail root
            -5, 1.25, 0,   // 6 tail top tip
            -4.5, 0, 0,   // 7 tail mid tip
            -5, -1.25, 0   // 8 tail bottom tip
        ]);

        const indices = [
            // head
            0, 1, 4,
            4, 1, 2,
            2, 3, 4,
            4, 3, 0,

            // body
            0, 5, 1,
            1, 5, 2,
            2, 5, 3,
            3, 5, 0,

            // tail
            5, 7, 6,
            5, 6, 7,
            5, 8, 7,
            5, 7, 8
        ];

        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        let material;
        if (this.texturePath) {
            const tex = new THREE.TextureLoader().load(this.texturePath);
            tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
            material = new THREE.MeshPhongMaterial({ map: tex });
        } else {
            material = new THREE.MeshPhongMaterial({ color: this.color });
        }

        const bodyMesh = new THREE.Mesh(geometry, material);
        this.add(bodyMesh);

        this.addFins(material);
    }

    addFins(material) {
        const finGeom = new THREE.BufferGeometry();

        const vertices = new Float32Array([
            0, 0, 0,
            0.8, 0, 0,
            0.8, 0.8, 0
        ]);

        finGeom.setIndex([0, 1, 2]);
        finGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        finGeom.computeVertexNormals();

        const finMaterial = (material && material.clone) ? material.clone() : new THREE.MeshPhongMaterial({ color: this.color });
        finMaterial.side = THREE.DoubleSide;

        // dorsal fin (top)
        const dorsalFin = new THREE.Mesh(finGeom, finMaterial);
        dorsalFin.position.set(-0.5, 0.8, 0);
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

        // keep references for animation later
        this.dorsalFin = dorsalFin;
        this.bellyFinLeft = bellyFinLeft;
        this.bellyFinRight = bellyFinRight;
    }
}

export { MyFish };
