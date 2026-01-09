import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

class MyShark extends THREE.Object3D {
    constructor(app, {
        size = 1,
        assetsPath = 'models/shark/',
        gltfFile = 'scene.gltf',
        onLoad = null
    } = {}) {
        super();
        this.app = app;
        this.size = size;
        this.assetsPath = assetsPath;
        this.gltfFile = gltfFile;
        this._loaded = false;
        this.mixer = null;
        this.loadModel(onLoad);
    }

    loadModel(onLoad = null) {
        const loader = new GLTFLoader();
        loader.setPath(this.assetsPath);
        loader.load(this.gltfFile,
            (gltf) => {
                // The loaded scene is the top-level object
                const object = gltf.scene; 
                object.name = 'MyShark';

                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                    }
                });

                this.add(object);
                this.scale.set(this.size * 0.01, this.size * 0.01, this.size * 0.01);
                
                if (gltf.animations && gltf.animations.length) {
                    this.mixer = new THREE.AnimationMixer(object); 
                    const clip = gltf.animations[0]; 
                    const action = this.mixer.clipAction(clip); 
                    action.play(); 
                    action.timeScale = 1;
                }

                this._loaded = true;
                
                // Call the 'onLoad' callback, passing this MyShark instance so MySharkLOD knows it's ready.
                if (typeof onLoad === 'function') {
                    onLoad(this); 
                }
            },
            // onProgress callback
            undefined, 
            // onError callback
            (err) => {
                console.error('Error loading GLTF:', err);
            }
        );
    }

    isLoaded() {
        return this._loaded;
    }

    update(deltaTime) {
        if (this.mixer) {
            this.mixer.update(deltaTime);
        }
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

export { MyShark };