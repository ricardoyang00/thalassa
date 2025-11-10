import * as THREE from 'three';
import { TubeCoral } from '../corals/TubeCoral.js';
import { BrainCoral } from '../corals/BrainCoral.js';
import { LSystemCoral } from '../corals/LSystemCoral.js';

class MyTerrain extends THREE.Object3D {
    #width;
    #length;
    #canvas;

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
            this.#canvas = undefined;
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
            this.#canvas.getContext('2d').drawImage(image, 0, 0);;
        }
        const ctx = this.#canvas.getContext('2d');

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