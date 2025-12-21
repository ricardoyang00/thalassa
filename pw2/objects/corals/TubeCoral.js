import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { SgiUtils } from '../../SgiUtils.js';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';

function tubeGeoGen(radialSegments) {
    const size = 1;
    const radiusTop = size / 8;
    const radiusBottom = radiusTop / 2;
    const height = size;
    const thickness = 0.25;

    const outerCylinderGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);

    const innerScale = 1.0 - thickness;
    const innerCylinderGeo = outerCylinderGeo.clone().scale(innerScale, 1, innerScale);
    innerCylinderGeo.getIndex().array.reverse();

    const ringGeo = new THREE.RingGeometry(innerScale * radiusTop, radiusTop, radialSegments)
        .rotateX(-Math.PI / 2)
        .translate(0, height / 2, 0);

    return BufferGeometryUtils.mergeGeometries([outerCylinderGeo, innerCylinderGeo, ringGeo]).translate(0, height / 2, 0);
};

// Mesh that groups all tube corals for performance reasons
export class TubeCoralsOwner extends InstancedMesh2 {
    static #tubeGeo = [
        tubeGeoGen(32),
        tubeGeoGen(8),
        tubeGeoGen(4),
    ];
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');
    static #highDetailMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: this.#texture,
        bumpMap: this.#texture,
        bumpScale: 5,
    });
    static #mediumDetailMat = (() => {
        const mat = TubeCoralsOwner.#highDetailMat.clone();
        mat.bumpMap = null;
        return mat;
    })();

    constructor() {
        const tubeGeo = TubeCoralsOwner.#tubeGeo;
        // createEntities needed for updateInstances()
        super(tubeGeo[0], TubeCoralsOwner.#highDetailMat, {createEntities: true});
        this.addLOD(tubeGeo[1], TubeCoralsOwner.#mediumDetailMat, 30);
        this.addLOD(tubeGeo[2], TubeCoralsOwner.#mediumDetailMat, 60);
        this.frustumCulled = false;
    }
}

export class TubeCoral extends MultiInstancedEntity {
    static defaultOwner = new TubeCoralsOwner();

    constructor(color = 0xffffff, size = 1, owner = TubeCoral.defaultOwner) {
        super(owner);
        const layers = 3;
        let n = 4;

        const attributes = [];
        let angle = 0;
        let alphaAng = 2 * Math.PI / n;
        for (let layer = 1; layer <= layers; ++layer, n *= 2, alphaAng /= 2) {
            for (let j = 0; j < n; ++j, angle += alphaAng) {
                const ang = angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3);
                const height = SgiUtils.rand(0.5, 1.0);

                attributes.push({
                    height: height,
                    rot: {
                        y: angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3),
                        x: layer * SgiUtils.rand(Math.PI / 20, Math.PI / 10),
                    },
                    pos: new THREE.Vector3(
                        layer * size * Math.sin(ang) / 8,
                        0,
                        layer * size * Math.cos(ang) / 8,
                    ),
                })
            }
        }

        let i = 0;
        this.addInstances(attributes.length, (obj, j) => {
            const attr = attributes[i];
            obj.position.copy(attr.pos);
            obj.rotateY(attr.rot.y);
            obj.rotateX(attr.rot.x);
            obj.scale.set(size, attr.height * size, size);
            owner.setColorAt(j, color); // Using "obj.color" throws an error
            i++;
        });

        this.collisionRadius = size;
    }
}
