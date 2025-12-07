import * as THREE from 'three';

/**
 * Creates a simple shield effect material with color and glow
 */
export function createShieldMaterial(options = {}) {
    const {
        color = new THREE.Color(0x00FFFF),
        opacity = 0.3
    } = options;

    const shieldShader = {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                vNormal = normalize(normalMatrix * normal);
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 uShieldColor;
            uniform float uOpacity;
            
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            
            void main() {
                // Fresnel effect - glow at edges
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - abs(dot(viewDir, vNormal)), 2.0);
                
                // Simple glow: brighten at edges
                float alpha = fresnel * 0.8 + 0.2;
                alpha *= uOpacity;
                
                // Add glow color
                vec3 color = uShieldColor * (1.0 + fresnel * 0.6);
                
                gl_FragColor = vec4(color, alpha);
            }
        `,
        uniforms: {
            uShieldColor: { value: color },
            uOpacity: { value: opacity }
        }
    };

    const material = new THREE.ShaderMaterial({
        vertexShader: shieldShader.vertexShader,
        fragmentShader: shieldShader.fragmentShader,
        uniforms: shieldShader.uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        fog: false
    });

    return material;
}
