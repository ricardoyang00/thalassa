import * as THREE from 'three';
import { TubeCoral } from '../corals/TubeCoral.js';
import { BrainCoral } from '../corals/BrainCoral.js';
import { LSystemCoral } from '../corals/LSystemCoral.js';

class MyTerrain extends THREE.Object3D {
    #width;
    #length;
    #canvas;
    #canvasCtx;

    constructor(contents, size = 100) {
        super();
        this.contents = contents;
        this.app = contents.app;
        this.#width = size;
        this.#length = size;
        this.buildTerrain();
    }

    buildTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(this.#width, this.#length, 64, 64);

        let terrainMap = new THREE.TextureLoader().load('images/heightmap.jpg', () => {
            const seafloorGroup = this.app.scene.getObjectByName("seafloorGroup");
            this.contents.corals.forEach((coral) => {
                const x = coral.position.x;
                const y = coral.position.z;

                coral.position.y += this.displacementAtXY(x, y);
                const rotation = this.inclinationAtXY(x, y);
                coral.rotateX(rotation[1]);
                coral.rotateZ(-rotation[0]);
            });
            TubeCoral.defaultOwner.updateInstances(() => {});
            BrainCoral.defaultOwner.updateInstances(() => {});
            LSystemCoral.defaultOwner.updateInstances(() => {});
            seafloorGroup.getObjectByName("rocks").children.forEach((rock) => rock.position.y += this.displacementAtXY(rock.position.x, rock.position.z));
            this.#canvas = this.#canvasCtx = undefined;

            let xx1 = +Infinity, xx2 = -Infinity, yy1 = +Infinity, yy2 = -Infinity, zz1 = +Infinity, zz2 = -Infinity;
            this.contents.corals.forEach(coral => {
                let x1 = +Infinity, x2 = -Infinity, y1 = +Infinity, y2 = -Infinity, z1 = +Infinity, z2 = -Infinity;
                coral._instances.forEach(obj => {
                    const box = obj.owner.bvh.nodesMap.get(obj.id).box;
                    x1 = Math.min(x1, box[0]);
                    x2 = Math.max(x2, box[1]);
                    y1 = Math.min(y1, box[2]);
                    y2 = Math.max(y2, box[3]);
                    z1 = Math.min(z1, box[4]);
                    z2 = Math.max(z2, box[5]);
                });
                xx1 = Math.min(xx1, x1);
                xx2 = Math.max(xx2, x2);
                yy1 = Math.min(yy1, y1);
                yy2 = Math.max(yy2, y2);
                zz1 = Math.min(zz1, z1);
                zz2 = Math.max(zz2, z2);

                coral.box = new THREE.Box3(
                    new THREE.Vector3(x1, y1, z1),
                    new THREE.Vector3(x2, y2, z2),
                );

                this.contents.coralsBVHHelper.add(new THREE.Box3Helper(coral.box));
            });

            const grid = [];
            const gridSize = 6;
            const dx = (xx2 - xx1) / gridSize, dz = (zz2 - zz1) / gridSize;
            for (let i = 0; i < gridSize; ++i) {
                for (let j = 0; j < gridSize; ++j) {
                    const child = {
                        box: new THREE.Box3(
                            new THREE.Vector3(xx1 + i * dx, yy1, zz1 + j * dz),
                            new THREE.Vector3(xx1 + (i+1) * dx, yy2, zz1 + (j+1) * dz),
                        ),
                    };
                    child.children = this.contents.corals
                        .filter(coral => coral.box.intersectsBox(child.box))
                        .map(coral => {return {box: coral.box, obj: coral}})

                    grid.push(child);
                    this.contents.coralsBVHHelper.add(new THREE.Box3Helper(child.box, 0x00ff00));
                }
            }

            this.contents.coralsBVH.box = new THREE.Box3(
                new THREE.Vector3(xx1, yy1, zz1),
                new THREE.Vector3(xx2, yy2, zz2),
            );
            this.contents.coralsBVH.children = grid;
            this.app.scene.add(this.contents.coralsBVHHelper);
        });

        terrainMap.wrapS = terrainMap.wrapT = THREE.RepeatWrapping;
        terrainMap.repeat.set(1, 1);

        const texture = new THREE.TextureLoader().load('textures/sand.jpg');
        texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);

        const terrainMaterial = new THREE.MeshPhongMaterial({ 
            color: "#8B7355",
            displacementMap: terrainMap,
            displacementScale: 5, 
            map: texture
        });

        const terrainMesh = new THREE.Mesh(terrainGeometry, terrainMaterial);
        this.mesh = terrainMesh;
        terrainMesh.rotation.x = -Math.PI / 2;

        this.add(terrainMesh);
        this.terrainMesh = terrainMesh;
    }

    inclinationAtXY(x, y) {
        return [
            Math.atan(x > Math.round(x)
                ? (this.displacementAtXY(x, y) - this.displacementAtXY(x + 1, y)) / 2
                : (this.displacementAtXY(x - 1, y) - this.displacementAtXY(x, y)) / 2
            ),
            Math.atan(y > Math.round(y)
                ? (this.displacementAtXY(x, y) - this.displacementAtXY(x, y + 1)) / 2
                : (this.displacementAtXY(x, y - 1) - this.displacementAtXY(x, y)) / 2
            ),
        ];
    }

    displacementAtXY(x, y) {
        const image = this.mesh.material.displacementMap.image;
        if (!this.#canvas) {
            // create a canvas so we can get pixel information
            this.#canvas = document.createElement('canvas');
            this.#canvas.width = image.width;
            this.#canvas.height = image.height;
            const ctx = this.#canvas.getContext('2d', { willReadFrequently: true }); // Add this option
            ctx.drawImage(image, 0, 0);
            this.#canvasCtx = ctx; // Store context for reuse
        }
        
        // Use stored context
        const ctx = this.#canvasCtx;
        
        const u = (this.#width / 2 + x) / this.#width;
        const v = 1 - (this.#length / 2 + y) / this.#length;
        x = u * image.width;
        y = (1 - v) * image.height;
        const pixel = ctx.getImageData(x, y, 1, 1).data;
        // displacement will depend on brightest color (usually doesn't matter because typically these maps are grayscaled)
        return this.mesh.material.displacementScale * Math.max(...pixel.slice(0, 3)) / 255;
    }

    toggleWireframe(wireframe) {
        this.terrainMesh.material.wireframe = wireframe;
    }
}

export { MyTerrain };