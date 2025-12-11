import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class Chest extends THREE.Object3D {
    constructor(app, {
        size = 2,
        assetsPath = 'models/others/',
        gltfFile = 'old_treasure_chest.glb',
        onLoad = null
    } = {}) {
        super();
        this.app = app;
        this.size = size;
        this.assetsPath = assetsPath;
        this.gltfFile = gltfFile;
        this._loaded = false;

        this.loadModel(onLoad);
    }

    loadModel(onLoad = null) {
        const loader = new GLTFLoader();
        const url = (this.assetsPath.endsWith('/') ? this.assetsPath : this.assetsPath + '/') + this.gltfFile;
        
        console.log('Loading model from:', url);
        
        loader.load(url, (gltf) => {
            console.log('Model loaded successfully:', gltf);
            console.log('Scene children:', gltf.scene.children);
            
            const bbox = new THREE.Box3().setFromObject(gltf.scene);
            console.log('Scene bounds min:', bbox.min);
            console.log('Scene bounds max:', bbox.max);
            console.log('Scene bounds size:', bbox.getSize(new THREE.Vector3()));
            
            // Use the model's own materials and textures, but set shadows and handle transparency
            gltf.scene.traverse((child) => {
                if (child.isMesh) {
                    console.log('Mesh found:', child.name);
                    child.castShadow = true;
                    child.receiveShadow = true;
                    
                    // Handle potential transparency issues
                    if (child.material) {
                        if (Array.isArray(child.material)) {
                            child.material.forEach(m => {
                                if (m.transparent) {
                                    m.alphaTest = 0.1; // Adjust threshold to reduce transparency artifacts
                                }
                            });
                        } else {
                            if (child.material.transparent) {
                                child.material.alphaTest = 0.1; // Adjust threshold to reduce transparency artifacts
                            }
                        }
                    }
                }
            });

            this.add(gltf.scene);
            this.scale.set(this.size, this.size, this.size);
            
            this._loaded = true;
            if (typeof onLoad === 'function') onLoad(gltf.scene);
        },
        (progress) => {
            console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
        },
        (err) => {
            console.error('Error loading GLTF:', err);
        });
    }

    isLoaded() {
        return this._loaded;
    }

    dispose() {
        this.traverse((child) => {
            if (child.isMesh) {
                if (child.geometry) child.geometry.dispose();
                if (child.material) {
                    if (Array.isArray(child.material)) {
                        child.material.forEach(m => m.dispose());
                    } else {
                        child.material.dispose();
                    }
                }
            }
        });
    }
}

export { Chest };