import * as THREE from 'three';
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';

class MyShark extends THREE.Object3D {
    constructor(app, {
        size = 1,
        assetsPath = 'models/shark/',
        mtlFile = 'Shark_1.mtl',
        objFile = 'Shark_1.obj',
        onLoad = null
    } = {}) {
        super();
        this.app = app;
        this.size = size;
        this.assetsPath = assetsPath;
        this.mtlFile = mtlFile;
        this.objFile = objFile;
        this._loaded = false;

        this.loadModel(onLoad);
    }

    loadModel(onLoad = null) {
        // manager lets us transform requested URLs (e.g. encode spaces and strip quotes)
        const manager = new THREE.LoadingManager();
        manager.setURLModifier((url) => {
            // decode percent-encoding so we can remove any literal quotes reliably
            let decoded;
            try {
                decoded = decodeURIComponent(url);
            } catch (e) {
                // fallback: replace encoded quotes then continue
                decoded = url.replace(/%22/g, '"');
            }

            // remove any surrounding quotes (either literal or percent-encoded) and trim
            decoded = decoded.replace(/%22/g, '"').replace(/^"(.*)"$/, '$1').replace(/^'(.*)'$/, '$1').trim();

            // re-encode for the network request (encodeURI preserves path separators)
            try {
                return encodeURI(decoded);
            } catch (e) {
                return decoded.replace(/ /g, '%20');
            }
        });

        const mtlLoader = new MTLLoader(manager);
        // Fetch the .mtl as text, fix paths with spaces, and then parse.
        const mtlUrl = (this.assetsPath.endsWith('/') ? this.assetsPath : this.assetsPath + '/') + this.mtlFile;
        fetch(encodeURI(mtlUrl))
            .then((res) => {
                if (!res.ok) throw new Error(`Failed to fetch MTL: ${res.statusText}`);
                return res.text();
            })
            .then((text) => {
                // Find texture lines and percent-encode spaces in their filenames
                const fixed = text.replace(/^( *(map_[A-Za-z0-9_]+|bump|norm|disp|map_Ka|map_Kd|map_Ks|map_Pr|map_Bump)\s+)(.+)$/gmi,
                    (m, pre, token, rest) => {
                        const trimmed = rest.trim();
                        if (trimmed.length === 0) return m;
                        // already quoted?
                        if (/^["'].*["']$/.test(trimmed)) return pre + trimmed;
                        // percent-encode spaces directly
                        if (/\s/.test(trimmed)) return pre + trimmed.replace(/ /g, '%20');
                        return pre + trimmed;
                    });

                const materialsCreator = mtlLoader.parse(fixed, this.assetsPath);
                materialsCreator.preload();

                // When all textures finish loading, ensure correct sRGB encoding.
                manager.onLoad = () => {
                    try {
                        for (const name in materialsCreator.materials) {
                            const m = materialsCreator.materials[name];
                            if (!m) continue;

                            // base color (map) should be sRGB
                            if (m.map) {
                                m.map.encoding = THREE.sRGBEncoding;
                                m.map.needsUpdate = true;
                            }
                            // normal/roughness/metalness should remain linear (no sRGB)
                            if (m.normalMap) m.normalMap.needsUpdate = true;
                            if (m.roughnessMap) m.roughnessMap.needsUpdate = true;
                        }

                        // If some MTL materials have no base-color map, try to assign a sensible default.
                        const defaultMat = materialsCreator.materials['MATERIAL_DEFAULTMAT'];
                        if (defaultMat && defaultMat.map) {
                            for (const name in materialsCreator.materials) {
                                const m = materialsCreator.materials[name];
                                if (!m) continue;
                                if (!m.map) {
                                    m.map = defaultMat.map;
                                    m.map.encoding = THREE.sRGBEncoding;
                                    m.needsUpdate = true;
                                }
                            }
                        }

                        // Set correct renderer output encoding
                        if (this.app && this.app.renderer) {
                            try {
                                this.app.renderer.outputEncoding = THREE.sRGBEncoding;
                            } catch (e) {
                                // ignore
                            }
                        }
                    } catch (e) {
                        console.warn('MyShark: error in manager.onLoad handler', e);
                    }
                };

                const objLoader = new OBJLoader(manager);
                objLoader.setMaterials(materialsCreator);
                objLoader.setPath(this.assetsPath);

                objLoader.load(this.objFile,
                    (object) => {
                        object.name = 'MyShark';

                        // traverse meshes: set shadows and apply material fallbacks
                        object.traverse((child) => {
                            if (!child.isMesh) return;

                            child.castShadow = true;
                            child.receiveShadow = true;

                            const mats = Array.isArray(child.material) ? child.material : [child.material];

                            mats.forEach((mat) => {
                                try {
                                    // fallback: if mesh material lacks a map, try to find it
                                    if ((!mat || !mat.map) && materialsCreator && materialsCreator.materials) {
                                        const matName = mat && mat.name ? mat.name : '(no-name)';
                                        const from = materialsCreator.materials[matName];
                                        if (from && from.map) {
                                            mat.map = from.map;
                                            if (mat.map) mat.map.encoding = THREE.sRGBEncoding;
                                            mat.needsUpdate = true;
                                        }
                                    }
                                } catch (e) {
                                    console.warn('MyShark: error inspecting material', e);
                                }
                            });
                        });

                        object.scale.set(this.size, this.size, this.size);
                        object.rotation.y = Math.PI;
                        this.add(object);

                        // --- DEBUG BLOCK REMOVED ---

                        this._loaded = true;
                        if (typeof onLoad === 'function') onLoad(object);
                    },
                    undefined,
                    (err) => {
                        console.error('Error loading OBJ:', err);
                    }
                );
            })
            .catch((err) => {
                console.error('Error fetching/parsing MTL:', err);
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

export { MyShark };