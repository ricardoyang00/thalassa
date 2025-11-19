import * as THREE from 'three';

class SubmarineGeometry {
    static createLowDetailSubmarine() {
        const group = new THREE.Group();
        group.name = 'LowDetailSubmarine';

        const yellowMat = new THREE.MeshPhongMaterial({ 
            color: 0xf1ae33,
            shininess: 100,
            specular: 0x111111
        });
        
        const blackMat = new THREE.MeshPhongMaterial({ 
            color: 0x282828, 
            shininess: 40 
        });
        
        const glassMat = new THREE.MeshPhongMaterial({ 
            color: 0x000000, 
            shininess: 80,
            specular: 0x222222
        });

        const metalMat = new THREE.MeshPhongMaterial({ 
            color: 0x5f6161, 
            shininess: 70 
        });

        // --- MAIN BODY ---
        const bodyGeo = new THREE.SphereGeometry(1, 24, 24);
        const pos = bodyGeo.attributes.position;

        // LOOKING AT -X DIRECTION
        const frontThreshold = -0.2;
        const frontFlatten = 0.7; // 0 = fully clamped to threshold, 1 = no change

        const backThreshold = 0.2;
        const backFlatten = 0.5;

        const topThreshold = 0.6;
        const bottomThreshold = -0.6;
        const verticalFlatten = 0.75;

        for (let i = 0; i < pos.count; i++) {
            const x = pos.getX(i);
            let y = pos.getY(i);

            // front flattening
            if (x < frontThreshold) {
                const newX = frontThreshold + (x - frontThreshold) * frontFlatten;
                pos.setX(i, newX);
            }

            // back flattening
            if (x > backThreshold) {
                const newX = backThreshold + (x - backThreshold) * backFlatten;
                pos.setX(i, newX);
            }

            // top flattening
            if (y > topThreshold) {
                y = topThreshold + (y - topThreshold) * verticalFlatten;
                pos.setY(i, y);
            }

            // bottom flattening
            if (y < bottomThreshold) {
                y = bottomThreshold + (y - bottomThreshold) * verticalFlatten;
                pos.setY(i, y);
            }
        }
        pos.needsUpdate = true;
        bodyGeo.computeVertexNormals();
        const body = new THREE.Mesh(bodyGeo, yellowMat);
        body.scale.set(1.1, 0.8, 0.8);
        group.add(body);

        // --- FRONT GLASS ---
        const glassGeo = new THREE.SphereGeometry(1, 24, 24); 
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.set(-0.6, 0, 0);
        glass.scale.set(0.65, 0.65, 0.65);
        group.add(glass);

        // --- GLASS GREYBAR ---
        const barGeo = new THREE.TorusGeometry(0.65, 0.03, 8, 16, Math.PI + 0.6);
        const bar = new THREE.Mesh(barGeo, metalMat);
        bar.rotation.y = Math.PI / 2;
        bar.rotateX(- Math.PI / 2);
        bar.rotateZ(-0.3);
        bar.position.set(-0.65, -0.03, 0);
        group.add(bar);
        const barGeo2 = new THREE.TorusGeometry(0.65, 0.03, 8, 16, Math.PI / 2 + 0.8);
        const bar2 = new THREE.Mesh(barGeo2, metalMat);
        bar2.position.set(-0.65, -0.03, 0);
        bar2.rotateZ(Math.PI);
        group.add(bar2);

        // --- THRUSTERS---
        // Main Engine
        const mainEngineGeo = new THREE.CylinderGeometry(0.3, 0.4, 0.5, 16);
        mainEngineGeo.rotateZ(Math.PI / 2);
        const mainEngine = new THREE.Mesh(mainEngineGeo, metalMat);
        mainEngine.position.set(0.7, 0, 0);
        group.add(mainEngine);

        // Side Engines
        const sideEngineGeo = new THREE.CylinderGeometry(0.15, 0.25, 0.5, 12);
        sideEngineGeo.rotateZ(Math.PI / 2);

        // Left
        const leftEngine = new THREE.Mesh(sideEngineGeo, metalMat);
        leftEngine.position.set(0.4, -0.25, 0.65);
        group.add(leftEngine);

        // Right
        const rightEngine = leftEngine.clone();
        rightEngine.position.set(0.4, -0.25, -0.65);
        group.add(rightEngine);

        // --- DETAILS ---
        // Top Snorkel/Hatch
        const hatchGeo = new THREE.BoxGeometry(0.4, 0.1, 0.22);
        const hatch = new THREE.Mesh(hatchGeo, blackMat);
        hatch.position.set(-0.05, 0.8, 0);
        group.add(hatch);

        // Side Vents (Black Rings)
        const ventGeo = new THREE.TorusGeometry(0.15, 0.06, 8, 16);
        ventGeo.rotateX(-Math.PI / 4);
        
        const leftVent = new THREE.Mesh(ventGeo, blackMat);
        leftVent.position.set(-0.2, 0.48, 0.6);
        group.add(leftVent);

        const diskGeom = new THREE.CylinderGeometry(0.1, 0.1, 0.01, 16);
        const leftDisk = new THREE.Mesh(diskGeom, blackMat);
        leftDisk.rotateX(Math.PI / 4);
        leftDisk.position.copy(leftVent.position);
        leftDisk.translateY(0.02);
        group.add(leftDisk);

        const rightVent = leftVent.clone();
        rightVent.position.set(-0.2, 0.48, -0.6);
        rightVent.rotateX(Math.PI / 2);
        group.add(rightVent);

        const rightDisk = leftDisk.clone();
        rightDisk.rotateX(-Math.PI / 2);
        rightDisk.position.copy(rightVent.position);
        rightDisk.translateY(0.02);
        group.add(rightDisk);

        // Lights
        const leftLightGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.6, 12);
        leftLightGeo.rotateZ(Math.PI / 2);
        const leftLight = new THREE.Mesh(leftLightGeo, yellowMat);
        leftLight.position.set(-0.2, 0, 0.73);
        leftLight.rotateX(Math.PI / 2);
        group.add(leftLight);
        
        const rightLight = leftLight.clone();
        rightLight.position.set(-0.2, 0, -0.73);
        group.add(rightLight);

        return group;
    }
}

export const createLowDetailSubmarine = SubmarineGeometry.createLowDetailSubmarine;