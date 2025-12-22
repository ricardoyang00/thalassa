import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';

class Bubble {
    constructor(scene, maxInstances = 6000) {
        const scale = 0.2, initVelY = 1.5, glowIntensity = 1.5, particleCount = 100, isCoralBubble = true;

        this.maxInstances = maxInstances;
        this.activeInstances = new Set();
        this.freeInstances = new Set();
        for (let i = 0; i < maxInstances; ++i)
            this.freeInstances.add(i);

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
            
            if (isCoralBubble) {
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

        const uniforms = {
            uTime: { value: 0.0 },
            uSize: { value: 30.0 },
            uColor: { value: new THREE.Color(0x6eb3d6) },
            // uSpawnTime: { value: this.clock.getElapsedTime() },
            uRiseSpeed: { value: 1.0 + Math.random() * 0.5 },
            // uExternalVelY: { value: initVelY },
            // uLifeTime: { value: lifetime },
            uAmbientLightIntensity: { value: 0.5 },
            uGlowIntensity: { value: glowIntensity },
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                uniform float uRiseSpeed;
                
                attribute vec4 aOffset;

                attribute float iSpawnTime;
                attribute float iLifeTime;
                attribute float iInitVelY;
                attribute vec3 iPosition;
                
                varying float vAlpha;
                varying float vDistance;
                
                void main() {
                    // iLifeTime == 0.0 means inactive instance
                    if (iLifeTime == 0.0) {
                        return;
                    }

                    float age = uTime - iSpawnTime;
                    float lifeFraction = age / iLifeTime;
                    
                    if (lifeFraction > 1.0) {
                        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                        vAlpha = 0.0;
                        return;
                    }
                    
                    float totalRiseSpeed = uRiseSpeed + iInitVelY;
                    float verticalDisplacement = totalRiseSpeed * age;
                    
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
                uniform float uGlowIntensity;
                varying float vAlpha;
                varying float vDistance;
                
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
                    vec3 glowColor = uColor * (1.0 + uGlowIntensity * 2.0);
                    vec3 finalColor = mix(mutedColor, glowColor, uGlowIntensity * 0.5);
                    
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

        this.scene = scene;
        // this.bubbleGroups = [];  // Array of particle systems for each bubble spawn
        this.ambientLight = null;
        this.ambientLightCached = false;
        this.clock = new THREE.Clock();

        this.mesh = new THREE.Points(geometry, material);
        this.mesh.frustumCulled = false;
        this.scene.add(this.mesh);
    }

    spawnBubble(position, scale = 0.2, initVelY = 0, glowIntensity = 0.0, particleCount = 1000, lifetime = 3.0, isCoralBubble = false) {
        let idx = Math.min(...this.freeInstances); // TODO: sorted data structure
        if (idx === Infinity) {
            // I could make a dynamic size thingy but it's more work ;-;
            console.warn(`Reached maximum amount of bubble groups (${this.maxInstances})`);
            return;
        }

        if (idx+1 > this.mesh.geometry.instanceCount)
            this.mesh.geometry.instanceCount = idx+1;

        this.freeInstances.delete(idx);
        this.activeInstances.add(idx);

        const iSpawnTime = this.mesh.geometry.getAttribute("iSpawnTime");
        iSpawnTime.array[idx] = this.clock.getElapsedTime();
        // if (!iSpawnTime.needsUpdate) {
        //     iSpawnTime.clearUpdateRanges();
        //     iSpawnTime.needsUpdate = true;
        // }
        // iSpawnTime.addUpdateRange(idx, 1);
        iSpawnTime.needsUpdate = true;

        const iLifeTime = this.mesh.geometry.getAttribute("iLifeTime");
        iLifeTime.array[idx] = lifetime;
        // if (!iLifeTime.needsUpdate) {
        //     iLifeTime.clearUpdateRanges();
        //     iLifeTime.needsUpdate = true;
        // }
        // iLifeTime.addUpdateRange(idx, 1);
        iLifeTime.needsUpdate = true;

        const iPosition = this.mesh.geometry.getAttribute("iPosition");
        iPosition.setXYZ(idx, ...position);
        // if (!iPosition.needsUpdate) {
        //     iPosition.clearUpdateRanges();
        //     iPosition.needsUpdate = true;
        // }
        // iPosition.addUpdateRange(3*idx, 3);
        iPosition.needsUpdate = true;

        const iInitVelY = this.mesh.geometry.getAttribute("iInitVelY");
        iInitVelY.array[idx] = initVelY;
        iInitVelY.needsUpdate = true;

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

    spawnFromObject(object, offset = new THREE.Vector3(0, 0, 0), scale = 0.2, initVelY = 0, glowIntensity = 0.0, particleCount = 1000, lifetime = 3.0, isCoralBubble = false) {
        const localOffset = offset.clone();
        localOffset.applyQuaternion(object.quaternion);
        const spawnPos = object.position.clone().add(localOffset);
        this.spawnBubble(spawnPos, scale, initVelY, glowIntensity, particleCount, lifetime, isCoralBubble);
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
        this.mesh.material.uniforms.uTime.value = currentTime;
        this.mesh.material.uniforms.uAmbientLightIntensity.value = ambientIntensity;

        const iSpawnTime = this.mesh.geometry.getAttribute("iSpawnTime");
        const iLifeTime = this.mesh.geometry.getAttribute("iLifeTime");

        for (let i = 0; i < this.mesh.geometry.instanceCount; ++i) {
            if (currentTime - iSpawnTime.array[i] >= iLifeTime.array[i]) {
                iLifeTime.array[i] = 0; // mark as inactive
                // if (!iLifeTime.needsUpdate) {
                //     iLifeTime.clearUpdateRanges();
                //     iLifeTime.needsUpdate = true;
                // }
                // iLifeTime.addUpdateRange(i, 1);
                iLifeTime.needsUpdate = true;
                this.freeInstances.add(i);
                this.activeInstances.delete(i);
                if (i+1 >= this.mesh.geometry.instanceCount)
                    this.mesh.geometry.instanceCount = Math.max(0, 1+Math.max(...this.activeInstances)); // TODO: sorted data structure
            }
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