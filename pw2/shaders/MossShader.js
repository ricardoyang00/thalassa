import * as THREE from 'three';

// 1. The Noise Function (Standard Simplex Noise)
// We store this as a string to inject it into the shader later.
const NOISE_GLSL = `
    vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 mod289(vec4 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
    vec4 permute(vec4 x) { return mod289(((x*34.0)+1.0)*x); }
    vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

    float snoise(vec3 v) {
        const vec2 C = vec2(1.0/6.0, 1.0/3.0);
        const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
        vec3 i  = floor(v + dot(v, C.yyy));
        vec3 x0 = v - i + dot(i, C.xxx);
        vec3 g = step(x0.yzx, x0.xyz);
        vec3 l = 1.0 - g;
        vec3 i1 = min(g.xyz, l.zxy);
        vec3 i2 = max(g.xyz, l.zxy);
        vec3 x1 = x0 - i1 + C.xxx;
        vec3 x2 = x0 - i2 + C.yyy; 
        vec3 x3 = x0 - D.yyy;      
        i = mod289(i);
        vec4 p = permute(permute(permute(
                    i.z + vec4(0.0, i1.z, i2.z, 1.0))
                    + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                    + i.x + vec4(0.0, i1.x, i2.x, 1.0));
        float n_ = 0.142857142857; 
        vec3  ns = n_ * D.wyz - D.xzx;
        vec4 j = p - 49.0 * floor(p * ns.z * ns.z); 
        vec4 x_ = floor(j * ns.z);
        vec4 y_ = floor(j - 7.0 * x_);    
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
        vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
        p0 *= norm.x;
        p1 *= norm.y;
        p2 *= norm.z;
        p3 *= norm.w;
        vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
        m = m * m;
        return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3) ) );
    }
`;

/**
 * Creates a Standard MeshPhongMaterial but injects moss logic into it.
 * This keeps bump maps, shininess, and lights working automatically.
 */
export function createMossMaterial(baseTexture, mossColor = new THREE.Color("#557e4e"), options = {}) { 
    
    // 1. Create a Standard Phong Material
    const material = new THREE.MeshPhongMaterial({
        map: baseTexture,
        color: options.color || new THREE.Color("#b1b1b1"),
        specular: options.specular || 0x000000,
        shininess: options.shininess || 0,
        bumpMap: options.bumpMap || null,
        bumpScale: options.bumpScale || 1,
    });

    // Configuration for the moss
    const mossSettings = {
        uMossColor: { value: mossColor },
        uMossScale: { value: options.scale !== undefined ? options.scale : 0.3 },
        uMossThreshold: { value: options.threshold !== undefined ? options.threshold : 0.1 },
    };

    // 2. The Magic Hook
    material.onBeforeCompile = (shader) => {
        // A. Add our custom uniforms to the shader
        shader.uniforms.uMossColor = mossSettings.uMossColor;
        shader.uniforms.uMossScale = mossSettings.uMossScale;
        shader.uniforms.uMossThreshold = mossSettings.uMossThreshold;

        // B. MODIFY VERTEX SHADER
        // We need to calculate world position for the noise to be continuous
        shader.vertexShader = shader.vertexShader.replace(
            '#include <common>',
            `
            #include <common>
            varying vec3 vWorldPosition;
            `
        );
        
        shader.vertexShader = shader.vertexShader.replace(
            '#include <worldpos_vertex>',
            `
            #include <worldpos_vertex>
            vWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;
            `
        );

        // C. MODIFY FRAGMENT SHADER
        // 1. Add uniforms and noise function at the top
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <common>',
            `
            #include <common>
            uniform vec3 uMossColor;
            uniform float uMossScale;
            uniform float uMossThreshold;
            varying vec3 vWorldPosition;
            ${NOISE_GLSL}
            `
        );

        // 2. Inject the mixing logic
        // We inject this AFTER the map color is read (in <map_fragment>)
        // but BEFORE lighting is calculated.
        shader.fragmentShader = shader.fragmentShader.replace(
            '#include <map_fragment>',
            `
            #include <map_fragment>

            // --- Moss Logic ---
            float n1 = snoise(vWorldPosition * uMossScale);
            float n2 = snoise(vWorldPosition * uMossScale * 5.0) * 0.15;
            float noise = n1 + n2;

            // In MeshPhong, 'vNormal' is the interpolated normal from vertex shader.
            // If you want the moss to sit 'on top' of the bumps, you can use the perturbed normal
            // but usually for moss placement, the geometric normal (vNormal) is more stable.
            float upDot = dot(vNormal, vec3(0.0, 1.0, 0.0));

            float mossFactor = smoothstep(-1.0, 1.0, noise + (upDot * 0.5) + uMossThreshold);
            
            // Mix the texture color (diffuseColor) with the moss color
            // lighting will be applied TO this result later by Three.js
            vec3 mossyColor = diffuseColor.rgb * uMossColor * 1.5;
            diffuseColor.rgb = mix(diffuseColor.rgb, mossyColor, mossFactor * 0.85);
            `
        );
    };

    return material;
}