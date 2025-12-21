import * as THREE from 'three';
import { SUBTRACTION, Brush, Evaluator } from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.17/+esm';

class Pillar extends THREE.Object3D {
    static #groovedColumnGeometry;
    static #bumpTexture = new THREE.TextureLoader().load("textures/pillar.png");

    /**
     * Creates a Pillar, which can be in various states of disrepair.
     * @param {object} options
     * @param {string} options.state - 'perfect', 'broken'.
     */
    constructor(options = {}, material) {
        super();

        const { state = 'perfect' } = options;
        this.random = Math.random;

        this.pillarShaftHeight = 15;
        this.radius = 1;
        this.grooveCount = 32;
        this.grooveRadius = 0.0986;
        this.grooveOffset = 1.05;
        this.radialSegments = 32;
        this.materialColor = '#979797';

        this.capThickness = 0.5;
        this.capRadius = this.radius * 1.08;
        
        this.hexCapThicknessTop = 0.5;
        this.hexCapThicknessBottom = 1;
        this.hexCapRadius = this.radius * 1.5;
        this.hexCapSegments = 6;

        if (material) {
            this.material = material;
        } else {
            this.material = new THREE.MeshPhongMaterial({ 
                color: this.materialColor,
                specular: 0x111111,
                shininess: 5
            });
        }
        this.evaluator = new Evaluator();
        
        this.totalHeight = this.pillarShaftHeight + this.hexCapThicknessTop + this.capThickness;
        this.finalHeight = 0;

        switch (state) {
            case 'broken':
                this.buildBrokenPillar();
                break;
            case 'perfect':
            default:
                this.buildPerfectPillar();
                break;
        }
    }

    buildPerfectPillar() {
        const columnBrushes = this.buildGroovedColumn(this.pillarShaftHeight);

        this.add(this.buildColumnLOD(columnBrushes));
        this.add(this.buildTopCaps());
        this.add(this.buildBottomCaps());
        
        this.finalHeight = this.totalHeight;
    }

    buildBrokenPillar() {
        const brokenHeight = this.pillarShaftHeight * (0.3 + this.random() * 0.6);
        let columnBrushes = this.buildGroovedColumn(brokenHeight);

        const cutterRadius = this.radius * 2.5;
        const breakCutterGeo = this.random() > 0.5 
            ? new THREE.DodecahedronGeometry(cutterRadius, 0) 
            : new THREE.IcosahedronGeometry(cutterRadius, 0);
        const breakCutter = new Brush(breakCutterGeo);
        
        breakCutter.position.set(
            (this.random() * 2 - 1) * 0.5,
            brokenHeight,
            (this.random() * 2 - 1) * 0.5 
        );
        breakCutter.rotation.set(
            (this.random() * 2 - 1) * 0.7,
            this.random() * Math.PI,      
            (this.random() * 2 - 1) * 0.7
        );
        breakCutter.updateMatrixWorld();

        columnBrushes = columnBrushes.map((brush) => this.evaluator.evaluate(brush, breakCutter, SUBTRACTION));

        this.add(this.buildColumnLOD(columnBrushes));

        this.add(this.buildBottomCaps());
        
        this.finalHeight = brokenHeight;
    }

    buildColumnLOD(brushes) {
        const lod = new THREE.LOD();
        const highDetail = new THREE.Mesh(
            brushes[0].geometry,
            this.material,
        );

        let mediumMat = this.material.clone();
        mediumMat.onBeforeCompile = this.material.onBeforeCompile;
        
        mediumMat.bumpMap = Pillar.#bumpTexture;
        mediumMat.bumpScale = 2; 
        mediumMat.needsUpdate = true;

        const mediumDetail = new THREE.Mesh(
            brushes[1].geometry,
            mediumMat,
        );

        lod.addLevel(highDetail, 0);
        lod.addLevel(mediumDetail, 100);
        return lod;
    }

    /**
     * Subtracts a small, random, irregular shape from a brush's edge.
     * @param {Brush} targetBrush - The brush to be damaged (must be positioned).
     * @param {number} radius - The radius of the brush, for positioning the chip.
     * @param {number} height - The height of the brush, for positioning.
     * @returns {Brush} The resulting damaged brush.
     */
    chipEdge(targetBrush, radius, height) {
        return this.chipEdgeMulti([targetBrush], radius, height)[0];
    }

    /**
     * Subtracts the same small, random, irregular shape from multiple brushes' edges.
     * @param {Brush[]} targetBrushes - The brushes to be damaged (must be positioned).
     * @param {number} radius - The radius of the brush, for positioning the chip.
     * @param {number} height - The height of the brush, for positioning.
     * @returns {Brush[]} The resulting damaged brushes.
     */
    chipEdgeMulti(targetBrushes, radius, height) {
        const cutterSize = radius * (0.4 + this.random() * 0.4);
        const cutterGeo = new THREE.IcosahedronGeometry(cutterSize, 0);
        
        const heightScale = 0.5 + this.random() * 1.0;
        cutterGeo.scale(1, heightScale, 1);
        
        const cutterBrush = new Brush(cutterGeo);

        const angle = this.random() * Math.PI * 2;
        const offset = radius * (0.8 + this.random() * 0.2);

        const brushPos = targetBrushes[0].position;
        cutterBrush.position.set(
            brushPos.x + Math.cos(angle) * offset,
            brushPos.y + (this.random() - 0.5) * height,
            brushPos.z + Math.sin(angle) * offset
        );
        cutterBrush.rotation.set(
            this.random() * Math.PI,
            this.random() * Math.PI,
            this.random() * Math.PI
        );
        cutterBrush.updateMatrixWorld();

        return targetBrushes.map((brush) => this.evaluator.evaluate(brush, cutterBrush, SUBTRACTION));
    }


    buildGroovedColumn(height) {
        // only build clean geometry once to greatly speed up generation
        if (Pillar.#groovedColumnGeometry === undefined) {
            const height = 1;

            // base pillar brush (y=0)
            const baseGeo = new THREE.CylinderGeometry(this.radius, this.radius, height, this.radialSegments);
            let bruh = new Brush(baseGeo);
            bruh.position.set(0, height / 2, 0);
            bruh.updateMatrixWorld();

            // Groove cutters
            const grooveHeight = height + 2;

            for (let i = 0; i < this.grooveCount; i++) {
                const angle = (i / this.grooveCount) * Math.PI * 2;
                const gGeo = new THREE.CylinderGeometry(this.grooveRadius, this.grooveRadius, grooveHeight, 6);
                const grooveBrush = new Brush(gGeo);

                grooveBrush.position.set(
                    Math.cos(angle) * this.grooveOffset,
                    height / 2,
                    Math.sin(angle) * this.grooveOffset
                );
                grooveBrush.updateMatrixWorld();
                bruh = this.evaluator.evaluate(bruh, grooveBrush, SUBTRACTION);

                Pillar.#groovedColumnGeometry = bruh.geometry;
                Pillar.#groovedColumnGeometry.parameters = {
                    height: height,
                };
            }
        }

        let brushes = [
            // high detail
            new Brush(
                Pillar.#groovedColumnGeometry.clone()
                .scale(1, height, 1)
            ),
            // medium detail
            new Brush(new THREE.CylinderGeometry(this.radius, this.radius, height, 8).translate(0, height / 2, 0))
        ];

        const damageCount = 2 + Math.floor(this.random() * 4);
        for (let i = 0; i < damageCount; ++i)
            brushes = this.chipEdgeMulti(brushes, this.radius, height);

        return brushes;
    }

    buildTopCaps() {
        const group = new THREE.Group();
        
        // round cap
        const topCapGeo = new THREE.CylinderGeometry(this.capRadius, this.capRadius, this.capThickness, this.radialSegments);
        let topCapBrush = new Brush(topCapGeo);
        const topCapY = this.pillarShaftHeight + this.capThickness / 2;
        topCapBrush.position.set(0, topCapY, 0);
        topCapBrush.updateMatrixWorld();

        topCapBrush = this.chipEdge(topCapBrush, this.capRadius, this.capThickness);
        const topCap = new THREE.Mesh(topCapBrush.geometry, this.material);
        group.add(topCap);

        // hex cap
        const hexTopCapGeo = new THREE.CylinderGeometry(this.hexCapRadius, this.hexCapRadius, this.hexCapThicknessTop, this.hexCapSegments);
        let hexTopBrush = new Brush(hexTopCapGeo);
        const hexTopY = this.pillarShaftHeight + this.capThickness + this.hexCapThicknessTop / 2;
        hexTopBrush.rotationY = this.random() * Math.PI * 2;
        hexTopBrush.position.set(0, hexTopY, 0);
        hexTopBrush.updateMatrixWorld();

        hexTopBrush = this.chipEdge(hexTopBrush, this.hexCapRadius, this.hexCapThicknessTop);
        const hexTopCap = new THREE.Mesh(hexTopBrush.geometry, this.material);
        group.add(hexTopCap);

        return group;
    }

    buildBottomCaps() {
        const group = new THREE.Group();

        // round cap
        const bottomCapGeo = new THREE.CylinderGeometry(this.capRadius, this.capRadius, this.capThickness, this.radialSegments);
        let bottomCapBrush = new Brush(bottomCapGeo);
        bottomCapBrush.position.set(0, this.capThickness / 2, 0);
        bottomCapBrush.updateMatrixWorld();

        bottomCapBrush = this.chipEdge(bottomCapBrush, this.capRadius, this.capThickness);
        
        const bottomCap = new THREE.Mesh(bottomCapBrush.geometry, this.material);
        group.add(bottomCap);

        // hex cap
        const hexBottomCapGeo = new THREE.CylinderGeometry(this.hexCapRadius, this.hexCapRadius, this.hexCapThicknessBottom, this.hexCapSegments);
        let hexBottomBrush = new Brush(hexBottomCapGeo);
        hexBottomBrush.position.set(0, this.capThickness / 2, 0);
        hexBottomBrush.updateMatrixWorld();
        
        hexBottomBrush = this.chipEdge(hexBottomBrush, this.hexCapRadius, this.hexCapThicknessBottom);
        
        const hexBottomCap = new THREE.Mesh(hexBottomBrush.geometry, this.material);
        group.add(hexBottomCap);

        return group;
    }

    /** Returns the final calculated height of the built object. */
    getHeight() {
        return this.finalHeight;
    }
}


export { Pillar };

