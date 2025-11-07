import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
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

// Mesh that groups all tube corals for performance reasons
export class TubeCoralsContainer extends InstancedMesh2 {
    static #tubeGeo = tubeGeoGen(32);
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');
    static #material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: this.#texture,
        bumpMap: this.#texture,
        bumpScale: 5,
    });

    constructor() {
        // createEntities needed for updateInstances()
        super(TubeCoralsContainer.#tubeGeo, TubeCoralsContainer.#material, {createEntities: true});
    }
}

export class TubeCoral {
    static defaultContainer = new TubeCoralsContainer();
    _instances = []; // array of matrices for tubes stored in TubeCoralsContainer

    static #Position = class extends THREE.Vector3 {
        constructor(coral, x = 0, y = 0, z = 0) {
            super(x, y, z);
            this.coral = coral;
        }

        set x(val) {
            this.coral?._instances.forEach((obj) => obj.position.x += val - this._x);
            this._x = val;
        }

        set y(val) {
            this.coral?._instances.forEach((obj) => obj.position.y += val - this._y);
            this._y = val;
        }

        set z(val) {
            this.coral?._instances.forEach((obj) => obj.position.z += val - this._z);
            this._z = val;
        }

        get x() {
            return this._x;
        }

        get y() {
            return this._y;
        }

        get z() {
            return this._z;
        }
    }

    constructor(color = 0xffffff, size = 1, container = TubeCoral.defaultContainer) {
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

        this.position = new TubeCoral.#Position(this);

        let i = 0;
        container.addInstances(attributes.length, (obj, j) => {
            const attr = attributes[i];
            obj.position.copy(attr.pos);
            obj.rotateY(attr.rot.y);
            obj.rotateX(attr.rot.x);
            obj.scale.set(size, attr.height * size, size);
            container.setColorAt(j, color); // Using "obj.color" throws an error
            this._instances.push(obj);
            i++;
        });
    }

    rotateX(angle) {
        this._instances.forEach((obj) => obj.rotateX(angle));
    }

    rotateY(angle) {
        this._instances.forEach((obj) => obj.rotateY(angle));
    }

    rotateZ(angle) {
        this._instances.forEach((obj) => obj.rotateZ(angle));
    }
}
