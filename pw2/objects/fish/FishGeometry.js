import * as THREE from 'three';

/**
 * Shared fish geometry builder
 */
class FishGeometry {
    /**
     * Creates the complete fish body geometry
     * @returns {THREE.BufferGeometry}
     */
    static createBodyGeometry() {
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

        const geometry = new THREE.BufferGeometry();
        geometry.setIndex(indices);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        
        // Calculate and set UV coordinates
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
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvArray, 2));
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * Creates a simple low-detail fish geometry
     * @returns {THREE.BufferGeometry}
     */
    static createSimpleGeometry() {
        const vertices = new Float32Array([
            -4, 0, 0, 
            1, 1, 0, 
            1, -1, 0
        ]);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setIndex([0, 1, 2]);
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * Creates fin geometry
     * @param {number} finSize
     * @returns {THREE.BufferGeometry}
     */
    static createFinGeometry(finSize = 0.8) {
        const vertices = new Float32Array([
            0, 0, 0, 
            finSize, 0, 0, 
            finSize, finSize, 0
        ]);
        
        const geometry = new THREE.BufferGeometry();
        geometry.setIndex([0, 1, 2]);
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.computeVertexNormals();

        return geometry;
    }

    /**
     * Retrieves a cached material or creates a new one.
     * @param {THREE.Color | number | string} color
     * @param {string | null} texturePath
     * @returns {THREE.Material}
     */
    static getSharedMaterial(color, texturePath = null) {
        const matKey = texturePath ? `tex:${texturePath}|col:${String(color)}` : `col:${String(color)}`;
        
        FishGeometry._sharedMaterials = FishGeometry._sharedMaterials || new Map();
        FishGeometry._textureLoader = FishGeometry._textureLoader || new THREE.TextureLoader();
        FishGeometry._textureCache = FishGeometry._textureCache || new Map();

        let material = FishGeometry._sharedMaterials.get(matKey);
        if (!material) {
            if (texturePath) {
                let tex = FishGeometry._textureCache.get(texturePath);
                if (!tex) {
                    tex = FishGeometry._textureLoader.load(texturePath);
                    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
                    FishGeometry._textureCache.set(texturePath, tex);
                }
                material = new THREE.MeshPhongMaterial({ map: tex, color: color });
            } else {
                material = new THREE.MeshPhongMaterial({ color: color });
            }
            FishGeometry._sharedMaterials.set(matKey, material);
        }
        return material;
    }
}

export { FishGeometry };
