import * as THREE from 'three';

/**
 * Creates an FPV (First Person View) post-processing effect
 * Applies a dark/black tone filter with depth of field
 */
export function createFPVShader() {
    return {
        uniforms: {
            tDiffuse: { value: null },
            uTint: { value: new THREE.Vector3(0.3, 0.3, 0.3) }, // Dark gray/black tint
            uVignetteStrength: { value: 0.4 },
            uAspect: { value: 1.0 }
        },
        vertexShader: `
            varying vec2 vUv;
            void main() {
                vUv = uv;
                gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
        `,
        fragmentShader: `
            uniform sampler2D tDiffuse;
            uniform vec3 uTint;
            uniform float uVignetteStrength;
            uniform float uAspect;

            varying vec2 vUv;

            void main() {
                vec4 color = texture2D(tDiffuse, vUv);

                // Apply dark tint
                color.rgb *= uTint;

                // Add vignette effect
                vec2 center = vec2(0.5, 0.5);
                vec2 toCenter = center - vUv;
                toCenter.x *= uAspect;
                float dist = length(toCenter);
                float vignette = 1.0 - smoothstep(0.5, 1.0, dist) * uVignetteStrength;

                color.rgb *= vignette;

                gl_FragColor = color;
            }
        `
    };
}