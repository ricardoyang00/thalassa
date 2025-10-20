import * as THREE from 'three';

class MyFish extends THREE.LOD {
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
        const vertices = new Float32Array([
            -0.2, 0, -0.5, // 0 right front
            0, 0.8, 0,    // 1 top
            -0.2, 0, 0.5,  // 2 left front
            0, -0.8, 0,   // 3 bottom
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

        const completeFishGeometry = new THREE.BufferGeometry();
        completeFishGeometry.setIndex(indices);
        completeFishGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        const minX = -5, maxX = 1, minY = -1, maxY = 1;
        const lenX = maxX - minX, lenY = maxY - minY;
        const uvArray = new Float32Array((vertices.length / 3) * 2);
        for (let i = 0, j = 0; i < vertices.length; i += 3, j += 2) {
            const x = vertices[i], y = vertices[i + 1];
            let u = (x - minX) / lenX;
            let v = (y - minY) / lenY;
            u = Math.max(0, Math.min(1, u));
            v = Math.max(0, Math.min(1, v));
            uvArray[j] = u;
            uvArray[j + 1] = v;
        }
        completeFishGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
        completeFishGeometry.computeVertexNormals();


        // --- Fin geometry ---
        




        // high detail (original)
        const highDetailMaterial = MyFish.#getSharedMaterial(this.color, this.texturePath);
        
        const highDetailGroup = new THREE.Group();
        const bodyMeshHigh = new THREE.Mesh(completeFishGeometry, highDetailMaterial);
        highDetailGroup.add(bodyMeshHigh);
        
        const finGeom = new THREE.BufferGeometry();
        const vertices3 = new Float32Array([0, 0, 0, this.finSize, 0, 0, this.finSize, this.finSize, 0]);
        finGeom.setIndex([0, 1, 2]);
        finGeom.setAttribute('position', new THREE.Float32BufferAttribute(vertices3, 3));
        finGeom.computeVertexNormals();
        
        const finMaterial = (highDetailMaterial && highDetailMaterial.clone) ? highDetailMaterial.clone() : new THREE.MeshPhongMaterial({ color: this.color });
        finMaterial.side = THREE.DoubleSide;

        // dorsal fin (top)
        const dorsalFin = new THREE.Mesh(finGeom, finMaterial);
        dorsalFin.position.set(-0.5, 0.7, 0);
        dorsalFin.rotateY(Math.PI);
        dorsalFin.rotateZ(-Math.PI / 6);
        highDetailGroup.add(dorsalFin);

        // belly fin (left)
        const bellyFinLeft = new THREE.Mesh(finGeom, finMaterial);
        bellyFinLeft.position.set(-1.2, -1, 0.6);
        bellyFinLeft.rotateX(-Math.PI / 6);
        highDetailGroup.add(bellyFinLeft);

        // belly fin (right)
        const bellyFinRight = new THREE.Mesh(finGeom, finMaterial);
        bellyFinRight.position.set(-1.2, -1, -0.6);
        bellyFinRight.rotateX(Math.PI / 6);
        highDetailGroup.add(bellyFinRight);



        // medium detail
        // no texture no fins
        const lowDetailMaterial = MyFish.#getSharedMaterial(this.color);

        const mediumDetailGroup = new THREE.Group();
        const bodyMeshMedium = new THREE.Mesh(completeFishGeometry, lowDetailMaterial);
        mediumDetailGroup.add(bodyMeshMedium);



        // low detail
        // --- Low-detail body geometry ---
        const simpleFishGeometry = new THREE.BufferGeometry();
        const vertices2 = new Float32Array([
            -4, 0, 0, 
            1, 1, 0, 
            1, -1, 0
        ]);
        simpleFishGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices2, 3));
        simpleFishGeometry.setIndex([
            0, 1, 2
        ]);
        simpleFishGeometry.computeVertexNormals();

        const lowDetailGroup = new THREE.Group();
        const bodyMeshLow = new THREE.Mesh(MyFish._lowDetailGeometry, lowDetailMaterial);
        lowDetailGroup.add(bodyMeshLow);
        

        // LODs
        this.addLevel(highDetailGroup, 0);
        this.addLevel(mediumDetailGroup, 150);
        this.addLevel(lowDetailGroup, 200);
    }

    /**
     * Retrieves a cached material or creates a new one.
     * @param {THREE.Color | number | string} color
     * @param {string | null} texturePath
     * @returns {THREE.Material}
     * @private
     */
    static #getSharedMaterial(color, texturePath = null) {
        const matKey = texturePath ? `tex:${texturePath}|col:${String(color)}` : `col:${String(color)}`;
        
        MyFish._sharedMaterials = MyFish._sharedMaterials || new Map();
        MyFish._textureLoader = MyFish._textureLoader || new THREE.TextureLoader();
        MyFish._textureCache = MyFish._textureCache || new Map();

        let material = MyFish._sharedMaterials.get(matKey);
        if (!material) {
            if (texturePath) {
                let tex = MyFish._textureCache.get(texturePath);
                if (!tex) {
                    tex = MyFish._textureLoader.load(texturePath);
                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                    MyFish._textureCache.set(texturePath, tex);
                }
                material = new THREE.MeshPhongMaterial({ map: tex, color: color });
            } else {
                material = new THREE.MeshPhongMaterial({ color: color });
            }
            MyFish._sharedMaterials.set(matKey, material);
        }
        return material;
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
        this.scale.setScalar(s);
    }
}

export { MyFish };