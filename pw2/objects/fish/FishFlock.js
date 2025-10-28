import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';

class FishFlock {
    /**
     * Creates a FishFlock simulation.
     * @param {THREE.Object3D[]} fishArray - Array of fish objects to control.
     * @param {object} [options] - Configuration options for the flocking behavior.
     * @param {number} [options.maxSpeed=4] - Max speed a fish can travel.
     * @param {number} [options.maxForce=3.5] - Max steering force (prevents jerky turns).
     * @param {number} [options.neighborRadius=4] - How far a fish "sees" to find flockmates (for alignment/cohesion).
     * @param {number} [options.separationRadius=2] - "Personal space" - fish steer away if others are this close.
     * @param {number} [options.alignmentWeight=1.2] - How strongly fish match neighbors' direction.
     * @param {number} [options.cohesionWeight=1] - How strongly fish move toward neighbors' center.
     * @param {number} [options.separationWeight=1.8] - How strongly fish avoid close neighbors.
     * @param {THREE.Vector3} [options.center] - The `Vector3` anchor point the flock stays near.
     * @param {number} [options.keepRadius=30] - Max distance fish can stray from the center.
     * @param {number} [options.boundaryForce=3] - How strongly fish are pushed back to the center.
     * @param {number} [options.minY=2] - Minimum vertical position (floor).
     * @param {number} [options.maxY=50] - Maximum vertical position (surface).
     * @param {number} [options.verticalWeight=2.5] - How strongly fish are pushed from floor/surface.
     * @param {number} [options.wanderIntensity=0.5] - Adds random jitter for a more natural look.
     */
    constructor(fishArray = [], options = {}) {
        this.fish = fishArray.slice(); // references to fish objects
        this.boids = []; // internal state per fish

        // default parameters
        const defaults = {
            maxSpeed: 4,
            maxForce: 3.5,
            neighborRadius: 4,
            separationRadius: 2,
            alignmentWeight: 1.2,
            cohesionWeight: 1,
            separationWeight: 1.8,
            center: new THREE.Vector3(0, 3, 0),
            keepRadius: 30,
            boundaryForce: 3,
            // vertical constraints
            minY: 2,
            maxY: 50,
            verticalWeight: 2.5,
            wanderIntensity: 0.5
        };

        this.opt = Object.assign({}, defaults, options);

        // initialize boids
        const startRadius = this.opt.startRadius !== undefined ? this.opt.startRadius : 6;
        const startMinY = this.opt.minY !== undefined ? this.opt.minY : 2;
        const startMaxY = Math.max(startMinY + 1, (this.opt.startMaxY !== undefined ? this.opt.startMaxY : startMinY + 4));

        for (let i = 0; i < this.fish.length; ++i) {
            const f = this.fish[i];
            // random local position around flock center
            const pos = new THREE.Vector3(
                SgiUtils.rand(-0.5, 0.5) * 2 * startRadius,
                startMinY + SgiUtils.rand(0, 1) * (startMaxY - startMinY),
                SgiUtils.rand(-0.5, 0.5) * 2 * startRadius
            );
            const vel = new THREE.Vector3(
                SgiUtils.rand(-0.5, 0.5) * 1.5,
                SgiUtils.rand(-0.5, 0.5) * 0.5,
                SgiUtils.rand(-0.5, 0.5) * 1.5
            );
            this.boids.push({
                fish: f,
                position: pos,
                velocity: vel,
                acceleration: new THREE.Vector3(),
            });
            // set initial local position into fish (overrides any preset)
            f.position.copy(pos);
        }

        // reusable temp vectors
        this._steer = new THREE.Vector3();
        this._vec = new THREE.Vector3();
        this._vec2 = new THREE.Vector3();
        this._center = new THREE.Vector3();
    }

    // Helper to limit a vector's length to cap fish speed and steer force
    limit(vec, max) {
        const l = vec.length();
        if (l > max) vec.multiplyScalar(max / l);
    }

    update(dt) {
        if (dt <= 0) return;
        const {
            maxSpeed, maxForce, neighborRadius, separationRadius,
            alignmentWeight, cohesionWeight, separationWeight,
            center, keepRadius, boundaryForce,
            minY, maxY, verticalWeight, wanderIntensity
        } = this.opt;

        // sync positions from fish objects to boids
        for (let i = 0; i < this.boids.length; ++i) {
            this.boids[i].position.copy(this.boids[i].fish.position);
        }

        for (let i = 0; i < this.boids.length; ++i) {
            const bi = this.boids[i];
            const pos = bi.position;
            const vel = bi.velocity;

            // accumulators
            let separation = new THREE.Vector3();
            let alignment = new THREE.Vector3();
            let cohesion = new THREE.Vector3();

            let totalNeighbors = 0;
            let totalSeparation = 0;

            for (let j = 0; j < this.boids.length; ++j) {
                if (i === j) continue;
                const bj = this.boids[j];
                const d = pos.distanceTo(bj.position);
                if (d < neighborRadius) {
                    // neighbor for alignment & cohesion
                    alignment.add(bj.velocity);
                    cohesion.add(bj.position);
                    totalNeighbors++;
                }
                if (d < separationRadius && d > 0) {
                    // separation (away from close neighbors)
                    const away = new THREE.Vector3().subVectors(pos, bj.position);
                    away.normalize();
                    away.divideScalar(d); // weight by inverse distance
                    separation.add(away);
                    totalSeparation++;
                }
            }

            // compute steering forces
            let steer = new THREE.Vector3();

            if (totalNeighbors > 0) {
                // alignment
                alignment.divideScalar(totalNeighbors);
                alignment.normalize();
                alignment.multiplyScalar(maxSpeed);
                const alignSteer = new THREE.Vector3().subVectors(alignment, vel);
                this.limit(alignSteer, maxForce);
                alignSteer.multiplyScalar(alignmentWeight);
                steer.add(alignSteer);

                // cohesion
                cohesion.divideScalar(totalNeighbors);
                const desired = new THREE.Vector3().subVectors(cohesion, pos);
                desired.normalize();
                desired.multiplyScalar(maxSpeed);
                const cohSteer = new THREE.Vector3().subVectors(desired, vel);
                this.limit(cohSteer, maxForce);
                cohSteer.multiplyScalar(cohesionWeight);
                steer.add(cohSteer);
            }

            if (totalSeparation > 0) {
                separation.divideScalar(totalSeparation);
                separation.normalize();
                separation.multiplyScalar(maxSpeed);
                const sepSteer = new THREE.Vector3().subVectors(separation, vel);
                this.limit(sepSteer, maxForce);
                sepSteer.multiplyScalar(separationWeight);
                steer.add(sepSteer);
            }

            // small wander/jitter for more natural look
            const wander = new THREE.Vector3(
                (Math.random() - 0.5) * wanderIntensity,
                (Math.random() - 0.5) * wanderIntensity * 0.25,
                (Math.random() - 0.5) * wanderIntensity
            );
            steer.add(wander);

            // boundary / keep close to center
            const distToCenter = pos.distanceTo(center);
            if (distToCenter > keepRadius) {
                const toCenter = new THREE.Vector3().subVectors(center, pos);
                toCenter.normalize();
                toCenter.multiplyScalar(boundaryForce);
                steer.add(toCenter);
            }

            // vertical correction
            if (pos.y < minY) {
                const up = new THREE.Vector3(0, (minY - pos.y) * verticalWeight, 0);
                steer.add(up);
            } else if (pos.y > maxY) {
                const down = new THREE.Vector3(0, -(pos.y - maxY) * (verticalWeight * 0.5), 0);
                steer.add(down);
            }

            // integrate acceleration/velocity (acceleration is per second)
            bi.acceleration.copy(steer);
            bi.velocity.add(bi.acceleration.clone().multiplyScalar(dt));
            this.limit(bi.velocity, maxSpeed);

            // update position
            bi.position.add(bi.velocity.clone().multiplyScalar(dt));

            // enforce minimum height hard clamp to avoid tunneling under terrain
            if (bi.position.y < minY) bi.position.y = minY;

            // write back into fish local position
            bi.fish.position.copy(bi.position);
            
            // orient fish to movement direction
            if (bi.velocity.lengthSq() > 1e-6) {
                // calculate the target point in LOCAL space
                this._vec.copy(bi.position).add(bi.velocity);

                const parent = bi.fish.parent;

                if (parent) {
                    parent.updateWorldMatrix(true, false);

                    // convert the local target (this._vec) to a WORLD target (this._vec2)
                    this._vec2.copy(this._vec).applyMatrix4(parent.matrixWorld);

                    // make the fish look at the WORLD-space target
                    bi.fish.lookAt(this._vec2);
                } else {
                    // fallback if no parent: just look at local target
                    bi.fish.lookAt(this._vec);
                }
            }

            // bi.fish is the wrapper Group, children[0] is the MyFishLOD
            const fishLOD = bi.fish.children[0]; 
            if (fishLOD && fishLOD.animate) {
                const speedFactor = bi.velocity.length() / this.opt.maxSpeed;
                fishLOD.animate(dt, speedFactor);
            }
        }
    }
}

export { FishFlock };