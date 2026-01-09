import * as THREE from 'three';

class MyTerrain extends THREE.Object3D {
    #width;
    #length;
    #canvas;
    #canvasCtx;

    constructor(contents, size = 100, autoLoadDisplacement = false, onLoad = () => {}) {
        super();
        this.#width = size;
        this.#length = size;
        if (autoLoadDisplacement)
            this.loadDisplacement(onLoad);
        this.displacementScale = 5; // displacement calculated manually to allow coiso e tal
        this.buildTerrain();
    }

    loadDisplacement(onLoad = () => {}) {
        if (!this.displacementMap) {
            const terrainMap = new THREE.TextureLoader().load('images/heightmap.jpg', () => {
                this.displacementMap = terrainMap.image;
                const geo = this.children[0].geometry;
                const posArr = geo.attributes.position.array;
                for (let i = 0; i < posArr.length; i+=3) {
                    posArr[i+2] += this.displacementAtXY(posArr[i], -posArr[i+1]);
                }
                geo.attributes.position.needsUpdate = true;
                onLoad();
            });
            terrainMap.wrapS = terrainMap.wrapT = THREE.RepeatWrapping;
            terrainMap.repeat.set(1, 1);
        }
    }

    buildTerrain() {
        const terrainGeometry = new THREE.PlaneGeometry(this.#width, this.#length, 64, 64);

        const texture = new THREE.TextureLoader().load('textures/sand.jpg');
        texture.wrapT = texture.wrapS = THREE.RepeatWrapping;
        texture.repeat.set(40, 40);

        const terrainMaterial = new THREE.MeshPhongMaterial({ 
            color: "#8B7355",
            map: texture,
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
        const image = this.displacementMap;
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
        // assuming map is grayscaled
        return this.displacementScale * Math.max(pixel[0]) / 255;
    }

    toggleWireframe(wireframe) {
        this.terrainMesh.material.wireframe = wireframe;
    }
}

export { MyTerrain };