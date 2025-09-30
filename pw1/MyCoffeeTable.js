import * as THREE from 'three';

class MyCoffeeTable extends THREE.Object3D {

    constructor(app, tableMaterial) {
        super();
        this.app = app;
        this.type = 'Group';

        // smaller coffee table proportions
        const legHeight = 0.3;
        const legGeometry = new THREE.CylinderGeometry( 0.04, 0.04, legHeight, 12);

        // top size: smaller than main table
        const topWidth = 2;
        const topDepth = 1;
        const topThickness = 0.06;

        // legs positions relative to top
        const legOffsetX = topWidth/2 - 0.12;
        const legOffsetZ = topDepth/2 - 0.12;

        const legs = [
            [ legOffsetX, -(legHeight/2),  legOffsetZ ],
            [-legOffsetX, -(legHeight/2),  legOffsetZ ],
            [ legOffsetX, -(legHeight/2), -legOffsetZ ],
            [-legOffsetX, -(legHeight/2), -legOffsetZ ],
        ];

        const legMat = tableMaterial;
        for (const p of legs) {
            const leg = new THREE.Mesh(legGeometry, legMat);
            leg.position.set(p[0], p[1], p[2]);
            this.add(leg);
        }

        const topGeometry = new THREE.BoxGeometry(topWidth, topThickness, topDepth);
        const topMesh = new THREE.Mesh(topGeometry, tableMaterial);
        // top sits above legs: leg top is at y = 0, so place top at half thickness
        topMesh.position.set(0, 0.0 + topThickness/2, 0);
        this.add(topMesh);

        // slightly raise object so top surface is around y = 0.3 (common coffee table height)
        // current top center at y = topThickness/2 (~0.03) so we'll offset entire group
        this.position.y = 0.28;
    }
}

MyCoffeeTable.prototype.isGroup = true;

export { MyCoffeeTable };