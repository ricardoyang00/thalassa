import * as THREE from 'three';

class SubmarineControls {
    constructor(submarine) {
        this.submarine = submarine;
        
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
    }

    _onKeyDown(ev) {
        const k = ev.key.toLowerCase();
        if (!this.submarine.controlsEnabled) return;
        if (k in this._keys) {
            this._keys[k] = true;
            ev.preventDefault();
        }
    }

    _onKeyUp(ev) {
        const k = ev.key.toLowerCase();
        if (!this.submarine.controlsEnabled) return;
        if (k in this._keys) {
            this._keys[k] = false;
            ev.preventDefault();
        }
    }

    update(dt) {
        if (!dt || dt <= 0) return;

        if (this._keys.w) {
            this.submarine.forwardSpeed -= this.submarine.forwardAccel * dt;
        }
        if (this._keys.s) {
            this.submarine.forwardSpeed += this.submarine.forwardAccel * dt;
        }
        this.submarine.forwardSpeed = Math.max(
            -this.submarine.maxForwardSpeed, 
            Math.min(this.submarine.maxForwardSpeed, this.submarine.forwardSpeed)
        );

        if (this._keys.p) {
            this.submarine.verticalSpeed += this.submarine.verticalAccel * dt;
        }
        if (this._keys.l) {
            this.submarine.verticalSpeed -= this.submarine.verticalAccel * dt;
        }
        this.submarine.verticalSpeed = Math.max(
            -this.submarine.maxVerticalSpeed, 
            Math.min(this.submarine.maxVerticalSpeed, this.submarine.verticalSpeed)
        );

        if (this._keys.a) {
            this.submarine.rotation.y += this.submarine.yawRate * dt;
        }
        if (this._keys.d) {
            this.submarine.rotation.y -= this.submarine.yawRate * dt;
        }

        const localForward = new THREE.Vector3(1, 0, 0);
        localForward.applyQuaternion(this.submarine.quaternion);
        
        this.submarine.position.addScaledVector(localForward, this.submarine.forwardSpeed * dt);
        this.submarine.position.y += this.submarine.verticalSpeed * dt;

        if (this.submarine.position.y < this.submarine.minY) {
            this.submarine.position.y = this.submarine.minY;
            if (this.submarine.verticalSpeed < 0) this.submarine.verticalSpeed = 0;
        } else if (this.submarine.position.y > this.submarine.maxY) {
            this.submarine.position.y = this.submarine.maxY;
            if (this.submarine.verticalSpeed > 0) this.submarine.verticalSpeed = 0;
        }
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}

export { SubmarineControls };