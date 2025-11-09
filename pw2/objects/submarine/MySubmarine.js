import * as THREE from 'three';

class MySubmarine extends THREE.Object3D {
    constructor(app, size = 1) {
        super();
        this.app = app;
        this.size = size;
        const s = this.size;

        this.controlsEnabled = true;

        this.forwardSpeed = 0;
        this.verticalSpeed = 0;
        this.maxForwardSpeed = 10;
        this.maxVerticalSpeed = 5;

        this.minY = 5;
        this.maxY = 30;

        this.forwardAccel = 6;
        this.verticalAccel = 4;
        this.yawRate = Math.PI; 

        this._keys = { 
            w: false, 
            s: false, 
            a: false, 
            d: false, 
            p: false, 
            l: false
        };

        this._onKeyDown = this._onKeyDown.bind(this);
        this._onKeyUp = this._onKeyUp.bind(this);

        window.addEventListener('keydown', this._onKeyDown);
        window.addEventListener('keyup', this._onKeyUp);

        this.fpvCamera = new THREE.PerspectiveCamera(75, 1.0, 0.1, 1000);
        // adjust later
        this.fpvCamera.position.set(-s * 1.0, s * 0.7, 0);
        this.fpvCamera.rotation.y = Math.PI / 2;
        this.add(this.fpvCamera);

        this.buildSubmarine();
    }

    buildSubmarine() {
        const s = this.size;
        const hullLength = s * 3.0;
        const hullRadius = s * 0.5;

        const hullGeo = new THREE.CylinderGeometry(hullRadius, hullRadius, hullLength, 24, 1);
        const hullMat = new THREE.MeshPhongMaterial({
            color: 0xffdd77, // 0xffcc00,
            shininess: 30,
            map: new THREE.TextureLoader().load('textures/pringles.png'),
        });
        const hull = new THREE.Mesh(hullGeo, hullMat);
        hull.rotation.z = Math.PI / 2;
        this.add(hull);
    }

    _onKeyDown(ev) {
        const k = ev.key.toLowerCase();
        if (!this.controlsEnabled) return;
        if (k in this._keys) {
            this._keys[k] = true;
            ev.preventDefault();
        }
    }

    _onKeyUp(ev) {
        const k = ev.key.toLowerCase();
        if (!this.controlsEnabled) return;
        if (k in this._keys) {
            this._keys[k] = false;
            ev.preventDefault();
        }
    }

    update(dt) {
        if (!dt || dt <= 0) return;

        if (this._keys.w) {
            this.forwardSpeed -= this.forwardAccel * dt;
        }
        if (this._keys.s) {
            this.forwardSpeed += this.forwardAccel * dt;
        }
        this.forwardSpeed = Math.max(-this.maxForwardSpeed, Math.min(this.maxForwardSpeed, this.forwardSpeed));

        if (this._keys.p) {
            this.verticalSpeed += this.verticalAccel * dt;
        }
        if (this._keys.l) {
            this.verticalSpeed -= this.verticalAccel * dt;
        }
        this.verticalSpeed = Math.max(-this.maxVerticalSpeed, Math.min(this.maxVerticalSpeed, this.verticalSpeed));

        if (this._keys.a) {
            this.rotation.y += this.yawRate * dt;
        }
        if (this._keys.d) {
            this.rotation.y -= this.yawRate * dt;
        }

        const localForward = new THREE.Vector3(1, 0, 0);
        localForward.applyQuaternion(this.quaternion); // world direction
        this.position.addScaledVector(localForward, this.forwardSpeed * dt);
        this.position.y += this.verticalSpeed * dt;

        if (this.position.y < this.minY) {
            this.position.y = this.minY;
            if (this.verticalSpeed < 0) this.verticalSpeed = 0;
        } else if (this.position.y > this.maxY) {
            this.position.y = this.maxY;
            if (this.verticalSpeed > 0) this.verticalSpeed = 0;
        }
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }

    setControlsEnabled(enabled) {
        this.controlsEnabled = !!enabled;
        if (!this.controlsEnabled) {
            // clear keys to avoid stuck input
            Object.keys(this._keys).forEach(k => this._keys[k] = false);
        }
    }
}

export { MySubmarine };