import * as THREE from 'three';
import { Pillar } from './pillar.js';
import { SUBTRACTION, Brush, Evaluator } from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.17/+esm';

class MyTemple extends THREE.Object3D {
    constructor() {
        super();

        const gridSize = 7;
        const spacing = 5;
        const half = Math.floor(gridSize / 2);
        const pillarGroup = new THREE.Group();

        for (let ix = 0; ix < gridSize; ix++) {
            for (let iz = 0; iz < gridSize; iz++) {
                if (ix === 0 || ix === gridSize - 1 || iz === 0 || iz === gridSize - 1) {
                    const x = (ix - half) * spacing;
                    const z = (iz - half) * spacing;
                    const p = new Pillar();
                    p.position.set(x, 0, z);
                    const pillarScale = 1.3;
                    p.scale.set(pillarScale, 1, pillarScale);
                    pillarGroup.add(p);
                }
            }
        }



        // roof
        const roofGroup = new THREE.Group();
        const size = gridSize * spacing;


        const slabThickness = 2;
        const largeStoneGeo = new THREE.BoxGeometry(size * 0.95, slabThickness, size * 0.95);
        const largeStoneMat = new THREE.MeshPhongMaterial({ color: '#979797' });



        const evaluator = new Evaluator();



        let mainSlabBrush = new Brush(largeStoneGeo); 
        const gGeo = new THREE.BoxGeometry(size * 0.75, slabThickness, size * 0.75);
        const cuttingBrush = new Brush(gGeo);

        mainSlabBrush = evaluator.evaluate(mainSlabBrush, cuttingBrush, SUBTRACTION);


        const largeStone = new THREE.Mesh(mainSlabBrush.geometry, largeStoneMat);

        largeStone.position.set(0, slabThickness / 2, 0);
        roofGroup.add(largeStone);

        const stoneRing = largeStone.clone();
        stoneRing.scale.set(1.01, 0.1, 1.01);
        stoneRing.position.set(0, slabThickness, 0);
        roofGroup.add(stoneRing);


        const largeStone2 = largeStone.clone();
        const largeStone2ScaleY = 1.25;
        largeStone2.scale.set(0.96, largeStone2ScaleY, 0.96);

        largeStone2.position.set(0, slabThickness + (slabThickness * largeStone2ScaleY) / 2, 0);
        roofGroup.add(largeStone2);



        // details

        const detailWidth = 1.5;
        const detailDepth = 1;
        const detailHeight = slabThickness * largeStone2ScaleY - 0.1;
        const detailGeo = new THREE.BoxGeometry(detailWidth, detailHeight, detailDepth);
        let detailBrush = new Brush(detailGeo);
        detailBrush.updateMatrixWorld();

        // cutter - two vertical grooves)
        const cutWidth = 0.14;
        const cutHeight = slabThickness * largeStone2ScaleY * 0.8;
        const cutDepth = 0.5;
        const cutGeo = new THREE.BoxGeometry(cutWidth, cutHeight, cutDepth);

        const cutOffset = 0.32;
        const cut = new Brush(cutGeo);
        cut.position.set(-cutOffset, 0, detailDepth / 2 - cutDepth / 2);
        cut.updateMatrixWorld();
        detailBrush = evaluator.evaluate(detailBrush, cut, SUBTRACTION);
        cut.position.set(cutOffset, 0, detailDepth / 2 - cutDepth / 2);
        cut.updateMatrixWorld();
        detailBrush = evaluator.evaluate(detailBrush, cut, SUBTRACTION);

        



        // details around stone ring
        const ringSideLength = (size * 0.95) * stoneRing.scale.x;
        const halfRingSide = ringSideLength / 2;

        const detailY = stoneRing.position.y + (slabThickness * stoneRing.scale.y) / 2 + (detailHeight / 2);
        const spacingBetweenDetails = detailWidth + 1.8;
        const numDetailsPerSide = Math.floor(ringSideLength / spacingBetweenDetails);


        if (numDetailsPerSide < 1 && ringSideLength > detailWidth) {
            numDetailsPerSide = 1;
        }

        const posOff = 0.5;
        const sides = [
            { fixedCoordAxis: 'z', fixedCoordValue: halfRingSide - posOff, rotationY: 0 },              // Front side (facing +Z)
            { fixedCoordAxis: 'x', fixedCoordValue: halfRingSide - posOff, rotationY: Math.PI / 2 },    // Right side (facing +X)
            { fixedCoordAxis: 'z', fixedCoordValue: -halfRingSide + posOff, rotationY: Math.PI },       // Back side (facing -Z)
            { fixedCoordAxis: 'x', fixedCoordValue: -halfRingSide + posOff, rotationY: -Math.PI / 2 }   // Left side (facing -X)
        ];

        sides.forEach(side => {
            
            const totalDetailsWidth = (numDetailsPerSide * detailWidth) + ((numDetailsPerSide - 1) * (spacingBetweenDetails - detailWidth));
            const startPositionOffset = (ringSideLength - totalDetailsWidth) / 2;

            for (let i = 0; i < numDetailsPerSide; i++) {
                const detailInstance = new THREE.Mesh(detailBrush.geometry, largeStoneMat); 

                let currentX, currentZ;

                const varyingCoord = -halfRingSide + startPositionOffset + (i * spacingBetweenDetails) + (detailWidth / 2);


                if (side.fixedCoordAxis === 'z') {
                    currentX = varyingCoord;
                    currentZ = side.fixedCoordValue + (side.fixedCoordValue > 0 ? -detailDepth / 2 : detailDepth / 2);
                } else {
                    currentX = side.fixedCoordValue + (side.fixedCoordValue > 0 ? -detailDepth / 2 : detailDepth / 2);
                    currentZ = varyingCoord;
                }

                detailInstance.position.set(currentX, detailY, currentZ);
                detailInstance.rotation.y = side.rotationY;
                detailInstance.scale.set(1, 1, 1);

                roofGroup.add(detailInstance);
            }
        });

        const stoneRing2 = stoneRing.clone();
        stoneRing2.position.set(0, detailY + detailHeight/2, 0);
        roofGroup.add(stoneRing2);

        const largeStone3 = largeStone.clone();
        let stone3Scale = 0.4;
        largeStone3.scale.set(1, stone3Scale, 1);
        largeStone3.position.set(0, detailY + detailHeight/2 + (slabThickness * stone3Scale) / 2, 0);
        roofGroup.add(largeStone3);



        
        // triangular prism roof
        const mainTriPrismGeo = new THREE.CylinderGeometry(1,1,1,3);
        let mainTriPrismBrush = new Brush(mainTriPrismGeo);
        mainTriPrismBrush.position.set(0, 0, 0);
        mainTriPrismBrush.updateMatrixWorld();

        const cutterRadius = 0.8;
        const cutterHeight = 0.05;
        const cutterGeo = new THREE.CylinderGeometry(cutterRadius,cutterRadius,cutterHeight,3);

        let cutterBrush = new Brush(cutterGeo);
        cutterBrush.position.set(0, 0.5 - cutterHeight / 2, 0);
        cutterBrush.updateMatrixWorld();
        mainTriPrismBrush = evaluator.evaluate(mainTriPrismBrush, cutterBrush, SUBTRACTION);
        cutterBrush.position.set(0, -0.5 + cutterHeight / 2, 0);
        cutterBrush.updateMatrixWorld();
        mainTriPrismBrush = evaluator.evaluate(mainTriPrismBrush, cutterBrush, SUBTRACTION);

        const roof = new THREE.Mesh(mainTriPrismBrush.geometry, largeStoneMat);
        //roofGroup.add(roof);
        const roofHeight = 4;

        roof.scale.set((ringSideLength / 2)*1.1, ringSideLength, roofHeight);
        roof.position.set(0, detailY + detailHeight/2 + (slabThickness * stone3Scale) + roofHeight / 2, 0);
        roof.rotateX(-Math.PI / 2);
        roof.rotateZ(Math.PI / 2);
        roofGroup.add(roof);


        

        // base - stairs
        const baseGroup = new THREE.Group();
        const steps = 6;
        const baseMat = new THREE.MeshPhongMaterial({ color: '#5a5a5a' });

        const individualStairHeight = 1;


        for (let i = 0; i < steps; i++) {
            const scale = 1 + i * 0.18;
            const stepSize = size * scale;
            const stepHeight = individualStairHeight;

            const stepGeo = new THREE.BoxGeometry(stepSize, stepHeight, stepSize);
            const step = new THREE.Mesh(stepGeo, baseMat);

            const bottomOfCurrentStepY = i * stepHeight;

            step.position.set(0, bottomOfCurrentStepY + stepHeight / 2, 0);

            baseGroup.add(step);

        }

        baseGroup.rotateX(Math.PI);
        const baseHeight = steps * individualStairHeight;
        baseGroup.position.set(0, baseHeight/2, 0);




        // groups
        const templeGroup = new THREE.Group();
        templeGroup.add(pillarGroup);
        templeGroup.add(roofGroup);
        templeGroup.add(baseGroup);


                
        pillarGroup.position.set(0, baseHeight/2 + individualStairHeight/2, 0);

        const box = new THREE.Box3().setFromObject(pillarGroup);
        const pillarHeight = box.max.y;
        roofGroup.position.set(0, pillarHeight, 0);

        this.add(templeGroup);

    }
}

export { MyTemple };