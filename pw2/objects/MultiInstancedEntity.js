import * as THREE from 'three';

export class MultiInstancedEntity {
    _instances = [];

    constructor(owner) {
        this.owner = owner;
        this.position = new MultiInstancedEntity.Position(this);
    }

    addInstances(n, fn) {
        this.owner.addInstances(n, (obj, i) => {
            fn(obj, i);
            this._instances.push(obj);
        });
    }

    rotateX(angle) {
        this.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(1, 0, 0), angle));
    }

    rotateY(angle) {
        this.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), angle));
    }

    rotateZ(angle) {
        this.applyQuaternion(new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 0, 1), angle));
    }

    applyQuaternion(q) {
        this._instances.forEach(obj => {
            obj.position.sub(this.position)
                .applyQuaternion(q)
                .add(this.position);

            obj.quaternion.premultiply(q);
        });
    }

    static Position = class extends THREE.Vector3 {
        constructor(entity, x = 0, y = 0, z = 0) {
            super(x, y, z);
            this.entity = entity;
        }

        set x(val) {
            this.entity?._instances.forEach((obj) => obj.position.x += val - this._x);
            this._x = val;
        }

        set y(val) {
            this.entity?._instances.forEach((obj) => obj.position.y += val - this._y);
            this._y = val;
        }

        set z(val) {
            this.entity?._instances.forEach((obj) => obj.position.z += val - this._z);
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
}
