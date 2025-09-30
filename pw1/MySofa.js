import * as THREE from 'three';

class MySofa extends THREE.Object3D {
    constructor(app, {
        width = 4,
        depth = 0.8,
        height = 1.0,
        cushionHeight = 0.45,
        color = "#59ff00",        // frame color
        cushionColor = "#bd0000",  // cushions
        cornerLength = 3
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Use MeshPhongMaterial for all parts so they interact with lights
        const frameMat = new THREE.MeshPhongMaterial({ color, specular: color, shininess: 80 });
        const cushionMat = new THREE.MeshPhongMaterial({ color: cushionColor, shininess: 30 });
        const armMat = frameMat;  // use same material as frame for armrests
        const legMat = new THREE.MeshPhongMaterial({ color: "#aaaaaa" });

        // ===== Helper to make a sofa segment =====
        const makeSegment = (segWidth, segDepth) => {
            const group = new THREE.Group();

            // seat
            const seatGeom = new THREE.BoxGeometry(segWidth, 0.25, segDepth);
            const seat = new THREE.Mesh(seatGeom, frameMat);
            seat.position.set(0, 0.25/2, 0);
            group.add(seat);

            // backrest
            const backGeom = new THREE.BoxGeometry(segWidth, height * 0.7, 0.25);
            const back = new THREE.Mesh(backGeom, frameMat);
            back.position.set(0, 0.25/2 + (height * 0.7)/2 + cushionHeight*0.1, -segDepth/2 + 0.125);
            group.add(back);

            // cushions
            const cushionWidth = (segWidth - 0.2) / 3;
            for (let i = 0; i < 3; i++) {
                const cg = new THREE.BoxGeometry(cushionWidth, cushionHeight, segDepth - 0.1);
                const cm = new THREE.Mesh(cg, cushionMat);
                const x = -segWidth/2 + 0.1 + cushionWidth/2 + i * cushionWidth;
                cm.position.set(x, cushionHeight/2 + 0.25/2, 0);
                group.add(cm);
            }

            // armrests
            const armGeom = new THREE.BoxGeometry(0.25, height * 0.6, segDepth - 0.1);
            const leftArm = new THREE.Mesh(armGeom, armMat);
            leftArm.position.set(-segWidth/2 + 0.125, armGeom.parameters.height/2 + 0.25/2, 0);
            group.add(leftArm);

            const rightArm = new THREE.Mesh(armGeom, armMat);
            rightArm.position.set(segWidth/2 - 0.125, armGeom.parameters.height/2 + 0.25/2, 0);
            group.add(rightArm);

            // legs
            const legGeom = new THREE.CylinderGeometry(0.06, 0.06, 0.1, 8);
            const legPositions = [
                [-segWidth/2 + 0.15, -0.05, -segDepth/2 + 0.15],
                [ segWidth/2 - 0.15, -0.05, -segDepth/2 + 0.15],
                [-segWidth/2 + 0.15, -0.05,  segDepth/2 - 0.15],
                [ segWidth/2 - 0.15, -0.05,  segDepth/2 - 0.15],
            ];
            for (const p of legPositions) {
                const leg = new THREE.Mesh(legGeom, legMat);
                leg.position.set(...p);
                group.add(leg);
            }

            return group;
        };

        // ===== Main sofa (rotated) =====
        const mainSofa = makeSegment(width, depth);
        mainSofa.rotation.y = Math.PI / 2;
        mainSofa.position.set(0, 0, 0);
        this.add(mainSofa);

        // ===== Side sofa =====
        const sideSofa = makeSegment(cornerLength, depth);
        sideSofa.position.set(depth/2 - 0.1, 0, -cornerLength/2 + 0.05);
        this.add(sideSofa);

        this.position.y = 0;
    }
}

MySofa.prototype.isGroup = true;

export { MySofa };
