import * as THREE from 'three';

// Cache texture for performance
let sharedRockTexture = null;

class MyRock extends THREE.Object3D {
    constructor(app, size = 1, randomFunc = Math.random) {
        super();
        this.app = app;
        this.size = size;
        this.random = randomFunc;
        
        // Generate a random seed for this specific rock so it looks unique
        this.seed = this.random() * 100; 
        
        this.buildRock();
    }

    buildRock() {
        // --- 1. GEOMETRY: Icosahedron (The best low-poly rock base) ---
        // detail = 0 is very blocky (low poly), detail = 1 is smoother.
        // We use a high detail (1 or 2) initially to get enough vertices to distort,
        // but we will look "low poly" thanks to flatShading later.
        const detail = 1; 
        const geometry = new THREE.IcosahedronGeometry(this.size, detail);

        // --- 2. SHAPE SCULPTING (The "No-Crack" Method) ---
        const positionAttribute = geometry.attributes.position;
        const vertex = new THREE.Vector3();
        
        // We capture the original position to calculate noise
        const original = new THREE.Vector3();

        for (let i = 0; i < positionAttribute.count; i++) {
            vertex.fromBufferAttribute(positionAttribute, i);
            original.copy(vertex);

            // MAGIC FIX: Calculate noise based on the X, Y, Z coordinates.
            // Vertices at the same spot will ALWAYS get the same 'distortion' value.
            // This prevents the mesh from tearing apart.
            const noise = this.getSmoothNoise(original.x, original.y, original.z);
            
            // Apply distortion:
            // We push the vertex out/in based on the noise.
            // 0.4 is the intensity of the jaggedness.
            const scaleFactor = 1.0 + noise * 0.4;
            
            vertex.multiplyScalar(scaleFactor);

            // Update the vertex
            positionAttribute.setXYZ(i, vertex.x, vertex.y, vertex.z);
        }

        // Recalculate normals so lighting works on the new shape
        geometry.computeVertexNormals();

        // --- 3. TEXTURE & MATERIAL ---
        if (!sharedRockTexture) {
            sharedRockTexture = new THREE.TextureLoader().load('textures/im-the-rock.jpg');
            sharedRockTexture.wrapS = THREE.RepeatWrapping;
            sharedRockTexture.wrapT = THREE.RepeatWrapping;
        }

        const texture = sharedRockTexture.clone();
        
        // Randomize texture to avoid repetition
        texture.offset.set(this.random(), this.random());
        texture.repeat.set(2, 2); // Make the texture denser
        texture.rotation = this.random() * Math.PI;

        const rockMaterial = new THREE.MeshStandardMaterial({
            color: "#888888",
            map: texture,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true, // Gives the sharp, rock-like facets
            side: THREE.DoubleSide // Final safety net against holes
        });

        const rockMesh = new THREE.Mesh(geometry, rockMaterial);

        // --- 4. GLOBAL DEFORMATION ---
        // Stretch the whole rock randomly (e.g. make it flat or long)
        rockMesh.scale.set(
            1.0 + (this.random() * 0.4), 
            0.6 + (this.random() * 0.4), // Often flatter on Y
            1.0 + (this.random() * 0.4)
        );

        // Random Rotation
        rockMesh.rotation.set(
            this.random() * Math.PI,
            this.random() * Math.PI,
            this.random() * Math.PI
        );

        rockMesh.castShadow = true;
        rockMesh.receiveShadow = true;

        this.add(rockMesh);
    }

    // A simple pseudo-random noise function
    // Returns a smooth value between -0.5 and 0.5 based on position
    getSmoothNoise(x, y, z) {
        // Add the rock's unique seed so every rock looks different
        const s = this.seed;
        
        // Combine Sine waves at different frequencies to create "lumps"
        // This math ensures that any vertex at position (x,y,z) gets the exact same result.
        const val = Math.sin(x * 1.5 + s) * Math.cos(y * 1.5 + s) * Math.sin(z * 1.5 + s) +
                    Math.sin(x * 3.0 + s) * Math.cos(y * 3.0 + s) * 0.5;
        
        return val * 0.5; // Scale down result
    }
}

export { MyRock };