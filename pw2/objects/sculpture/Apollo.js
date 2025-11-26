import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createMossMaterial } from '../../shaders/MossShader.js';

class Apollo extends THREE.Object3D {
    constructor(app, {
        size = 12,
        assetsPath = 'models/apollo/',
        gltfFile = 'scene.gltf',
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
        const textureLoader = new THREE.TextureLoader();
        const url = (this.assetsPath.endsWith('/') ? this.assetsPath : this.assetsPath + '/') + this.gltfFile;
        
        console.log('Loading model from:', url);
        
        // Load the limestone texture
        textureLoader.load('textures/limestone.jpg', (limestoneTexture) => {
            limestoneTexture.wrapS = THREE.RepeatWrapping;
            limestoneTexture.wrapT = THREE.RepeatWrapping;
            limestoneTexture.repeat.set(1, 1); // Increase from 10 to 50
            limestoneTexture.needsUpdate = true;
            loader.load(url, (gltf) => {
                console.log('Model loaded successfully:', gltf);
                console.log('Scene children:', gltf.scene.children);
                
                const bbox = new THREE.Box3().setFromObject(gltf.scene);
                console.log('Scene bounds min:', bbox.min);
                console.log('Scene bounds max:', bbox.max);
                console.log('Scene bounds size:', bbox.getSize(new THREE.Vector3()));
                
                const limestoneMaterial = createMossMaterial(
                    limestoneTexture, 
                    new THREE.Color("#557e4e"),
                    { scale: 0.15 }
                );
                
                gltf.scene.traverse((child) => {
                    if (child.isMesh) {
                        console.log('Mesh found:', child.name);
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = limestoneMaterial;
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

export { Apollo };