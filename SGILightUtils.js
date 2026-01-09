import * as THREE from 'three';

/**
 * Adds a volumetric light cone effect (Tyndall effect) to a spotlight
 * @param {THREE.Scene} scene - The scene to add the volumetric light to
 * @param {THREE.SpotLight} spotlight - The spotlight to add the volumetric effect to
 * @returns {THREE.Mesh} The volumetric cone mesh
 */
export function addVolumetricLight(scene, spotlight) {
    // Calculate cone dimensions based on spotlight properties
    const distance = spotlight.distance || 100;
    const angle = spotlight.angle;
    const radiusTop = 0.5;
    const radiusBottom = Math.tan(angle) * distance * 0.95;

    // Create cone geometry for the light beam with more segments for smoothness
    const coneGeometry = new THREE.CylinderGeometry(radiusTop, radiusBottom, distance, 32, 50, true);
    
    // Add vertex colors for gradient effect (brighter at source, fading towards end)
    const colors = [];
    const positions = coneGeometry.attributes.position;
    
    for (let i = 0; i < positions.count; i++) {
        const y = positions.getY(i);
        // Reduced gradient falloff for more even distribution
        const intensity = Math.pow((y / distance + 0.5), 2);
        colors.push(intensity, intensity, intensity);
    }
    
    coneGeometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    
    // Custom shader for more natural volumetric look
    const volumetricShader = {
        vertexShader: `
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vColor;
            attribute vec3 color;
            
            void main() {
                vColor = color;
                vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                vViewPosition = -mvPosition.xyz;
                vNormal = normalMatrix * normal;
                gl_Position = projectionMatrix * mvPosition;
            }
        `,
        fragmentShader: `
            uniform vec3 lightColor;
            uniform float opacity;
            varying vec3 vNormal;
            varying vec3 vViewPosition;
            varying vec3 vColor;
            
            void main() {
                // Fresnel-like effect for edges
                vec3 viewDir = normalize(vViewPosition);
                float fresnel = pow(1.0 - abs(dot(viewDir, normalize(vNormal))), 2.5);
                
                // Use vertex color for gradient
                float alpha = opacity * fresnel * vColor.r;
                
                // Add some noise for less uniform appearance
                float noise = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
                alpha *= (0.7 + 0.3 * noise);
                
                gl_FragColor = vec4(lightColor, alpha);
            }
        `,
        uniforms: {
            lightColor: { value: new THREE.Color(spotlight.color).multiplyScalar(2.0) },
            opacity: { value: 0.08 }
        }
    };
    
    const coneMaterial = new THREE.ShaderMaterial({
        vertexShader: volumetricShader.vertexShader,
        fragmentShader: volumetricShader.fragmentShader,
        uniforms: volumetricShader.uniforms,
        transparent: true,
        side: THREE.DoubleSide,
        depthWrite: false,
        blending: THREE.AdditiveBlending
    });

    const lightCone = new THREE.Mesh(coneGeometry, coneMaterial);
    
    // Calculate direction from spotlight to target
    const direction = new THREE.Vector3()
        .subVectors(spotlight.target.position, spotlight.position)
        .normalize();
    
    // Orient the cone to point from spotlight to target
    const up = new THREE.Vector3(0, -1, 0); // Cone points down by default
    const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction);
    lightCone.setRotationFromQuaternion(quaternion);
    
    // Position cone at spotlight, then offset it along its direction by half its height
    // This moves the cone's tip to the spotlight's position
    lightCone.position.copy(spotlight.position)
        .add(direction.multiplyScalar(distance / 2));
    
    // Store reference (in case you need it later)
    spotlight.userData.volumetricCone = lightCone;
    spotlight.userData.volumetricDistance = distance;

    scene.add(lightCone);
    
    return lightCone;
}