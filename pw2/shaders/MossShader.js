import * as THREE from 'three';

/**
 * Returns a ShaderMaterial that applies procedural moss on top of a base texture.
 * @param {THREE.Texture} baseTexture - The stone/limestone texture
 * @param {THREE.Color} mossColor - The color of the moss (default: grey-green for weathering)
 */
export function createMossMaterial(baseTexture, mossColor = new THREE.Color(0x4a4f3b)) { 
    
    const vertexShader = `
        varying vec2 vUv;
        varying vec3 vPosition; // World position for noise continuity
        varying vec3 vNormal;

        void main() {
            vUv = uv;
            vNormal = normalize(normalMatrix * normal);
            
            // Calculate world position
            vec4 worldPosition = modelMatrix * vec4(position, 1.0);
            vPosition = worldPosition.xyz;

            gl_Position = projectionMatrix * viewMatrix * worldPosition;
        }
    `;

    const fragmentShader = `
        uniform sampler2D uBaseTexture;
        uniform vec3 uMossColor;
        uniform float uScale;      // Noise scale
        uniform float uThreshold;  // How much moss covers the object
        uniform float uTime;       // Optional: for animating moss (e.g., wind/growth)

        varying vec2 vUv;
        varying vec3 vPosition;
        varying vec3 vNormal;

        // --- Classic Perlin Noise (Simplex 3D) ---
        // Source: https://github.com/stegu/webgl-noise
        
        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
        vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

        float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);

            // First corner
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);

            // Other corners
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);

            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
            vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

            // Permutations
            i = mod289(i);
            vec4 p = permute(permute(permute(
                        i.z + vec4(0.0, i1.z, i2.z, 1.0))
                        + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                        + i.x + vec4(0.0, i1.x, i2.x, 1.0));

            // Gradients: 7x7 points over a square, mapped onto an octahedron.
            // The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
            float n_ = 0.142857142857; // 1.0/7.0
            vec3  ns = n_ * D.wyz - D.xzx;

            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);    // mod(j,N)

            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);

            vec4 b0 = vec4( x.xy, y.xy );
            vec4 b1 = vec4( x.zw, y.zw );

            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));

            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;

            vec3 p0 = vec3(a0.xy,h.x);
            vec3 p1 = vec3(a0.zw,h.y);
            vec3 p2 = vec3(a1.xy,h.z);
            vec3 p3 = vec3(a1.zw,h.w);

            //Normalise gradients
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;

            // Mix final noise value
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
        }

        void main() {
            vec4 baseColor = texture2D(uBaseTexture, vUv);

            // 1. Noise Generation
            // Very low frequency base noise for broad gradients
            float n1 = snoise(vPosition * uScale); 
            // Subtle detail noise to break up perfect gradients
            float n2 = snoise(vPosition * uScale * 5.0) * 0.15; 
            
            float noise = n1 + n2;

            // 2. Up Vector Bias
            // Reduce bias slightly to allow more natural spread on sides
            float upDot = dot(vNormal, vec3(0.0, 1.0, 0.0));
            
            // 3. Soft Mixing (The Fade)
            // Range: -1.0 to 1.0. This creates an extremely wide falloff.
            // Most of the surface will have a 'partial' moss value (0.2-0.8),
            // creating the "stained" look instead of distinct patches.
            float mossFactor = smoothstep(-1.0, 1.0, noise + (upDot * 0.5) + uThreshold);

            // 4. Color Blending (Stain Method)
            // We tint the stone color towards the moss color, but never fully replace it.
            // mix(base, base * tint, factor) ensures texture details remain visible.
            vec3 mossyStone = baseColor.rgb * uMossColor * 1.5; 
            
            // Max out the mix at 0.8 to prevent full green opacity
            vec3 finalRgb = mix(baseColor.rgb, mossyStone, mossFactor * 0.85);

            // Simple Lighting
            vec3 lightDir = normalize(vec3(0.5, 1.0, 0.5));
            float diff = max(dot(vNormal, lightDir), 0.0);
            vec3 lighting = vec3(0.4) + (vec3(0.6) * diff); // Soft ambient

            gl_FragColor = vec4(finalRgb * lighting, 1.0);
        }
    `;

    return new THREE.ShaderMaterial({
        uniforms: {
            uBaseTexture: { value: baseTexture },
            uMossColor: { value: mossColor },
            uScale: { value: 0.3 },
            uThreshold: { value: 0.0 },  
            uTime: { value: 0.0 }
        },
        vertexShader: vertexShader,
        fragmentShader: fragmentShader
    });
}