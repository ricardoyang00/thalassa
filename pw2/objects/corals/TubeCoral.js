import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { SgiUtils } from '../../SgiUtils.js';

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

class TubeCoral extends THREE.LOD {
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');
    static #tubeGeo = tubeGeoGen(16);

    constructor(color = 0xffffff, size = 1) {
        super();
        const layers = 3;
        let n = 4;
        let nTubes = 0;

        const material = new THREE.MeshPhongMaterial({
            color,
            map: TubeCoral.#texture,
            bumpMap: TubeCoral.#texture,
            bumpScale: 5,
        });

        const attributes = [];
        let angle = 0;
        let alphaAng = 2 * Math.PI / n;
        for (let layer = 1; layer <= layers; ++layer, n *= 2, alphaAng /= 2) {
            nTubes += n;
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

        const mesh = new THREE.InstancedMesh(TubeCoral.#tubeGeo, material, nTubes);
        attributes.forEach((attr, i) => {
            mesh.setMatrixAt(i, new THREE.Matrix4()
                .multiply(new THREE.Matrix4().makeTranslation(attr.pos))
                .multiply(new THREE.Matrix4().makeRotationY(attr.rot.y))
                .multiply(new THREE.Matrix4().makeRotationX(attr.rot.x))
                .multiply(new THREE.Matrix4().makeScale(size, attr.height * size, size))
            );
        });

        // TODO: LOD
        this.addLevel(mesh, 0);
    }
}

export { TubeCoral };
