import * as THREE from 'three';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';

export class BrainCoralsContainer extends InstancedMesh2 {
    static #texture = (() => {
        const texture = new THREE.TextureLoader().load('textures/brain-coral.png');
        texture.repeat = new THREE.Vector2(1.2, 1.2);
        texture.wrapS = texture.wrapT = THREE.MirroredRepeatWrapping;
        return texture;
    })();

    static #highDetailMat = new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: this.#texture,
            bumpMap: this.#texture,
            bumpScale: 5,
            displacementMap: this.#texture,
            displacementScale: 0.2,
    });

    static #lowDetailMat = (() => {
        const mat = BrainCoralsContainer.#highDetailMat.clone();
        mat.displacementMap = null;
        mat.bumpMap = null;
        return mat;
    })();

    static #geo = [
        new THREE.SphereGeometry(1, 128, 128).rotateZ(Math.PI / 2),
        new THREE.SphereGeometry(1, 16, 16).rotateZ(Math.PI / 2),
        ((geo) => {
            const scale = 1 + BrainCoralsContainer.#highDetailMat.displacementScale;
            return geo.scale(scale, scale, scale);
        })(new THREE.SphereGeometry(1, 4, 4).rotateZ(Math.PI / 2)),
    ];

    constructor() {
        const geo = BrainCoralsContainer.#geo;
        super(geo[0], BrainCoralsContainer.#highDetailMat, {createEntities: true});
        this.addLOD(geo[1], BrainCoralsContainer.#highDetailMat, 40);
        this.addLOD(geo[2], BrainCoralsContainer.#lowDetailMat, 150);
    }
}

export class BrainCoral {
    static defaultContainer = new BrainCoralsContainer();
    _instances = [];

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

    constructor(color = 0xffffff, size = 1, container = BrainCoral.defaultContainer) {
        const radius = size / 2;
        this.position = new BrainCoral.#Position(this);
        // TODO: create instances in batches if this starts affecting generation time
        container.addInstances(1, (obj, i) => {
            obj.scale.set(radius, radius, radius);
            container.setColorAt(i, color);
            this._instances.push(obj);
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
