import * as THREE from 'three';

/**
 * Creates a periscope HUD post-processing effect
 * Combines:
 * - Color tint (greenish/yellowish)
 * - Circular viewport cutoff with black border
 * - Lens scratches/dirt texture
 * - Centered crosshair
 * - Vignette effect
 */
export function createPeriscopeShader() {
    return {
        uniforms: {
            tDiffuse: { value: null },
            tScratchesNoise: { value: null },
            tCrosshair: { value: null },
            uTime: { value: 0 },
            uTint: { value: new THREE.Vector3(0.7, 0.9, 0.4) }, // Greenish-yellow
            uVignette: { value: 1.0 },
            uAberration: { value: 0.002 },
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
            uniform sampler2D tScratchesNoise;
            uniform sampler2D tCrosshair;
            uniform vec3 uTint;
            uniform float uVignette;
            uniform float uTime;
            uniform float uAberration;
            uniform float uAspect;
            
            varying vec2 vUv;
            
            void main() {
                vec2 center = vec2(0.5, 0.5);
                vec2 toCenter = center - vUv;
                // Correct for aspect ratio to make circle truly round
                toCenter.x *= uAspect;
                float dist = length(toCenter);
                
                // Circular viewport - sharp circle cutoff
                float circleRadius = 0.45;
                float circleEdge = 0.47;
                float vignette = smoothstep(circleRadius, circleEdge, dist);
                
                // Sample base color
                vec4 baseColor = texture2D(tDiffuse, vUv);
                
                // Apply color tint (greenish-yellow for periscope)
                baseColor.rgb *= uTint;
                
                // Add subtle lens aberration
                vec3 color = baseColor.rgb;
                color.r = texture2D(tDiffuse, vUv + vec2(uAberration, 0.0)).r * uTint.r;
                color.b = texture2D(tDiffuse, vUv - vec2(uAberration, 0.0)).b * uTint.b;
                color.g = mix(color.g, baseColor.g * uTint.g, 0.8);
                
                // Sample scratches and dirt texture - only apply bright scratches as highlights
                vec4 scratches = texture2D(tScratchesNoise, vUv + vec2(uTime * 0.05, 0.0));
                
                // Only apply scratches that are very bright (high values) - rare and sparse
                float scratchBrightness = scratches.r;
                if (scratchBrightness > 0.95) {
                    // Thin scratches - only brightest pixels show as tiny white lines
                    float scratchLine = (scratchBrightness - 0.95) / 0.05;
                    color = mix(color, vec3(1.0), scratchLine * 0.3);
                }
                
                // Sample crosshair at center
                vec4 crosshair = texture2D(tCrosshair, vUv);
                
                // Blend crosshair (only if not transparent)
                if (crosshair.a > 0.5) {
                    color = mix(color, crosshair.rgb, crosshair.a * 0.8);
                }
                
                // Apply circular vignette (black border outside circle)
                color = mix(vec3(0.0), color, 1.0 - vignette);
                
                // Additional subtle vignette darkening at edges within circle
                float edgeVignette = smoothstep(0.0, circleRadius * 0.3, dist);
                color *= mix(0.6, 1.0, edgeVignette);
                
                // Add slight green tint overlay for old equipment look
                color = mix(color, color * uTint, 0.2);
                
                gl_FragColor = vec4(color, 1.0);
            }
        `
    };
}

/**
 * Create noise texture for lens scratches and dirt
 */
export function createScratchesTexture(width = 512, height = 512) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    
    // Fill with semi-transparent noise
    const imageData = ctx.createImageData(width, height);
    const data = imageData.data;
    
    for (let i = 0; i < data.length; i += 4) {
        const noise = Math.random();
        data[i] = noise * 255;      // R - scratches
        data[i + 1] = noise * 150;  // G - subtle noise
        data[i + 2] = noise * 100;  // B - dirt
        data[i + 3] = 255;          // A - opaque
    }
    
    ctx.putImageData(imageData, 0, 0);
    
    // Add some scratches
    ctx.strokeStyle = 'rgba(150, 100, 80, 0.3)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 20; i++) {
        ctx.beginPath();
        ctx.moveTo(Math.random() * width, Math.random() * height);
        ctx.lineTo(Math.random() * width, Math.random() * height);
        ctx.stroke();
    }
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}

/**
 * Create crosshair texture
 */
export function createCrosshairTexture(size = 256) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Transparent background
    ctx.clearRect(0, 0, size, size);
    
    const center = size / 2;
    const crosshairSize = size * 0.15;
    const lineWidth = 2;
    
    ctx.strokeStyle = 'rgba(100, 255, 100, 0.8)'; // Green crosshair
    ctx.lineWidth = lineWidth;
    
    // Horizontal line
    ctx.beginPath();
    ctx.moveTo(center - crosshairSize, center);
    ctx.lineTo(center + crosshairSize, center);
    ctx.stroke();
    
    // Vertical line
    ctx.beginPath();
    ctx.moveTo(center, center - crosshairSize);
    ctx.lineTo(center, center + crosshairSize);
    ctx.stroke();
    
    // Center dot
    ctx.fillStyle = 'rgba(100, 255, 100, 0.8)';
    ctx.beginPath();
    ctx.arc(center, center, 3, 0, Math.PI * 2);
    ctx.fill();
    
    // Corners
    const cornerSize = crosshairSize * 0.3;
    ctx.strokeStyle = 'rgba(100, 255, 100, 0.6)';
    ctx.lineWidth = lineWidth;
    
    const corners = [
        [center - crosshairSize * 1.2, center - crosshairSize * 1.2],
        [center + crosshairSize * 1.2, center - crosshairSize * 1.2],
        [center - crosshairSize * 1.2, center + crosshairSize * 1.2],
        [center + crosshairSize * 1.2, center + crosshairSize * 1.2]
    ];
    
    corners.forEach(([cx, cy]) => {
        ctx.beginPath();
        ctx.moveTo(cx - cornerSize, cy);
        ctx.lineTo(cx + cornerSize, cy);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cx, cy - cornerSize);
        ctx.lineTo(cx, cy + cornerSize);
        ctx.stroke();
    });
    
    const texture = new THREE.CanvasTexture(canvas);
    texture.magFilter = THREE.LinearFilter;
    texture.minFilter = THREE.LinearFilter;
    return texture;
}
