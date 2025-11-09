import * as THREE from 'three';

export class MultiInstancedEntity {
    _instances = [];

    constructor(owner) {
        this.owner = owner;
        this.position = new MultiInstancedEntity.Position(this);
        this.rotation = new MultiInstancedEntity.Rotation(this);
        this.quaternion = new MultiInstancedEntity.Quaternion(this);
        this.scale = new MultiInstancedEntity.Scale(this);

        this.rotation._onChange(() => this.quaternion.setFromEuler(this.rotation, false));
        this.quaternion._onChange(() => this.rotation.setFromQuaternion(this.quaternion, undefined, false));
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
        this.quaternion.multiply(q);
        this._instances.forEach(obj => {
            obj.position.sub(this.position)
                .applyQuaternion(q)
                .add(this.position);

            obj.quaternion.premultiply(q);
        });
    }

    lookAt(target) {
        // 1. Compute direction vector from object to target
        const dir = new THREE.Vector3();

        dir.subVectors(target, this.position).normalize();

        // If direction is near zero vector, skip
        if (dir.lengthSq() === 0) return;

        // 2. Define an up vector (usually +Y)
        const up = new THREE.Vector3(0, 1, 0);

        // 3. Compute the right vector
        const right = new THREE.Vector3().crossVectors(up, dir).normalize();

        // 4. Recompute the true up vector (orthogonalize)
        up.crossVectors(dir, right).normalize();

        // 5. Build a rotation matrix
        const m = new THREE.Matrix4();
        m.makeBasis(right, up, dir); // columns are the local axes of the object

        // 6. Convert matrix to quaternion
        this.quaternion.setFromRotationMatrix(m);

        // Optionally, update rotation if needed:
        // object.rotation.setFromQuaternion(object.quaternion);
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

    static Rotation = class extends THREE.Euler {
        constructor(entity, x = 0, y = 0, z = 0, order = THREE.Euler.DEFAULT_ORDER) {
            super(x, y, z, order);
            this.entity = entity;
        }

        set x(val) {
            this.entity.rotateX(val - this._x);
            this._x = val;
        }

        set y(val) {
            this.entity.rotateY(val - this._y);
            this._y = val;
        }

        set z(val) {
            this.entity.rotateZ(val - this._z);
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

    static Quaternion = class extends THREE.Quaternion {
        constructor(entity, x = 0, y = 0, z = 0, w = 1) {
            super(x, y, z, w);
            this.entity = entity;
        }

        set x(val) {
            this.entity?._instances.forEach((obj) => obj.quaternion.x += val - this._x);
            this._x = val;
        }

        set y(val) {
            this.entity?._instances.forEach((obj) => obj.quaternion.y += val - this._y);
            this._y = val;
        }

        set z(val) {
            this.entity?._instances.forEach((obj) => obj.quaternion.z += val - this._z);
            this._z = val;
        }

        set w(val) {
            this.entity?._instances.forEach((obj) => obj.quaternion.w += val - this._w);
            this._w = val;
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

        get w() {
            return this._w;
        }
    }

    static Scale = class extends THREE.Vector3 {
        constructor(entity, x = 1, y = 1, z = 1) {
            super(x, y, z);
            this.entity = entity;
        }

        set x(val) {
            this.entity?._instances.forEach((obj) => obj.scale.x += val - this._x);
            this._x = val;
        }

        set y(val) {
            this.entity?._instances.forEach((obj) => obj.scale.y += val - this._y);
            this._y = val;
        }

        set z(val) {
            this.entity?._instances.forEach((obj) => obj.scale.z += val - this._z);
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

class DummyOwner {
    constructor() {
        // this.position = new THREE.Vector3();
        // this.rotation = new THREE.Euler();
        // this.quaternion = new THREE.Quaternion();
        // this.scale = new THREE.Vector3();
    }
    addInstances(n, fn) {}
}

export class MultiInstancedEntityContainer extends MultiInstancedEntity {
    static #owner = new DummyOwner();
    constructor(instances) {
        super(MultiInstancedEntityContainer.#owner);
        this._instances = instances;
    }
}
