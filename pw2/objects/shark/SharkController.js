import * as THREE from 'three';
import { MySharkLOD } from './MySharkLOD.js';
import { SgiUtils } from '../../SgiUtils.js';

class SharkController {
    /**
     * @param {MyApp} app
     * @param {THREE.Scene} scene
     * @param {Object} opts
     */
    constructor(app, scene, {
        size = 1,
        assetsPath = 'models/shark/',
        sharkSwimSpeed = 4.0,
        sharkTurnSpeed = 0.8,
        sharkPatrolCenter = new THREE.Vector3(0, 15, 0),
        sharkPatrolRadius = 40
    } = {}) {
        this.app = app;
        this.scene = scene;

        this.size = size;
        this.assetsPath = assetsPath;
        this.sharkSwimSpeed = sharkSwimSpeed;
        this.sharkTurnSpeed = sharkTurnSpeed;
        this.sharkPatrolCenter = sharkPatrolCenter;
        this.sharkPatrolRadius = sharkPatrolRadius;

        this.shark = null;
        this.sharkTarget = new THREE.Vector3();

        this._sharkTargetQuaternion = new THREE.Quaternion();
        this._sharkLookAtMatrix = new THREE.Matrix4();

        this._built = false;
    }

    buildShark() {
        if (this._built) return;

        this.shark = new MySharkLOD(this.app, {
            size: this.size,
            assetsPath: this.assetsPath
        });

        this.shark.position.copy(this.sharkPatrolCenter)
            .add(new THREE.Vector3(
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius),
                SgiUtils.rand(-5, 5),
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius)
            ));

        this.scene.add(this.shark);

        this.pickNewSharkTarget();

        this._built = true;
    }

    pickNewSharkTarget() {
        this.sharkTarget.copy(this.sharkPatrolCenter)
            .add(new THREE.Vector3(
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius),
                SgiUtils.rand(-5, 5),
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius)
            ));
    }

    update(dt) {
        // Stop if shark isn't loaded
        if (!this.shark || !this.shark.visible) return;

        // Check if we've reached the target
        const distanceToTarget = this.shark.position.distanceTo(this.sharkTarget);
        if (distanceToTarget < 5.0) {
            this.pickNewSharkTarget();
        }

        // Move the shark towards the target
        const direction = new THREE.Vector3()
            .subVectors(this.sharkTarget, this.shark.position)
            .normalize();
        this.shark.position.add(direction.multiplyScalar(this.sharkSwimSpeed * dt));

        // Smoothly rotate the shark to look at the target
        this._sharkLookAtMatrix.lookAt(this.sharkTarget, this.shark.position, this.shark.up);
        this._sharkTargetQuaternion.setFromRotationMatrix(this._sharkLookAtMatrix);

        this.shark.quaternion.slerp(this._sharkTargetQuaternion, this.sharkTurnSpeed * dt);
    }
}

export { SharkController };