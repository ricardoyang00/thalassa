import * as THREE from 'three';

class Bubble {
    constructor(scene) {
        this.scene = scene;
        this.bubbleGroups = [];  // Array of particle systems for each bubble spawn

        this.clock = new THREE.Clock();
    }

        spawnBubble(position, scale = 0.2, initVelY = 0) {
        const particleCount = 1000;
        const geometry = new THREE.BufferGeometry();
        
        const positions = new Float32Array(particleCount * 3);
        const initialOffsets = new Float32Array(particleCount * 4);
        
        for (let i = 0; i < particleCount; i++) {
            const i3 = i * 3;
            const i4 = i * 4;
            const randomScale = scale * (0.8 + Math.random() * 0.5);
            
            // Randomly distributed in a sphere with larger spread
            const radius = Math.sqrt(Math.random()) * randomScale * 1.5; 
            const angle = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            
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

        const uniforms = {
            uTime: { value: 0.0 },
            uSize: { value: 30.0 },
            uColor: { value: new THREE.Color(0x6eb3d6) },
            uSpawnTime: { value: this.clock.getElapsedTime() },
            uRiseSpeed: { value: 1.0 + Math.random() * 0.5 },
            uExternalVelY: { value: initVelY },
            uLifeTime: { value: 3.0 }
        };

        const material = new THREE.ShaderMaterial({
            uniforms: uniforms,
            vertexShader: `
                uniform float uTime;
                uniform float uSize;
                uniform float uSpawnTime;
                uniform float uRiseSpeed;
                uniform float uExternalVelY;
                uniform float uLifeTime;
                
                attribute vec4 aOffset;
                
                varying float vAlpha;
                
                void main() {
                    float age = uTime - uSpawnTime;
                    float lifeFraction = age / uLifeTime;
                    
                    if (lifeFraction > 1.0) {
                        gl_Position = vec4(0.0, 0.0, 0.0, 0.0);
                        vAlpha = 0.0;
                        return;
                    }
                    
                    float totalRiseSpeed = uRiseSpeed + uExternalVelY;
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
                    float driftX = sin(aOffset.y + age * 0.5 + aOffset.z * 10.0) * 0.4
                                 + sin(age * 0.3 + aOffset.z) * 0.3;
                    float driftZ = cos(aOffset.y + age * 0.5 + aOffset.z * 10.0) * 0.4
                                 + cos(age * 0.3 + aOffset.z) * 0.3;
                    
                    // Random lateral acceleration
                    float lateralDrift = sin(aOffset.z * 100.0 + age) * 0.25;
                    
                    // Additional radial expansion based on age
                    float expansionFactor = lifeFraction * 0.5;
                    float radialExpansion = sin(aOffset.y + age) * expansionFactor;
                    
                    vec3 transformed = position + vec3(
                        wobble + driftX + lateralDrift + radialExpansion + spreadX,
                        verticalDisplacement,
                        driftZ + wobble * 0.5 + radialExpansion + spreadZ
                    );
                    
                    vec4 modelPosition = modelMatrix * vec4(transformed, 1.0);
                    vec4 viewPosition = viewMatrix * modelPosition;
                    vec4 projectionPosition = projectionMatrix * viewPosition;
                    
                    gl_Position = projectionPosition;
                    gl_PointSize = uSize / (-viewPosition.z);
                    
                    // CHANGED: Smooth fade out instead of sudden pop
                    vAlpha = 1.0 - smoothstep(0.7, 1.0, lifeFraction);
                }
            `,
            fragmentShader: `
                uniform vec3 uColor;
                varying float vAlpha;
                
                void main() {
                    float dist = length(gl_PointCoord - 0.5);
                    float pointAlpha = 1.0 - smoothstep(0.15, 0.5, dist);
                    float finalAlpha = pointAlpha * vAlpha * 0.8;
                    
                    vec3 mutedColor = mix(uColor, vec3(0.5), 0.15);
                    
                    gl_FragColor = vec4(mutedColor, finalAlpha);
                    
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

        const mesh = new THREE.Points(geometry, material);
        mesh.position.copy(position);
        this.scene.add(mesh);

        this.bubbleGroups.push({
            mesh: mesh,
            uniforms: uniforms,
            spawnTime: this.clock.getElapsedTime(),
            lifeTime: 3.0
        });
    }

    spawnFromObject(object, offset = new THREE.Vector3(0, 0, 0), scale = 0.2, initVelY = 0) {
        const localOffset = offset.clone();
        localOffset.applyQuaternion(object.quaternion);
        const spawnPos = object.position.clone().add(localOffset);
        this.spawnBubble(spawnPos, scale, initVelY);
    }

    update(dt) {
        const currentTime = this.clock.getElapsedTime();
        
        for (let i = this.bubbleGroups.length - 1; i >= 0; i--) {
            const bubble = this.bubbleGroups[i];
            const age = currentTime - bubble.spawnTime;
            
            // Update uniforms
            bubble.uniforms.uTime.value = currentTime;
            
            // Remove old bubbles
            if (age > bubble.lifeTime) {
                this.scene.remove(bubble.mesh);
                bubble.mesh.geometry.dispose();
                bubble.mesh.material.dispose();
                this.bubbleGroups.splice(i, 1);
            }
        }
    }
    
    dispose() {
        this.bubbleGroups.forEach(bubble => {
            this.scene.remove(bubble.mesh);
            bubble.mesh.geometry.dispose();
            bubble.mesh.material.dispose();
        });
        this.bubbleGroups = [];
    }
}

export { Bubble };