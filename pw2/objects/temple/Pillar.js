import * as THREE from 'three';
import { SUBTRACTION, Brush, Evaluator } from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.17/+esm';

class Pillar extends THREE.Object3D {
    constructor() {
        super();

        const radius = 1;
        const height = 12;
        const grooveCount = 32;
        const grooveRadius = 0.0986;
        const grooveOffset = 1.05;
        const materialColor = '#979797';
        const radialSegments = 32;

        const evaluator = new Evaluator();

        // base pillar brush (positioned so bottom sits at y=0)
        const baseGeo = new THREE.CylinderGeometry(radius, radius, height, radialSegments);
        let currentBrush = new Brush(baseGeo);
        currentBrush.position.set(0, height / 2, 0);
        currentBrush.updateMatrixWorld();

        // groove cutters: slightly taller than pillar so they cut cleanly
        const grooveHeight = height + 2;

        for (let i = 0; i < grooveCount; i++) {
            const angle = (i / grooveCount) * Math.PI * 2;
            const gGeo = new THREE.CylinderGeometry(grooveRadius, grooveRadius, grooveHeight, 16);
            const grooveBrush = new Brush(gGeo);
            // align cutter axis with pillar axis and offset radially
            grooveBrush.position.set(Math.cos(angle) * grooveOffset, height / 2, Math.sin(angle) * grooveOffset);
            grooveBrush.updateMatrixWorld();
            currentBrush = evaluator.evaluate(currentBrush, grooveBrush, SUBTRACTION);
        }

        const material = new THREE.MeshPhongMaterial({ color: materialColor });
        const mesh = new THREE.Mesh(currentBrush.geometry, material);

        this.add(mesh);

        // circle cap
        const capThickness = 0.5;
        const capRadius = radius * 1.08;
        const capSegments = radialSegments;

        const bottomCapGeo = new THREE.CylinderGeometry(capRadius, capRadius, capThickness, capSegments);
        const bottomCap = new THREE.Mesh(bottomCapGeo, material);
        // place bottom cap so its bottom sits at y=0 (same baseline as pillar)
        bottomCap.position.set(0, capThickness / 2, 0);
        this.add(bottomCap);

        const topCapGeo = new THREE.CylinderGeometry(capRadius, capRadius, capThickness, capSegments);
        const topCap = new THREE.Mesh(topCapGeo, material);
        // place top cap at top of pillar
        topCap.position.set(0, height - capThickness / 2, 0);
        this.add(topCap);


        // hexa cap
        const hexCapThicknessTop = 0.5;
        const hexCapThicknessBottom = 1;
        const hexCapRadius = radius * 1.5;
        const hexCapSegments = 6;

        const hexBottomCapGeo = new THREE.CylinderGeometry(hexCapRadius, hexCapRadius, hexCapThicknessBottom, hexCapSegments);
        const hexBottomCap = new THREE.Mesh(hexBottomCapGeo, material);
        // place bottom cap so its bottom sits at y=0 (same baseline as pillar)
        hexBottomCap.position.set(0, capThickness / 2 - hexCapThicknessBottom / 2, 0);
        this.add(hexBottomCap);

        const hexTopCapGeo = new THREE.CylinderGeometry(hexCapRadius, hexCapRadius, hexCapThicknessTop, hexCapSegments);
        const hexTopCap = new THREE.Mesh(hexTopCapGeo, material);
        // place top cap at top of pillar
        hexTopCap.position.set(0, height - capThickness / 2 + hexCapThicknessTop / 2, 0);
        this.add(hexTopCap);

        this.height = height - capThickness / 2 + hexCapThicknessTop / 2;
    }

    getHeight() {
        return this.height;
    }
}

export { Pillar };