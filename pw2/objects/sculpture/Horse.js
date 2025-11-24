import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

class Horse extends THREE.Object3D {
    constructor(app, {
        size = 1,
        assetsPath = 'models/horse/',
        objFile = 'horse2.obj',
        onLoad = null
    } = {}) {
        super();
        this.app = app;
        this.size = size;
        this.assetsPath = assetsPath;
        this.objFile = objFile;
        this._loaded = false;

        this.loadModel(onLoad);
    }

    loadModel(onLoad = null) {
        const objLoader = new OBJLoader();
        const textureLoader = new THREE.TextureLoader();
        const baseUrl = (this.assetsPath.endsWith('/') ? this.assetsPath : this.assetsPath + '/');
        
        console.log('Loading model from:', baseUrl + this.objFile);
        
        // Load limestone texture
        textureLoader.load('textures/limestone.jpg', (limestoneTexture) => {
            limestoneTexture.wrapS = THREE.RepeatWrapping;
            limestoneTexture.wrapT = THREE.RepeatWrapping;
            const repeatFactor = 5;
            limestoneTexture.repeat.set(repeatFactor, repeatFactor);
            
            // Create limestone material
            const limestoneMaterial = new THREE.MeshPhongMaterial({
                color: "#f9f6e3",
                specular: 0x111111,
                shininess: 10,
                map: limestoneTexture,
            });
            
            objLoader.load(baseUrl + this.objFile, (object) => {
                console.log('Model loaded successfully:', object);
                
                object.traverse((child) => {
                    if (child.isMesh) {
                        child.castShadow = true;
                        child.receiveShadow = true;
                        child.material = limestoneMaterial.clone();
                    }
                });

                this.add(object);
                this.scale.set(this.size, this.size, this.size);
                
                this._loaded = true;
                if (typeof onLoad === 'function') onLoad(object);
            },
            (progress) => {
                console.log('Loading progress:', (progress.loaded / progress.total * 100).toFixed(2) + '%');
            },
            (err) => {
                console.error('Error loading OBJ:', err);
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

export { Horse };