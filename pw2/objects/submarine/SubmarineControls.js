import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';
import { BrainCoral } from '../corals/BrainCoral.js';
import { TubeCoral } from '../corals/TubeCoral.js';

class SubmarineControls {
    constructor(submarine, colliders = []) {
        this.submarine = submarine;
        this.colliders = colliders;
        
        this._keys = { 
            w: false, 
            s: false, 
            a: false, 
            d: false, 
            p: false, 
            l: false,
            o: false
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

        // Toggle front light with 'O' key
        if (this._keys.o && this.submarine.frontLight && !this._lightToggleCooldown) {
            this.submarine.frontLight.visible = !this.submarine.frontLight.visible;
            this._lightToggleCooldown = true;
            setTimeout(() => {
                this._lightToggleCooldown = false;
            }, 200); // Prevent rapid toggling
        }

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

        const forwardBrake = this.submarine.forwardAccel;
        if (!this._keys.w && !this._keys.s) {
            if (Math.abs(this.submarine.forwardSpeed) < 0.01) {
                this.submarine.forwardSpeed = 0;
            } else if (this.submarine.forwardSpeed > 0) {
                this.submarine.forwardSpeed = Math.max(0, this.submarine.forwardSpeed - forwardBrake * dt);
            } else {
                this.submarine.forwardSpeed = Math.min(0, this.submarine.forwardSpeed + forwardBrake * dt);
            }
        }

        const verticalBrake = this.submarine.verticalAccel * 2.0;
        if (!this._keys.p && !this._keys.l) {
            if (Math.abs(this.submarine.verticalSpeed) < 0.01) {
                this.submarine.verticalSpeed = 0;
            } else if (this.submarine.verticalSpeed > 0) {
                this.submarine.verticalSpeed = Math.max(0, this.submarine.verticalSpeed - verticalBrake * dt);
            } else {
                this.submarine.verticalSpeed = Math.min(0, this.submarine.verticalSpeed + verticalBrake * dt);
            }
        }

        if (this._keys.a) {
            this.submarine.rotation.y += this.submarine.yawRate * dt;
        }
        if (this._keys.d) {
            this.submarine.rotation.y -= this.submarine.yawRate * dt;
        }

        const deltaPos = new THREE.Vector3(1, 0, 0)
            .applyQuaternion(this.submarine.quaternion) // rotate vector according to submarine's orientation
            .multiplyScalar(this.submarine.forwardSpeed * dt) // multiply by speed
            ;
        deltaPos.y += this.submarine.verticalSpeed * dt;

        // Handle turning bubbles (A/D keys without W)
        this.submarine.turningBubbleDirection = null;
        if (!this._keys.w && !this._keys.s && !this._keys.p && !this._keys.l) {
            if (this._keys.a) {
                this.submarine.turningBubbleDirection = 'right';
            } else if (this._keys.d) {
                this.submarine.turningBubbleDirection = 'left';
            }
        }

        // if (this.submarine.position.y < this.submarine.minY) {
        //     this.submarine.position.y = this.submarine.minY;
        //     if (this.submarine.verticalSpeed < 0) this.submarine.verticalSpeed = 0;
        // } else
        if (this.submarine.position.y > this.submarine.maxY) {
            this.submarine.position.y = this.submarine.maxY;
            if (this.submarine.verticalSpeed > 0) this.submarine.verticalSpeed = 0;
        }

        const boundingSphere = this.submarine.userData?.boundingSphere?.clone();
        // Collisions
        if (boundingSphere) {
            if (!this.submarine.boundingSphereHelper) {
                this.submarine.boundingSphereHelper = new THREE.Mesh(
                    new THREE.SphereGeometry(boundingSphere.radius),
                    new THREE.MeshBasicMaterial({
                        wireframe: true,
                        transparent: true,
                        opacity: 0.1,
                    }),
                );
                this.submarine.boundingSphereHelper.visible = false;
                this.submarine.add(this.submarine.boundingSphereHelper);
            }

            this.submarine.position.add(deltaPos);
            boundingSphere.center.add(this.submarine.position);

            const boundingBox = new THREE.Box3(
                boundingSphere.center.clone().sub(new THREE.Vector3().setScalar(boundingSphere.radius)),
                boundingSphere.center.clone().add(new THREE.Vector3().setScalar(boundingSphere.radius)),
            );

            // Get the normal of the first intersection
            let intersected = false;
            const normal = new THREE.Vector3();

            [BrainCoral, TubeCoral].forEach(CoralType => {
                if (intersected)
                    return;
                CoralType.defaultOwner.bvh?.intersectBox(boundingBox, (id) => {
                    const coral = CoralType.defaultOwner.instances[id].userData.owner;
                    const distVec = coral.position.clone().sub(this.submarine.position);
                    if (distVec.length() <= coral.collisionRadius + boundingSphere.radius) {
                        intersected = true;
                        normal.copy(distVec).normalize();
                    }
                });
            });

            for (const collider of this.colliders) {
                if (intersected)
                    break;
                collider.shapecast({
                    intersectsBounds: (box) => box.intersectsSphere(boundingSphere),
                    intersectsTriangle: (tri) => {
                        if (tri.intersectsSphere(boundingSphere)) {
                            tri.getNormal(normal);
                            return intersected = true;
                        }
                        return false;
                    }
                });
            }

            if (intersected) do {
                this.submarine.position.sub(deltaPos);

                // vslide​=v−(v⋅n)n
                const dotProduct = deltaPos.clone().dot(normal);
                const slide = deltaPos.clone()
                    .sub(normal.clone()
                    .multiplyScalar(
                        Math.min(10, deltaPos.length() / Math.abs(dotProduct)) // make normal stronger the bigger the angle between V and N is
                        *
                        dotProduct)
                    );

                if (isNaN(slide.x))
                    break;

                this.submarine.position.add(slide);
                boundingSphere.center.sub(deltaPos).add(slide);

                for (const collider of this.colliders) {
                    if (collider.intersectsSphere(boundingSphere)) {
                        this.submarine.position.sub(slide);
                        break;
                    }
                }
            } while(false);
        }

        try {
            const appContents = this.submarine.app && this.submarine.app.contents;
            const terrain = appContents && appContents.terrain;
            if (terrain) {
                const box = new THREE.Box3().setFromObject(terrain);
                if (!box.isEmpty()) {
                    // keep submarine inside the terrain XZ extents (leave a small margin)
                    const margin = 0.5;
                    const minX = box.min.x + margin;
                    const maxX = box.max.x - margin;
                    const minZ = box.min.z + margin;
                    const maxZ = box.max.z - margin;

                    this.submarine.position.x = Math.max(minX, Math.min(maxX, this.submarine.position.x));
                    this.submarine.position.z = Math.max(minZ, Math.min(maxZ, this.submarine.position.z));
                }
            }
        } catch (e) {
            // silent fail if terrain not available or calculation fails
        }
    }

    dispose() {
        window.removeEventListener('keydown', this._onKeyDown);
        window.removeEventListener('keyup', this._onKeyUp);
    }
}

export { SubmarineControls };