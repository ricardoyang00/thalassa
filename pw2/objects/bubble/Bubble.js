import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';

class Bubble {
    static #type = {
        Coral: 0,
        Submarine: 1,
        TypeCount: 2,
    };

    static #material = new THREE.ShaderMaterial({
        uniforms: {
            uTime: { value: 0 },
            uSize: { value: 50.0 },
            uColor: { value: new THREE.Color(0x6eb3d6) },
            uRiseSpeed: { value: 1.5 },
            uAmbientLightIntensity: { value: 0.5 },
            uParticleCount: { value: 0 },
        },
        vertexShader: `
            uniform float uTime;
            uniform float uSize;
            uniform float uRiseSpeed;
            uniform float uParticleCount;
            
            attribute vec4 aOffset;

            attribute float iSpawnTime;
            attribute float iLifeTime;
            attribute float iInitVelY;
            attribute vec3 iPosition;
            attribute float iAcceleration;
            attribute float iEffectiveCount;
            attribute float iGlowIntensity;
            
            varying float vAlpha;
            varying float vDistance;
            varying float vGlowIntensity;
            
            void main() {
                vGlowIntensity = iGlowIntensity;

                if (mod(float(gl_VertexID), uParticleCount) >= iEffectiveCount) {
                    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                    gl_PointSize = 0.0;
                    return;
                }

                float age = uTime - iSpawnTime;
                float lifeFraction = age / iLifeTime;
                
                if (lifeFraction > 1.0) {
                    gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                    gl_PointSize = 0.0;
                    vAlpha = 0.0;
                    return;
                }
                
                // vertical motion: base rise speed + external vertical velocity + 1/2 * acceleration * t^2
                float totalRiseSpeed = uRiseSpeed + iInitVelY;
                float verticalDisplacement = totalRiseSpeed * age + 0.5 * iAcceleration * age * age;
                
                // More natural wobble with randomness
                float wobbleSpeed = 2.0 + aOffset.z * 3.0;
                float wobbleAmount = 0.2 + aOffset.z * 0.3;
                float wobble = sin(age * wobbleSpeed + aOffset.w) * wobbleAmount;
                
                // CONE SPREADING: radial expansion that grows with time
                float coneSpread = age * 0.8;
                float spreadAngle = aOffset.y;
                float spreadX = cos(spreadAngle) * coneSpread;
                float spreadZ = sin(spreadAngle) * coneSpread;
                
                // More chaotic drift with stronger spreading
                float driftX = sin(aOffset.y + age * 0.5 + aOffset.z * 10.0) * 0.6
                                + sin(age * 0.3 + aOffset.z) * 0.5;
                float driftZ = cos(aOffset.y + age * 0.5 + aOffset.z * 10.0) * 0.6
                                + cos(age * 0.3 + aOffset.z) * 0.5;
                
                // Random lateral acceleration - increased for wider spread
                float lateralDrift = sin(aOffset.z * 100.0 + age) * 0.45;
                
                // Additional radial expansion based on age - much more aggressive
                float expansionFactor = lifeFraction * 1.2;
                float radialExpansion = sin(aOffset.y + age) * expansionFactor;
                
                vec3 transformed = position + iPosition + vec3(
                    wobble + driftX + lateralDrift + radialExpansion + spreadX,
                    verticalDisplacement,
                    driftZ + wobble * 0.5 + radialExpansion + spreadZ
                );
                
                vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
                vec4 viewPosition = viewMatrix * modelPosition;
                vec4 projectionPosition = projectionMatrix * viewPosition;
                
                gl_Position = projectionPosition;
                gl_PointSize = uSize / (-viewPosition.z);
                
                // Pass distance to fragment shader for fog effect
                vDistance = length(viewPosition.xyz);
                
                // Continuous smooth fade: starts at full opacity, gradually fades throughout lifetime
                vAlpha = 1.0 - lifeFraction;
            }
        `,
        fragmentShader: `
            uniform vec3 uColor;
            uniform float uAmbientLightIntensity;

            varying float vAlpha;
            varying float vDistance;
            varying float vGlowIntensity;
            
            void main() {
                float dist = length(gl_PointCoord - 0.5);
                float pointAlpha = 1.0 - smoothstep(0.15, 0.5, dist);
                
                // Scale opacity based on ambient light intensity
                // In low light, bubbles fade significantly
                float lightResponsiveness = uAmbientLightIntensity * 1.2;
                
                // Apply fog distance fading (similar to scene fog)
                // Fog density = 0.02 (from scene fog), but stronger for bubbles
                float fogFactor = exp(-0.03 * vDistance);
                
                // Proximity boost: bubbles are more visible when close (within 30 units)
                float proximityBoost = 1.0;
                if (vDistance < 30.0) {
                    proximityBoost = 1.0 + (1.0 - vDistance / 30.0) * 0.5;
                }
                
                float finalAlpha = pointAlpha * vAlpha * 0.6 * lightResponsiveness * fogFactor * proximityBoost;
                
                vec3 mutedColor = mix(uColor, vec3(0.5), 0.15);
                
                // Add glow for distant visibility (helps with underwater fog)
                vec3 glowColor = uColor * (1.0 + vGlowIntensity * 2.0);
                vec3 finalColor = mix(mutedColor, glowColor, vGlowIntensity * 0.5);
                
                gl_FragColor = vec4(finalColor, finalAlpha);
                
                if (finalAlpha < 0.01) {
                    discard;
                }
            }
        `,
        transparent: true,
        blending: THREE.NormalBlending,
        depthTest: true,
        depthWrite: false
    });

    constructor(scene, app, {
        coralMaxGroups = 7000,
        coralParticlesPerGroup = 100,
        submarineMaxGroups = 1000,
        submarineParticlesPerGroup = 500,
    } = {}) {
        this.app = app;
        this.scene = scene;
        this.ambientLight = null;
        this.ambientLightCached = false;
        this.clock = new THREE.Clock();

        this.lodDistance = 40;
        this.lodMultiplier = 0.25; // particle count multiplier when far
        this.lodEnabled = true; // whether LOD is active (config switch)

        const scale = 0.2;
        this.managers = [];
        this.sceneGroup = new THREE.Group();
        this.scene.add(this.sceneGroup);

        for (let type = 0; type < Bubble.#type.TypeCount; ++type) {
            const [maxInstances, particleCount] = type === Bubble.#type.Coral
                ? [coralMaxGroups, coralParticlesPerGroup]
                : [submarineMaxGroups, submarineParticlesPerGroup];

            const activeInstances = new Set();
            const freeInstances = new Set();
            for (let i = 0; i < maxInstances; ++i)
                freeInstances.add(i);

            const geometry = new THREE.InstancedBufferGeometry();
            geometry.instanceCount = 0;

            const positions = new Float32Array(particleCount * 3);
            const initialOffsets = new Float32Array(particleCount * 4);

            for (let i = 0; i < particleCount; i++) {
                const i3 = i * 3;
                const i4 = i * 4;
                const randomScale = scale * (0.8 + Math.random() * 0.5);
                
                // For coral bubbles, use more continuous distribution (no clear layers)
                // For submarine bubbles, use traditional sphere distribution
                let radius, angle, phi;
                
                if (type === Bubble.#type.Coral) {
                    // Continuous distribution with smooth radius variation
                    radius = Math.pow(Math.random(), 0.6) * randomScale * 1.8; // More particles closer to center initially
                    angle = Math.random() * Math.PI * 2;
                    phi = Math.acos(2 * Math.random() - 1); // More uniform distribution in 3D space
                } else {
                    // Traditional distribution for submarine
                    radius = Math.sqrt(Math.random()) * randomScale * 1.5;
                    angle = Math.random() * Math.PI * 2;
                    phi = Math.random() * Math.PI;
                }
                
                positions[i3 + 0] = Math.cos(angle) * Math.sin(phi) * radius;
                positions[i3 + 1] = Math.cos(phi) * radius;
                positions[i3 + 2] = Math.sin(angle) * Math.sin(phi) * radius;
                
                initialOffsets[i4 + 0] = radius;
                initialOffsets[i4 + 1] = angle;
                initialOffsets[i4 + 2] = Math.random();
                initialOffsets[i4 + 3] = Math.random() * Math.PI * 2;
            }

            geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.setAttribute('aOffset', new THREE.BufferAttribute(initialOffsets, 4));

            geometry.setAttribute('iSpawnTime', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1));
            geometry.setAttribute('iLifeTime', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1));
            geometry.setAttribute('iInitVelY', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1));
            geometry.setAttribute('iPosition', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances*3), 3));
            geometry.setAttribute('iAcceleration', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1));
            geometry.setAttribute('iEffectiveCount', new THREE.InstancedBufferAttribute(new Uint16Array(maxInstances), 1));
            geometry.setAttribute('iGlowIntensity', new THREE.InstancedBufferAttribute(new Float32Array(maxInstances), 1));

            const mat = Bubble.#material.clone();
            mat.uniforms.uParticleCount.value = particleCount;

            const points = new THREE.Points(geometry, mat);
            points.frustumCulled = false;
            this.sceneGroup.add(points);

            this.managers.push({
                object: points,
                maxInstances: maxInstances,
                instanceParticleCount: particleCount,
                activeInstances: activeInstances,
                freeInstances: freeInstances,
            })
        }
    }

    spawnBubble(position, initVelY = 0, glowIntensity = 0.0, lifetime = 3.0, acceleration = 0.0, isCoralBubble = false) {
        const manager = this.managers[isCoralBubble ? Bubble.#type.Coral : Bubble.#type.Submarine];

        let idx = Math.min(...manager.freeInstances); // TODO (optional): sorted data structure
        if (idx === Infinity) {
            // I could make a dynamic size thingy but it's more work ;-;
            console.warn(`Reached maximum amount of ${isCoralBubble ? 'Coral' : 'Submarine'} Bubble Groups (${manager.maxInstances})`);
            return;
        }

        if (idx+1 > manager.object.geometry.instanceCount)
            manager.object.geometry.instanceCount = idx+1;

        manager.freeInstances.delete(idx);
        manager.activeInstances.add(idx);

        const iSpawnTime = manager.object.geometry.getAttribute("iSpawnTime");
        iSpawnTime.array[idx] = this.clock.getElapsedTime();
        // if (!iSpawnTime.needsUpdate) {
        //     iSpawnTime.clearUpdateRanges();
        //     iSpawnTime.needsUpdate = true;
        // }
        // iSpawnTime.addUpdateRange(idx, 1);
        iSpawnTime.needsUpdate = true;

        const iLifeTime = manager.object.geometry.getAttribute("iLifeTime");
        iLifeTime.array[idx] = lifetime;
        // if (!iLifeTime.needsUpdate) {
        //     iLifeTime.clearUpdateRanges();
        //     iLifeTime.needsUpdate = true;
        // }
        // iLifeTime.addUpdateRange(idx, 1);
        iLifeTime.needsUpdate = true;

        const iPosition = manager.object.geometry.getAttribute("iPosition");
        iPosition.setXYZ(idx, ...position);
        // if (!iPosition.needsUpdate) {
        //     iPosition.clearUpdateRanges();
        //     iPosition.needsUpdate = true;
        // }
        // iPosition.addUpdateRange(3*idx, 3);
        iPosition.needsUpdate = true;

        const iInitVelY = manager.object.geometry.getAttribute("iInitVelY");
        iInitVelY.array[idx] = initVelY;
        iInitVelY.needsUpdate = true;

        const iEffectiveCount = manager.object.geometry.getAttribute("iEffectiveCount");
        iEffectiveCount.array[idx] = manager.instanceParticleCount;
        iEffectiveCount.needsUpdate = true;

        const iAcceleration = manager.object.geometry.getAttribute("iAcceleration");
        iAcceleration.array[idx] = acceleration;
        iAcceleration.needsUpdate = true;

        const iGlowIntensity = manager.object.geometry.getAttribute("iGlowIntensity");
        iGlowIntensity.array[idx] = glowIntensity;
        iGlowIntensity.needsUpdate = true;

        // const mesh = new THREE.Points(geometry, material);
        // mesh.position.copy(position);
        // this.scene.add(mesh);

        // this.bubbleGroups.push({
        //     mesh: mesh,
        //     uniforms: uniforms,
        //     spawnTime: this.clock.getElapsedTime(),
        //     lifeTime: lifetime,
        //     isCoralBubble: isCoralBubble
        // });
    }

    spawnFromObject(object, offset = new THREE.Vector3(0, 0, 0), initVelY = 0, glowIntensity = 0.0, lifetime = 3.0, acceleration = 0.0, isCoralBubble = false) {
        const localOffset = offset.clone();
        localOffset.applyQuaternion(object.quaternion);
        const spawnPos = object.position.clone().add(localOffset);
        this.spawnBubble(spawnPos, initVelY, glowIntensity, lifetime, acceleration, isCoralBubble);
    }

    update(dt) {
        const currentTime = this.clock.getElapsedTime();
        
        // Cache ambient light reference on first call
        if (!this.ambientLightCached) {
            this.scene.traverse((obj) => {
                if (obj instanceof THREE.AmbientLight && !this.ambientLight) {
                    this.ambientLight = obj;
                    this.ambientLightCached = true;
                }
            });
            if (!this.ambientLight) this.ambientLightCached = true;
        }
        
        const ambientIntensity = this.ambientLight ? this.ambientLight.intensity : 0.3;

        for (const manager of this.managers) {
            if (SgiUtils.debug)
                console.log(manager.activeInstances.size)
            manager.object.material.uniforms.uTime.value = currentTime;
            manager.object.material.uniforms.uAmbientLightIntensity.value = ambientIntensity;

            const iSpawnTime = manager.object.geometry.getAttribute("iSpawnTime");
            const iLifeTime = manager.object.geometry.getAttribute("iLifeTime");
            const iEffectiveCount = manager.object.geometry.getAttribute("iEffectiveCount");
            const iPosition = manager.object.geometry.getAttribute("iPosition");

            const camera = this.app.activeCamera;
            const camPos = camera.getWorldPosition(new THREE.Vector3());
            const camDir = camera.getWorldDirection(new THREE.Vector3());
            const pos = new THREE.Vector3();

            for (let i = 0; i < manager.object.geometry.instanceCount; ++i) {
                if (currentTime - iSpawnTime.array[i] >= iLifeTime.array[i]) {
                    iEffectiveCount.array[i] = 0; // mark as inactive
                    manager.freeInstances.add(i);
                    manager.activeInstances.delete(i);
                    if (i+1 >= manager.object.geometry.instanceCount)
                        manager.object.geometry.instanceCount = Math.max(0, 1+Math.max(...manager.activeInstances)); // TODO (optional): sorted data structure
                } else if (this.lodEnabled) {
                    pos.fromBufferAttribute(iPosition, i);
                    iEffectiveCount.array[i] = camDir.dot(pos.clone().sub(camPos)) < 0
                        ? 0 // lazy culling
                        : camPos.distanceTo(pos) > this.lodDistance
                            ? this.lodMultiplier * manager.instanceParticleCount
                            : manager.instanceParticleCount;
                }
            }
            iEffectiveCount.needsUpdate = true;
        }
            

        // for (let i = this.bubbleGroups.length - 1; i >= 0; i--) {
        //     const bubble = this.bubbleGroups[i];
        //     const age = currentTime - bubble.spawnTime;
            
        //     // Update uniforms
        //     bubble.uniforms.uTime.value = currentTime;
        //     bubble.uniforms.uAmbientLightIntensity.value = ambientIntensity;
            
        //     // Remove old bubbles
        //     if (age > bubble.lifeTime) {
        //         this.scene.remove(bubble.mesh);
        //         bubble.mesh.geometry.dispose();
        //         bubble.mesh.material.dispose();
        //         this.bubbleGroups.splice(i, 1);
        //     }
        // }
    }
    
    // dispose() {
    //     this.bubbleGroups.forEach(bubble => {
    //         this.scene.remove(bubble.mesh);
    //         bubble.mesh.geometry.dispose();
    //         bubble.mesh.material.dispose();
    //     });
    //     this.bubbleGroups = [];
    // }

    // clearCoralBubbles() {
    //     for (let i = this.bubbleGroups.length - 1; i >= 0; i--) {
    //         if (this.bubbleGroups[i].isCoralBubble) {
    //             const bubble = this.bubbleGroups[i];
    //             this.scene.remove(bubble.mesh);
    //             bubble.mesh.geometry.dispose();
    //             bubble.mesh.material.dispose();
    //             this.bubbleGroups.splice(i, 1);
    //         }
    //     }
    // }
}

export { Bubble };