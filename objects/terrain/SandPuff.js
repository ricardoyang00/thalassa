import * as THREE from 'three';

class SandPuffManager {
    constructor(scene, options = {}) {
        this.scene = scene;
        this.puffs = [];
        this.gravity = options.gravity !== undefined ? options.gravity : -2.0; 
        this.maxPuffs = options.maxPuffs || 10;
        this.particleCapacity = options.particleCapacity || 300; 
        this._pool = [];

        this.material = new THREE.ShaderMaterial({
            uniforms: {
                uSize: { value: 6.0 },
                uColor: { value: new THREE.Color(0x706149) }, 
            },
            vertexShader: `
                attribute float aAlpha;
                attribute float aRotation;
                attribute float aLifeRatio;
                
                varying float vAlpha;
                varying float vRotation;
                
                uniform float uSize;
                
                void main() {
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    
                    // Expansion: Grow from 1.0 to 2.5 size over life
                    float growth = 1.0 + (aLifeRatio * 1.5); 
                    
                    float size = (uSize * growth) * (300.0 / -mvPosition.z);
                    gl_PointSize = size;
                    gl_Position = projectionMatrix * mvPosition;
                    
                    vAlpha = aAlpha;
                    vRotation = aRotation;
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                
                varying float vAlpha;
                varying float vRotation;
                
                void main() {
                    // 1. Get coordinates from 0.0 to 1.0
                    vec2 coord = gl_PointCoord - vec2(0.5);
                    
                    // 2. Rotate coordinates (to make the puff tumble)
                    float c = cos(vRotation);
                    float s = sin(vRotation);
                    vec2 rotated = vec2(coord.x * c - coord.y * s, coord.x * s + coord.y * c);
                    
                    // 3. Procedural Shape (Squashed Circle)
                    // We multiply one axis to make it an oval, so rotation is visible
                    rotated.y *= 1.2; 
                    
                    // 4. Calculate Distance for Softness
                    float dist = length(rotated) * 2.0; // 0.0 at center, 1.0 at edge
                    
                    // 5. Create Soft Edge (No pixelation!)
                    // 1.0 - dist makes center 1, edge 0
                    // smoothstep cleans it up
                    float shapeAlpha = 1.0 - smoothstep(0.0, 1.0, dist);
                    
                    // 6. Apply Non-Linear Fade (Makes it look like dense core, soft edge)
                    shapeAlpha = pow(shapeAlpha, 2.0);
                    
                    // Artificial Lighting Boost (* 3.0)
                    vec3 rgb = uColor * 3.0;
                    
                    // Final Color
                    gl_FragColor = vec4(rgb, shapeAlpha * vAlpha * 0.8);
                }
            `,
            transparent: true,
            depthWrite: false,
            blending: THREE.NormalBlending,
        });
    }

    _createPoints(capacity) {
        const geo = new THREE.BufferGeometry();
        
        const positions = new Float32Array(capacity * 3);
        const alphas = new Float32Array(capacity);
        const rotations = new Float32Array(capacity);
        const lifeRatios = new Float32Array(capacity);
        
        const velocities = new Float32Array(capacity * 3);
        const lives = new Float32Array(capacity);
        const ages = new Float32Array(capacity);

        for (let i = 0; i < capacity; ++i) {
            positions[3 * i + 0] = positions[3 * i + 1] = positions[3 * i + 2] = 0;
            alphas[i] = 0.0;
            rotations[i] = 0.0;
            lifeRatios[i] = 0.0;
            lives[i] = 0.0;
            ages[i] = 0.0;
            velocities[3 * i + 0] = velocities[3 * i + 1] = velocities[3 * i + 2] = 0;
        }

        geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphas, 1));
        geo.setAttribute('aRotation', new THREE.BufferAttribute(rotations, 1));
        geo.setAttribute('aLifeRatio', new THREE.BufferAttribute(lifeRatios, 1));
        
        geo.userData = { velocities, lives, ages, capacity };

        const points = new THREE.Points(geo, this.material);
        points.frustumCulled = false;
        return points;
    }

    spawn(position, opts = {}) {
        const count = Math.min(opts.count || 60, this.particleCapacity);
        const spread = opts.spread || 0.8;
        const speed = opts.speed || 3.0;
        const life = opts.life || 2.0;
        const size = opts.size || 15.0; // Increased base size for procedural softness
        const color = opts.color !== undefined ? new THREE.Color(opts.color) : null;

        if (this.puffs.length >= this.maxPuffs) {
            const old = this.puffs.shift();
            this._disposePuff(old);
        }

        let points = this._pool.pop();
        if (!points) points = this._createPoints(this.particleCapacity);

        const geo = points.geometry;
        const pos = geo.attributes.position.array;
        const alphas = geo.attributes.aAlpha.array;
        const rotations = geo.attributes.aRotation.array;
        const lifeRatios = geo.attributes.aLifeRatio.array;
        
        const vel = geo.userData.velocities;
        const lives = geo.userData.lives;
        const ages = geo.userData.ages;
        
        const alignNormal = opts.normal instanceof THREE.Vector3 ? opts.normal.clone().normalize() : null;
        const rotQuat = alignNormal ? new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), alignNormal) : null;

        for (let i = 0; i < geo.userData.capacity; ++i) {
            if (i < count) {
                pos[3 * i + 0] = position.x + (Math.random() - 0.5) * 0.1;
                pos[3 * i + 1] = position.y + 0.1;
                pos[3 * i + 2] = position.z + (Math.random() - 0.5) * 0.1;

                const u = Math.random();
                const v = Math.random();
                const theta = u * Math.PI;
                const phi = v * 2 * Math.PI;
                let dx = Math.sin(theta) * Math.cos(phi);
                let dy = Math.cos(theta);
                let dz = Math.sin(theta) * Math.sin(phi);
                if (dy < 0) dy = -dy; 
                
                dx = dx * spread;
                dy = (0.3 + Math.random() * 0.7); 
                dz = dz * spread;

                let vx = dx * (speed * (0.5 + Math.random()));
                let vy = dy * (speed * (0.5 + Math.random()));
                let vz = dz * (speed * (0.5 + Math.random()));
                
                if (rotQuat) {
                    const v3 = new THREE.Vector3(vx, vy, vz).applyQuaternion(rotQuat);
                    vx = v3.x; vy = v3.y; vz = v3.z;
                }

                vel[3 * i + 0] = vx;
                vel[3 * i + 1] = vy;
                vel[3 * i + 2] = vz;

                lives[i] = life * (0.8 + Math.random() * 0.4); 
                ages[i] = 0.0;
                alphas[i] = 1.0;
                lifeRatios[i] = 0.0;
                
                rotations[i] = Math.random() * Math.PI * 2;
                
            } else {
                alphas[i] = 0.0;
                lives[i] = 0.0;
                ages[i] = 0.0;
                lifeRatios[i] = 0.0;
                vel[3 * i + 0] = vel[3 * i + 1] = vel[3 * i + 2] = 0;
            }
        }

        this.material.uniforms.uSize.value = size;
        if (color) {
            this.material.uniforms.uColor.value.copy(color);
        }

        geo.attributes.position.needsUpdate = true;
        geo.attributes.aAlpha.needsUpdate = true;
        geo.attributes.aRotation.needsUpdate = true;
        geo.attributes.aLifeRatio.needsUpdate = true;

        this.scene.add(points);
        const puff = { points, age: 0, maxLife: life, count };
        this.puffs.push(puff);
    }

    _disposePuff(puff) {
        if (puff.points && puff.points.parent) this.scene.remove(puff.points);
        this._pool.push(puff.points);
    }

    update(dt) {
        const drag = Math.pow(0.92, dt * 60); 

        for (let pi = this.puffs.length - 1; pi >= 0; --pi) {
            const puff = this.puffs[pi];
            const points = puff.points;
            const geo = points.geometry;
            
            const pos = geo.attributes.position.array;
            const alphas = geo.attributes.aAlpha.array;
            const rotations = geo.attributes.aRotation.array;
            const lifeRatios = geo.attributes.aLifeRatio.array;
            
            const vel = geo.userData.velocities;
            const lives = geo.userData.lives;
            const ages = geo.userData.ages;

            let active = 0;
            for (let i = 0; i < puff.count; ++i) {
                ages[i] += dt;
                
                const age = ages[i];
                const life = lives[i] || 0.0001;
                const lifeRatio = age / life;

                if (age >= life) {
                    alphas[i] = 0.0;
                } else {
                    // Physics
                    vel[3 * i + 1] += this.gravity * dt;
                    
                    vel[3 * i + 0] *= drag;
                    vel[3 * i + 1] *= drag; 
                    vel[3 * i + 2] *= drag;

                    pos[3 * i + 0] += vel[3 * i + 0] * dt;
                    pos[3 * i + 1] += vel[3 * i + 1] * dt;
                    pos[3 * i + 2] += vel[3 * i + 2] * dt;
                    
                    rotations[i] += dt * (i % 2 === 0 ? 1 : -1) * 0.5;

                    lifeRatios[i] = lifeRatio;
                    
                    // Fade logic
                    if (lifeRatio < 0.1) {
                        alphas[i] = lifeRatio * 10.0;
                    } else {
                        alphas[i] = 1.0 - ((lifeRatio - 0.1) / 0.9);
                    }
                    
                    active++;
                }
            }

            geo.attributes.position.needsUpdate = true;
            geo.attributes.aAlpha.needsUpdate = true;
            geo.attributes.aRotation.needsUpdate = true;
            geo.attributes.aLifeRatio.needsUpdate = true;

            if (active === 0) {
                this.scene.remove(points);
                this.puffs.splice(pi, 1);
                this._pool.push(points);
            }
        }
    }
}

export { SandPuffManager };