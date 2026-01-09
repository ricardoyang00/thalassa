import * as THREE from 'three';

/**
 * MarineSnow - CPU-updated particle field for slow-falling organic particles.
 * - Complex horizontal drift (compound sine waves) for organic feel.
 * - Depth-based turbulence simulation.
 * - Efficient recycling at seabed boundaries.
 * - Soft circle texture generated in-memory.
 */
class MarineSnow {
    /**
     * @param {THREE.Scene} scene
     * @param {Object} opts - configuration options
     * @param {Object} owner - reference to MyContents (used for terrain collision)
     */
    constructor(scene, opts = {}, owner = null) {
        this.scene = scene;
        this.owner = owner;

        // Configuration
        this.count = opts.count || 2000;
        this.area = opts.area || (owner ? owner.terrainSize : 100);
        this.topY = opts.topY || 40;
        this.bottomY = opts.bottomY || 1;
        this.seabedOffset = opts.seabedOffset || 0.5;

        // Particle appearance
        this.size = opts.size || 1.5;
        this.color = opts.color || 0xffffff;
        this.opacity = opts.opacity || 0.6;

        this._time = 0;

        this._createPoints();
        this.reset(); // Initial scatter
    }

    _createPoints() {
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(this.count * 3);
        const speeds = new Float32Array(this.count);
        const offsets = new Float32Array(this.count); // Random phase offset for wave motion
        const drift = new Float32Array(this.count); // Individual horizontal drift strength

        for (let i = 0; i < this.count; ++i) {
            // Positions initialized in reset()
            
            // Varied fall speeds (some heavier particles, some floaty)
            speeds[i] = 0.2 + Math.random() * 0.6; 
            
            // Random phase to desynchronize the wave motion
            offsets[i] = Math.random() * Math.PI * 2;
            
            // How much this specific particle is affected by currents
            drift[i] = 0.5 + Math.random() * 1.5; 
        }

        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        
        // Material - using a generated soft circular sprite
        const sprite = this._getCircleSprite();

        const material = new THREE.PointsMaterial({
            color: this.color,
            size: this.size,
            map: sprite,
            transparent: true,
            opacity: this.opacity,
            alphaTest: 0.01, // Keep visible but discard fully transparent
            depthWrite: false, // Don't block other transparent objects
            blending: THREE.AdditiveBlending,
            sizeAttenuation: true
        });

        this.geometry = geometry;
        this.positions = positions;
        this.speeds = speeds;
        this.offsets = offsets;
        this.drift = drift;

        this.points = new THREE.Points(geometry, material);
        // Disable frustum culling to prevent flickering
        this.points.frustumCulled = false; 
        
        this.scene.add(this.points);
    }

    // Generate a simple soft circle texture in memory
    _getCircleSprite() {
        const canvas = document.createElement('canvas');
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext('2d');
        
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.5)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);
        
        const texture = new THREE.CanvasTexture(canvas);
        return texture;
    }

    // Scatter all particles initially
    reset() {
        const half = this.area / 2;
        for (let i = 0; i < this.count; ++i) {
            const ix = i * 3;
            this.positions[ix] = (Math.random() - 0.5) * this.area;
            this.positions[ix + 2] = (Math.random() - 0.5) * this.area;
            this.positions[ix + 1] = this.bottomY + Math.random() * (this.topY - this.bottomY);
        }
        this.geometry.attributes.position.needsUpdate = true;
    }

    /**
     * Respawn a single particle at the top
     * @param {number} index - Index of the particle (stride 1)
     */
    _respawn(index) {
        const ix = index * 3;
        
        // Randomize X/Z again so they don't fall in lines
        this.positions[ix] = (Math.random() - 0.5) * this.area;
        this.positions[ix + 2] = (Math.random() - 0.5) * this.area;
        
        // Respawn at the top
        this.positions[ix + 1] = this.topY;
    }

    /**
     * Update loop
     * @param {number} dt - Delta time in seconds
     */
    update(dt) {
        this._time += dt;
        
        // Global current varying slowly over time
        const globalCurrentX = Math.sin(this._time * 0.1) * 0.5;
        const globalCurrentZ = Math.cos(this._time * 0.15) * 0.5;

        // --- SAFETY CHECK ---
        // Check if terrain data is actually loaded before we try to read it.
        let isTerrainReady = false;
        if (this.owner && this.owner.terrain && this.owner.terrain.mesh && 
            this.owner.terrain.mesh.material && 
            this.owner.terrain.mesh.material.displacementMap && 
            this.owner.terrain.mesh.material.displacementMap.image &&
            this.owner.terrain.mesh.material.displacementMap.image.width) {
            isTerrainReady = true;
        }

        const half = this.area / 2;

        for (let i = 0; i < this.count; ++i) {
            const ix = i * 3;
            let x = this.positions[ix];
            let y = this.positions[ix + 1];
            let z = this.positions[ix + 2];

            // 1. Vertical Movement (Gravity)
            y -= this.speeds[i] * dt;

            // 2. Horizontal Meandering (Simulating water turbulence)
            const phase = this.offsets[i];
            const d = this.drift[i];
            
            x += (globalCurrentX + Math.sin(this._time * 0.5 + phase) * d) * dt;
            z += (globalCurrentZ + Math.cos(this._time * 0.3 + phase) * d) * dt;

            // Wrap horizontal bounds
            if (x < -half) x += this.area;
            if (x > half) x -= this.area;
            if (z < -half) z += this.area;
            if (z > half) z -= this.area;

            // 3. Seabed Collision / Recycling
            let seabedY = this.bottomY;
            
            // Only check precise depth if terrain is fully loaded
            if (isTerrainReady) {
                // Check if x,z is within terrain bounds approximately
                if (Math.abs(x) < half && Math.abs(z) < half) {
                    try {
                        seabedY = this.owner.terrain.displacementAtXY(x, z);
                    } catch (e) {
                        // Fallback in case of rare edge cases
                        seabedY = this.bottomY;
                    }
                }
            }

            // Check if hit bottom
            if (y < seabedY + this.seabedOffset) {
                this._respawn(i);
                // Update local vars
                x = this.positions[ix];
                y = this.positions[ix + 1];
                z = this.positions[ix + 2];
            }

            // Write back
            this.positions[ix] = x;
            this.positions[ix + 1] = y;
            this.positions[ix + 2] = z;
        }

        this.geometry.attributes.position.needsUpdate = true;
    }
}

export { MarineSnow };