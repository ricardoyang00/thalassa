import * as THREE from 'three';
import { Pillar } from './pillar.js';
import { SUBTRACTION, ADDITION, Brush, Evaluator } from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.17/+esm';

class MyTemple extends THREE.Object3D {
    constructor() {
        super();

        const limestoneTexture = new THREE.TextureLoader().load('textures/limestone.jpg');
        limestoneTexture.wrapS = THREE.RepeatWrapping;
        limestoneTexture.wrapT = THREE.RepeatWrapping;
        const repeatFactor = 5;
        limestoneTexture.repeat.set(repeatFactor, repeatFactor);

        const cobbleTexture = new THREE.TextureLoader().load('textures/cobble3.jpg');
        cobbleTexture.wrapS = THREE.RepeatWrapping;
        cobbleTexture.wrapT = THREE.RepeatWrapping;
        const cobbleRepeatFactor = 20;
        cobbleTexture.repeat.set(cobbleRepeatFactor, cobbleRepeatFactor);

        const cobbleBumpTexture = new THREE.TextureLoader().load('images/cobble3-bump.jpg');
        cobbleBumpTexture.wrapS = THREE.RepeatWrapping;
        cobbleBumpTexture.wrapT = THREE.RepeatWrapping;
        cobbleBumpTexture.repeat.set(cobbleRepeatFactor, cobbleRepeatFactor);

        const goldMarbleTexture = new THREE.TextureLoader().load('textures/gold-marble.jpg');
        goldMarbleTexture.wrapS = THREE.RepeatWrapping;
        goldMarbleTexture.wrapT = THREE.RepeatWrapping;
        const goldMarbleRepeatFactor = 10;
        goldMarbleTexture.repeat.set(goldMarbleRepeatFactor, goldMarbleRepeatFactor);


        const limestoneMaterial = new THREE.MeshPhongMaterial({
            color: "#f9f6e3", //"#DCD5B4",
            specular: 0x111111,
            shininess: 10,
            map: limestoneTexture,
        });

        const cobbleMaterial = new THREE.MeshPhongMaterial({
            color: "#888888",
            specular: 0x111111,
            shininess: 5,
            map: cobbleTexture,
            bumpMap: cobbleBumpTexture,
            bumpScale: 1
        });

        const goldMarbleMaterial = new THREE.MeshPhongMaterial({
            color: "#d4c19c",
            specular: 0x222222,
            shininess: 30,
            map: goldMarbleTexture,
        });

        const gridSize = 7;
        const spacing = 5;
        const half = Math.floor(gridSize / 2);
        const pillarGroup = new THREE.Group();
        pillarGroup.name = "PillarGroup";
    
        const steps = 6;
        const individualStairHeight = 1;
        const baseHeight = steps * individualStairHeight;

        for (let ix = 0; ix < gridSize; ix++) {
            for (let iz = 0; iz < gridSize; iz++) {
                if (ix === 0 || ix === gridSize - 1 || iz === 0 || iz === gridSize - 1) {
                    const x = (ix - half) * spacing;
                    const z = (iz - half) * spacing;

                    const isCorner = (ix === 0 || ix === gridSize - 1) && (iz === 0 || iz === gridSize - 1);
                    let randomState = 'perfect';

                    if (!isCorner) {
                        const states = ['perfect', 'broken', 'perfect', 'broken', 'missing'];
                        randomState = states[Math.floor(Math.random() * states.length)];
                    } else {
                        randomState = 'perfect';
                    }

                    switch (randomState) {
                        case 'perfect':
                        case 'broken': {
                            const p = new Pillar({state: randomState}, limestoneMaterial);
                            p.position.set(x, 0, z);
                            const pillarScale = 1.3;
                            p.scale.set(pillarScale, 1, pillarScale);
                            pillarGroup.add(p);
                            break;
                        }
                        case 'missing':
                            break;
                    }
                }
            }
        }



        // roof
        const roofGroup = new THREE.Group();
        roofGroup.name = "RoofGroup";
        const size = gridSize * spacing;

        const slabThickness = 2;
        const largeStoneGeo = new THREE.BoxGeometry(size * 0.95, slabThickness, size * 0.95);
        const largeStoneMat = limestoneMaterial;

        //////////////////////////
        // apply UV fix before any CSG operations
        const uvAttribute = largeStoneGeo.getAttribute('uv');
        const slabWidth = size * 0.95; 
        const slabHeight = slabThickness;
        
        const sideVRepeat = (slabHeight / slabWidth) * repeatFactor;
        
        // scale the V (y) coordinate of the side UVs
        const vScale = sideVRepeat / repeatFactor;

        for (let i = 0; i < uvAttribute.count; i++) {
            const isTopOrBottom = (i >= 8 && i < 16);
            
            if (!isTopOrBottom) {
                const v = uvAttribute.getY(i);
                uvAttribute.setY(i, v * vScale);
            }
        }
         ////////////////////////

        const evaluator = new Evaluator();

        let mainSlabBrush = new Brush(largeStoneGeo);
        const gGeo = new THREE.BoxGeometry(size * 0.75, slabThickness, size * 0.75);
        const cuttingBrush = new Brush(gGeo);

        mainSlabBrush = evaluator.evaluate(mainSlabBrush, cuttingBrush, SUBTRACTION);


        let combinedRoofBrush = null;

        // largeStone (base slab)
        let brush1 = mainSlabBrush.clone();
        brush1.position.set(0, slabThickness / 2, 0);
        brush1.updateMatrixWorld();
        combinedRoofBrush = brush1;

        // stoneRing
        let brush2 = mainSlabBrush.clone();
        brush2.scale.set(1.01, 0.1, 1.01);
        brush2.position.set(0, slabThickness, 0);
        brush2.updateMatrixWorld();
        combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, brush2, ADDITION);

        // largeStone2
        let brush3 = mainSlabBrush.clone();
        const largeStone2ScaleY = 1.25;
        brush3.scale.set(0.96, largeStone2ScaleY, 0.96);
        brush3.position.set(0, slabThickness + (slabThickness * largeStone2ScaleY) / 2, 0);
        brush3.updateMatrixWorld();
        combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, brush3, ADDITION);


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
        const ringSideLength = (size * 0.95) * 1.01;
        const halfRingSide = ringSideLength / 2;

        const detailY = slabThickness + (slabThickness * 0.1) / 2 + (detailHeight / 2);
        const spacingBetweenDetails = detailWidth + 1.8;
        let numDetailsPerSide = Math.floor(ringSideLength / spacingBetweenDetails);

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
                const detailInstanceBrush = new Brush(detailBrush.geometry, largeStoneMat);
                let currentX, currentZ;
                const varyingCoord = -halfRingSide + startPositionOffset + (i * spacingBetweenDetails) + (detailWidth / 2);

                if (side.fixedCoordAxis === 'z') {
                    currentX = varyingCoord;
                    currentZ = side.fixedCoordValue + (side.fixedCoordValue > 0 ? -detailDepth / 2 : detailDepth / 2);
                } else {
                    currentX = side.fixedCoordValue + (side.fixedCoordValue > 0 ? -detailDepth / 2 : detailDepth / 2);
                    currentZ = varyingCoord;
                }

                detailInstanceBrush.position.set(currentX, detailY, currentZ);
                detailInstanceBrush.rotation.y = side.rotationY;
                detailInstanceBrush.updateMatrixWorld();

                combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, detailInstanceBrush, ADDITION);
            }
        });

        // stoneRing2
        let brush4 = mainSlabBrush.clone();
        brush4.scale.set(1.01, 0.1, 1.01); // same as stoneRing
        brush4.position.set(0, detailY + detailHeight / 2, 0);
        brush4.updateMatrixWorld();
        combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, brush4, ADDITION);

        // largeStone3
        let brush5 = mainSlabBrush.clone();
        let stone3Scale = 0.4;
        brush5.scale.set(1, stone3Scale, 1);
        brush5.position.set(0, detailY + detailHeight / 2 + (slabThickness * stone3Scale) / 2, 0);
        brush5.updateMatrixWorld();
        combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, brush5, ADDITION);


        // triangular prism roof
        const mainTriPrismGeo = new THREE.CylinderGeometry(1, 1, 1, 3);
        let mainTriPrismBrush = new Brush(mainTriPrismGeo);
        mainTriPrismBrush.position.set(0, 0, 0);
        mainTriPrismBrush.updateMatrixWorld();

        const cutterRadius = 0.8;
        const cutterHeight = 0.05;
        const cutterGeo = new THREE.CylinderGeometry(cutterRadius, cutterRadius, cutterHeight, 3);

        let cutterBrush = new Brush(cutterGeo);
        cutterBrush.position.set(0, 0.5 - cutterHeight / 2, 0);
        cutterBrush.updateMatrixWorld();
        mainTriPrismBrush = evaluator.evaluate(mainTriPrismBrush, cutterBrush, SUBTRACTION);
        cutterBrush.position.set(0, -0.5 + cutterHeight / 2, 0);
        cutterBrush.updateMatrixWorld();
        mainTriPrismBrush = evaluator.evaluate(mainTriPrismBrush, cutterBrush, SUBTRACTION);

        const roofHeight = 4;
        const roofScaleX = (ringSideLength / 2) * 1.1;
        const roofScaleY = ringSideLength;
        const roofScaleZ = roofHeight;
        const roofPosY = detailY + detailHeight / 2 + (slabThickness * stone3Scale) + roofHeight / 2;


        let prismBrush = mainTriPrismBrush.clone();
        
        prismBrush.scale.set(roofScaleX, roofScaleY, roofScaleZ);
        prismBrush.position.set(0, roofPosY, 0);
        prismBrush.rotation.set(-Math.PI / 2, 0, Math.PI / 2);
        prismBrush.updateMatrixWorld();



        // roof destruction cut
        const largeCutterGeo = new THREE.IcosahedronGeometry(roofScaleY * 0.62, 0);
        let largeCutterBrush = new Brush(largeCutterGeo);

        largeCutterBrush.position.set(
            -2.4833478927970667, 3.65, 8.191346841708041
        );

        largeCutterBrush.rotation.set(
            0.17190979866464334, 0.10249676695641013, 0.026383030320124057
        );

        largeCutterBrush.updateMatrixWorld();
        
        combinedRoofBrush = evaluator.evaluate(combinedRoofBrush, largeCutterBrush, SUBTRACTION);
        prismBrush = evaluator.evaluate(prismBrush, largeCutterBrush, SUBTRACTION);

        const finalSlabMesh = new THREE.Mesh(combinedRoofBrush.geometry, largeStoneMat);
        finalSlabMesh.geometry.computeVertexNormals();
        roofGroup.add(finalSlabMesh);

        const finalPrismMesh = new THREE.Mesh(prismBrush.geometry, largeStoneMat);
        finalPrismMesh.geometry.computeVertexNormals();
        roofGroup.add(finalPrismMesh);


        
        // base, stairs
        const baseGroup = new THREE.Group();
        baseGroup.name = "BaseGroup";
        const baseMat = cobbleMaterial;


        function applyGouge(targetBrush, bottomRadius, totalHeight, evaluator) {
            const cutterSize = bottomRadius * (0.05 + Math.random() * 0.15);
            const cutterGeo = new THREE.IcosahedronGeometry(cutterSize, 0);
            const cutterBrush = new Brush(cutterGeo);

            const angle = Math.random() * Math.PI * 2;
            const offset = bottomRadius * (0.8 + Math.random() * 0.2); 

            const brushPos = targetBrush.position;

            // steps build from y=0 down to y=-totalHeight.
            const yPos = -(totalHeight / 2) - (Math.random() * (totalHeight / 2));

            cutterBrush.position.set(
                brushPos.x + Math.cos(angle) * offset,
                yPos,
                brushPos.z + Math.sin(angle) * offset
            );
            cutterBrush.rotation.set(
                Math.random() * Math.PI,
                Math.random() * Math.PI,
                Math.random() * Math.PI
            );
            cutterBrush.updateMatrixWorld();

            return evaluator.evaluate(targetBrush, cutterBrush, SUBTRACTION);
        }

        let currentTotalHeightFromTop = 0;
        let combinedBrush = null;

        for (let i = 0; i < steps; i++) {
            const scale = 1 + i * 0.18;
            const stepSize = size * scale;
            const stepHeight = individualStairHeight;

            ////////////
            // fix uvs
            const stepGeo = new THREE.BoxGeometry(stepSize, stepHeight, stepSize);
    
            const stepUvAttribute = stepGeo.getAttribute('uv');
            const stepWidth = stepSize;

            const stepVRepeat = (stepHeight / stepWidth) * cobbleRepeatFactor; 
            const vScale = stepVRepeat / cobbleRepeatFactor;
    
            for (let j = 0; j < stepUvAttribute.count; j++) {
                const isTopOrBottom = (j >= 8 && j < 16);
                if (!isTopOrBottom) {
                    const u = stepUvAttribute.getX(j);
                    const v = stepUvAttribute.getY(j);
                    
                    stepUvAttribute.setX(j, v);
                    stepUvAttribute.setY(j, u);

                    stepUvAttribute.setX(j, v * vScale);
                }
            }
            ////////////


            let stepBrush = new Brush(stepGeo);

            stepBrush.position.set(0, -(currentTotalHeightFromTop + stepHeight / 2), 0);
            stepBrush.updateMatrixWorld();
            
            if (combinedBrush === null) {
                combinedBrush = stepBrush;
            } else {
                combinedBrush = evaluator.evaluate(combinedBrush, stepBrush, ADDITION);
            }

            currentTotalHeightFromTop += stepHeight;
        }

        if (combinedBrush) {
            
            const damageCount = 4;
            const bottomStepRadius = (size * (1 + (steps - 1) * 0.18)) / 2;

            for(let d = 0; d < damageCount; d++) {
                combinedBrush = applyGouge(combinedBrush, bottomStepRadius, baseHeight, evaluator);
            }

            const baseMesh = new THREE.Mesh(combinedBrush.geometry, baseMat);
            baseMesh.geometry.computeVertexNormals();
            baseGroup.add(baseMesh);
        }
        
        baseGroup.position.set(0, baseHeight, 0);


        // groups
        const templeGroup = new THREE.Group();
        templeGroup.add(pillarGroup);
        templeGroup.add(roofGroup);
        templeGroup.add(baseGroup);

                
        // group positioning
        // pillar group on top of the base
        pillarGroup.position.set(0, baseHeight, 0);

        // roof on top of perfect pillars
        const perfectPillarHeight = new Pillar({state: 'perfect'}).getHeight();
        const pillarScaleY = 1;
        
        roofGroup.position.set(0, baseHeight + (perfectPillarHeight * pillarScaleY), 0);

        //templeGroup.translateY(-2*individualStairHeight);
        this.add(templeGroup);

    }
}

export { MyTemple };
