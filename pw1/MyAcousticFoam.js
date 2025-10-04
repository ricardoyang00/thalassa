import * as THREE from 'three';

class MyAcousticFoam extends THREE.Object3D {
    constructor(app, spongeTexture, {
        wallWidth = 10,
        wallHeight = 5,
        triangleSize = 0.3,
        triangleHeight = 0.15
    } = {}) {
        super();
        this.app = app;
        this.type = 'Group';

        const greyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            shininess: 10,
            map: spongeTexture,
        });

        const whiteMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xcccccc,
            shininess: 10,
            map: spongeTexture,
        });


        const baseGeometry = new THREE.BoxGeometry(wallWidth, wallHeight, 0.02);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x1a1a1a,
            map: spongeTexture
        });
        const baseMesh = new THREE.Mesh(baseGeometry, baseMaterial);
        this.add(baseMesh);

        // quadratic pyramid foam pattern
        const pyramidGeometry = new THREE.ConeGeometry(triangleSize/2, triangleHeight, 4);
        

        const spacingX = triangleSize - 0.05;
        const spacingY = triangleSize - 0.05;
        
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
                const z = triangleHeight/2 + 0.01;
                
                pyramid.position.set(x, y, z);
                
                // Rotate pyramids to point outward from wall
                pyramid.rotation.y = Math.PI / 4;
                pyramid.rotation.x = Math.PI / 2;
                
                this.add(pyramid);
            }
        }
    }
}

MyAcousticFoam.prototype.isGroup = true;

export { MyAcousticFoam };