import * as THREE from 'three';

class MyAcousticFoam extends THREE.Object3D {
    constructor(app, {
        wallWidth = 10,
        wallHeight = 5,
        triangleSize = 0.3,
        triangleHeight = 0.15,
        color = 0x333333,
        rows = 10,
        cols = 10
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        // Load sponge texture
        const spongeTexture = new THREE.TextureLoader().load('textures/sponge.jpg');
        spongeTexture.wrapS = THREE.RepeatWrapping;
        spongeTexture.wrapT = THREE.RepeatWrapping;
        spongeTexture.repeat.set(1, 1); // Adjust repeat as needed

        // Create two different materials for alternating colors with sponge texture
        const greyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,          // Keep original grey color
            shininess: 10,
            roughness: 0.8,
            map: spongeTexture,       // Add sponge texture
            // Use multiply blend to preserve the base color while adding texture detail
        });

        const whiteMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xcccccc,          // Keep original white color
            shininess: 10,
            roughness: 0.8,
            map: spongeTexture,       // Add sponge texture
            // Use multiply blend to preserve the base color while adding texture detail
        });

        // Create the base wall with sponge texture
        const baseGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, 0.02);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,          // Keep dark base color
            map: spongeTexture        // Add texture to base as well
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        this.add(baseMesh);

        // Create quadratic pyramid foam pattern
        const pyramidGeometry = new THREE.ConeGeometry(triangleSize/2, triangleHeight, 4);
        
        // Calculate spacing so pyramids touch each other (no gaps)
        const spacingX = triangleSize - 0.05; // slight overlap to avoid gaps
        const spacingY = triangleSize - 0.05;
        
        // Recalculate rows and cols based on pyramid size to fit the wall
        const actualCols = Math.floor(wallWidth / spacingX);
        const actualRows = Math.floor(wallHeight / spacingY);
        
        // Center the pattern on the wall
        const startX = -wallWidth/2 + (wallWidth - actualCols * spacingX) / 2 + spacingX/2;
        const startY = -wallHeight/2 + (wallHeight - actualRows * spacingY) / 2 + spacingY/2;
        
        for (let row = 0; row < actualRows; row++) {
            for (let col = 0; col < actualCols; col++) {
                // Determine which 4x4 block this pyramid belongs to
                const blockRow = Math.floor(row / 4);
                const blockCol = Math.floor(col / 4);
                
                // Alternate material based on block position (checkerboard pattern)
                const isEvenBlock = (blockRow + blockCol) % 2 === 0;
                const pyramidMaterial = isEvenBlock ? greyMaterial : whiteMaterial;
                
                const pyramid = new THREE.Mesh(pyramidGeometry, pyramidMaterial);
                
                // Position pyramids touching each other
                const x = startX + col * spacingX;
                const y = startY + row * spacingY;
                const z = triangleHeight/2 + 0.01; // slightly in front of base wall
                
                pyramid.position.set(x, y, z);
                
                // Rotate pyramids to point outward from wall
                pyramid.rotation.y = Math.PI / 4; // rotate to make square base face viewer
                pyramid.rotation.x = Math.PI / 2; // point toward viewer
                
                this.add(pyramid);
            }
        }
    }

    // Method to change foam color (now with texture consideration)
    setFoamColor(color) {
        this.children.forEach((child, index) => {
            if (index > 0) { // skip the base wall (first child)
                // Only change the base color, keep the texture
                child.material.color.set(color);
            }
        });
    }
}

MyAcousticFoam.prototype.isGroup = true;

export { MyAcousticFoam };