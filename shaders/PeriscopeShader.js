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
            tCoordinates: { value: null }, 
            uTime: { value: 0 },
            uTint: { value: new THREE.Vector3(0.7, 0.9, 0.4) },
            uVignette: { value: 1.0 },
            uAberration: { value: 0.002 },
            uAspect: { value: 1.0 },
            uSubmarineX: { value: 0.0 },
            uSubmarineY: { value: 0.0 },
            uSubmarineZ: { value: 0.0 }
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
            uniform sampler2D tCoordinates;
            uniform vec3 uTint;
            uniform float uVignette;
            uniform float uTime;
            uniform float uAberration;
            uniform float uAspect;
            uniform float uSubmarineX;
            uniform float uSubmarineY;
            uniform float uSubmarineZ;
            
            varying vec2 vUv;
            
            // Sample a digit from spritesheet 6x3
            vec4 sampleDigit(int digitIndex, vec2 position) {
                int col = digitIndex % 6;
                int row = digitIndex / 6;
                
                float cellWidth = 1.0 / 6.0;
                float cellHeight = 1.0 / 3.0;
                
                vec2 pos = clamp(position, vec2(0.0), vec2(0.999));
                
                float u = float(col) * cellWidth + pos.x * cellWidth;
                float v = 1.0 - ((float(row) + 1.0) * cellHeight) + (pos.y * cellHeight);

                return texture2D(tCoordinates, vec2(u, v));
            }
            
            int getDigit(float value, float multiplier) {
                float absVal = abs(value);
                return int(mod(floor(absVal * multiplier), 10.0));
            }

            void main() {
                // --- BASE RENDER ---
                vec2 center = vec2(0.5, 0.5);
                vec2 toCenter = center - vUv;
                toCenter.x *= uAspect;
                float dist = length(toCenter);
                
                float circleRadius = 0.45;
                float circleEdge = 0.47;
                float vignette = smoothstep(circleRadius, circleEdge, dist);
                
                vec4 baseColor = texture2D(tDiffuse, vUv);
                baseColor.rgb *= uTint;
                
                vec3 color = baseColor.rgb;
                // Aberration
                color.r = texture2D(tDiffuse, vUv + vec2(uAberration, 0.0)).r * uTint.r;
                color.b = texture2D(tDiffuse, vUv - vec2(uAberration, 0.0)).b * uTint.b;
                color.g = mix(color.g, baseColor.g * uTint.g, 0.8);
                
                // Scratches
                vec4 scratches = texture2D(tScratchesNoise, vUv + vec2(uTime * 0.05, 0.0));
                if (scratches.r > 0.95) {
                    color = mix(color, vec3(1.0), (scratches.r - 0.95) / 0.05 * 0.3);
                }
                
                // Crosshair
                vec4 crosshair = texture2D(tCrosshair, vUv);
                if (crosshair.a > 0.5) {
                    color = mix(color, crosshair.rgb, crosshair.a * 0.8);
                }
                
                // Vignette Application
                color = mix(vec3(0.0), color, 1.0 - vignette);
                float edgeVignette = smoothstep(0.0, circleRadius * 0.3, dist);
                color *= mix(0.6, 1.0, edgeVignette);
                color = mix(color, color * uTint, 0.2);
                
                // --- COORDINATE DISPLAY LOGIC ---
                vec2 screenPos = vUv - vec2(0.5, 0.5);
                
                // Area Check
                if (screenPos.x > -0.40 && screenPos.x < 0.0 && dist > circleRadius) {
                    
                    // Variable Width Settings
                    float stdW = 0.015;   // Standard width for numbers/letters (tighter than before)
                    float dotW = 0.008;   // Narrow width for dot
                    float charHeight = 0.04;
                    float lineSpacing = 0.08;
                    
                    float yLinePos = 0.0;
                    float xLinePos = yLinePos + lineSpacing;
                    float zLinePos = yLinePos - lineSpacing;
                    
                    int activeLine = -1;
                    float valueToDisplay = 0.0;
                    float currentLineY = 0.0;
                    int labelIndex = 0;

                    if (abs(screenPos.y - xLinePos) < charHeight * 0.5) {
                        activeLine = 0; valueToDisplay = uSubmarineX; currentLineY = xLinePos; labelIndex = 12; // X
                    } else if (abs(screenPos.y - yLinePos) < charHeight * 0.5) {
                        activeLine = 1; valueToDisplay = uSubmarineY; currentLineY = yLinePos; labelIndex = 13; // Y
                    } else if (abs(screenPos.y - zLinePos) < charHeight * 0.5) {
                        activeLine = 2; valueToDisplay = uSubmarineZ; currentLineY = zLinePos; labelIndex = 14; // Z
                    }

                    if (activeLine != -1) {
                        float startX = -0.38;
                        float relX = screenPos.x - startX;
                        
                        // Calculate cutoffs for 7 characters
                        // Layout: Label | Sign | Tens | Ones | Dot | Tenths | Hunds
                        // Widths: stdW  | stdW | stdW | stdW | dotW| stdW   | stdW
                        
                        float p0 = stdW;
                        float p1 = p0 + stdW;
                        float p2 = p1 + stdW;
                        float p3 = p2 + stdW;
                        float p4 = p3 + dotW; // The dot is narrow
                        float p5 = p4 + stdW;
                        float p6 = p5 + stdW;

                        int charPos = -1;
                        float u_char = 0.0;
                        float currentW = stdW;

                        if (relX >= 0.0) {
                            if (relX < p0) {
                                charPos = 0; u_char = relX / stdW;
                            } else if (relX < p1) {
                                charPos = 1; u_char = (relX - p0) / stdW;
                            } else if (relX < p2) {
                                charPos = 2; u_char = (relX - p1) / stdW;
                            } else if (relX < p3) {
                                charPos = 3; u_char = (relX - p2) / stdW;
                            } else if (relX < p4) {
                                charPos = 4; u_char = (relX - p3) / dotW; currentW = dotW;
                            } else if (relX < p5) {
                                charPos = 5; u_char = (relX - p4) / stdW;
                            } else if (relX < p6) {
                                charPos = 6; u_char = (relX - p5) / stdW;
                            }
                        }

                        if (charPos != -1) {
                            float v_char = (screenPos.y - (currentLineY - charHeight * 0.5)) / charHeight;
                            int digitIndex = -1;
                            
                            if (charPos == 0) digitIndex = labelIndex;
                            else if (charPos == 1) digitIndex = valueToDisplay >= 0.0 ? 10 : 11;
                            else if (charPos == 2) digitIndex = getDigit(valueToDisplay, 0.1);
                            else if (charPos == 3) digitIndex = getDigit(valueToDisplay, 1.0);
                            else if (charPos == 4) {
                                digitIndex = 15; // Dot
                                // Crop UVs for dot so it stays round, not squashed
                                // Map 0..1 to 0.3..0.7 of the texture width
                                u_char = mix(0.3, 0.7, u_char); 
                            }
                            else if (charPos == 5) digitIndex = getDigit(valueToDisplay, 10.0);
                            else if (charPos == 6) digitIndex = getDigit(valueToDisplay, 100.0);
                            
                            if (digitIndex != -1) {
                                vec4 dColor = sampleDigit(digitIndex, vec2(u_char, v_char));
                                if (dColor.a > 0.4) {
                                    color = mix(color, dColor.rgb, dColor.a * 0.95);
                                }
                            }
                        }
                    }
                }
                
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
