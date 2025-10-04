import * as THREE from 'three';

class MyIcons extends THREE.Object3D {
    constructor(woodTexture) {
        super();
        this.type = 'Group';

        const triangleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00BFFF,
            emissive: 0x00BFFF,
            emissiveIntensity: 0.8,
            shininess: 100 
        });
        const circleMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x00FFCC,
            emissive: 0x00FFCC,
            emissiveIntensity: 0.8,
            shininess: 100 
        });
        const xMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFFD700,
            emissive: 0xFFD700,
            emissiveIntensity: 0.8,
            shininess: 100 
        });
        const squareMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xFF4500,
            emissive: 0xFF4500,
            emissiveIntensity: 0.8,
            shininess: 100 
        });

        const iconSize = 0.4;
        const spacing = 0.45;

        // Triangle using boxes as sides
        const triangleGroup = new THREE.Group();
        const sideGeometry = new THREE.BoxGeometry(0.4, 0.04, 0.06);
        
        const side1 = new THREE.Mesh(sideGeometry, triangleMaterial);
        side1.position.set(-0.11, 0.1, 0);
        side1.rotation.z = Math.PI / 3;
        triangleGroup.add(side1);
        
        const side2 = new THREE.Mesh(sideGeometry, triangleMaterial);
        side2.position.set(0.11, 0.1, 0);
        side2.rotation.z = -Math.PI / 3;
        triangleGroup.add(side2);
        
        const side3 = new THREE.Mesh(sideGeometry, triangleMaterial);
        side3.position.set(0, -0.1, 0);
        triangleGroup.add(side3);
        
        triangleGroup.position.x = -spacing * 1.5;
        triangleGroup.position.y = -0.08;
        this.add(triangleGroup);

        // Circle
        const circleGeometry = new THREE.TorusGeometry(iconSize * 0.46, 0.035, 8, 16);
        const circle = new THREE.Mesh(circleGeometry, circleMaterial);
        circle.position.x = -spacing * 0.5;
        circle.position.y = 0.02;
        this.add(circle);

        // X (using 2 crossed boxes)
        const xGroup = new THREE.Group();
        const xBarGeometry = new THREE.BoxGeometry(0.5, 0.03, 0.06);
    
        const xBar1 = new THREE.Mesh(xBarGeometry, xMaterial);
        xBar1.rotation.z = Math.PI / 4;
        xGroup.add(xBar1);
        
        const xBar2 = new THREE.Mesh(xBarGeometry, xMaterial);
        xBar2.rotation.z = -Math.PI / 4;
        xGroup.add(xBar2);
        
        xGroup.position.x = spacing * 0.5;
        this.add(xGroup);

        // Square
        const squareGroup = new THREE.Group();
        
        const squareSideGeometry = new THREE.BoxGeometry(0.4, 0.03, 0.06);
        const squareTopBottomGeometry = new THREE.BoxGeometry(0.03, 0.4, 0.06);
        
        const squareTop = new THREE.Mesh(squareSideGeometry, squareMaterial);
        squareTop.position.y = 0.185;
        squareGroup.add(squareTop);
        
        const squareBottom = new THREE.Mesh(squareSideGeometry, squareMaterial);
        squareBottom.position.y = -0.185;
        squareGroup.add(squareBottom);
        
        const squareLeft = new THREE.Mesh(squareTopBottomGeometry, squareMaterial);
        squareLeft.position.x = -0.185;
        squareGroup.add(squareLeft);
        
        const squareRight = new THREE.Mesh(squareTopBottomGeometry, squareMaterial);
        squareRight.position.x = 0.185;
        squareGroup.add(squareRight);
        
        squareGroup.position.x = spacing * 1.5;
        this.add(squareGroup);

        const baseGeometry = new THREE.BoxGeometry(2, 0.02, 0.5);
        const baseMaterial = new THREE.MeshPhongMaterial({ 
            color: "#858585",
            shininess: 100,
            map: woodTexture
        });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.y = -0.23;
        this.add(base);
    }
}

MyIcons.prototype.isGroup = true;

export { MyIcons };