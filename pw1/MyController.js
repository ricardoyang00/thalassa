import * as THREE from 'three';

class MyController extends THREE.Object3D {
    constructor() {
        super();
        this.type = 'Group';

        
        const bodyMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x444444,
            emissive: 0x111111,
            emissiveIntensity: 0.2,
            shininess: 100 
        });
        const buttonMaterial = new THREE.MeshPhongMaterial({ 
            color: 0x666666,
            emissive: 0x222222,
            emissiveIntensity: 0.3,
            shininess: 80 
        });
        const redButtonMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const greenButtonMaterial = new THREE.MeshPhongMaterial({ color: 0x00ff00 });
        const blueButtonMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const yellowButtonMaterial = new THREE.MeshPhongMaterial({ color: 0xffff00 });

        // Controller main body
        const bodyGeometry = new THREE.BoxGeometry(2, 1, 0.3);
        const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.add(body);

        // D-pad (4 directional buttons)
        const dpadButtonGeometry = new THREE.BoxGeometry(0.15, 0.15, 0.05);
        
        // D-pad center
        const dpadCenter = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 0.03, 8), buttonMaterial);
        dpadCenter.position.set(-0.6, 0.15, 0.162);
        dpadCenter.rotation.x = Math.PI / 2;
        this.add(dpadCenter);

        // D-pad buttons
        const dpadUp = new THREE.Mesh(dpadButtonGeometry, buttonMaterial);
        dpadUp.position.set(-0.6, 0.3, 0.162);
        this.add(dpadUp);

        const dpadDown = new THREE.Mesh(dpadButtonGeometry, buttonMaterial);
        dpadDown.position.set(-0.6, 0, 0.162);
        this.add(dpadDown);

        const dpadLeft = new THREE.Mesh(dpadButtonGeometry, buttonMaterial);
        dpadLeft.position.set(-0.75, 0.15, 0.162);
        this.add(dpadLeft);

        const dpadRight = new THREE.Mesh(dpadButtonGeometry, buttonMaterial);
        dpadRight.position.set(-0.45, 0.15, 0.162);
        this.add(dpadRight);

        const actionButtonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.03, 12);
        
        const buttonA = new THREE.Mesh(actionButtonGeometry, greenButtonMaterial);
        buttonA.position.set(0.6, 0, 0.162);
        buttonA.rotation.x = Math.PI / 2;
        this.add(buttonA);

        const buttonB = new THREE.Mesh(actionButtonGeometry, redButtonMaterial);
        buttonB.position.set(0.75, 0.15, 0.162);
        buttonB.rotation.x = Math.PI / 2;
        this.add(buttonB);

        const buttonX = new THREE.Mesh(actionButtonGeometry, blueButtonMaterial);
        buttonX.position.set(0.45, 0.15, 0.162);
        buttonX.rotation.x = Math.PI / 2;
        this.add(buttonX);

        const buttonY = new THREE.Mesh(actionButtonGeometry, yellowButtonMaterial);
        buttonY.position.set(0.6, 0.3, 0.162);
        buttonY.rotation.x = Math.PI / 2;
        this.add(buttonY);

        const rectangleGeometry = new THREE.BoxGeometry(0.12, 0.06, 0.05);
        const selectButton = new THREE.Mesh(rectangleGeometry, buttonMaterial);
        selectButton.position.set(-0.2, -0.05, 0.162);
        this.add(selectButton);

        const startButton = new THREE.Mesh(rectangleGeometry, buttonMaterial);
        startButton.position.set(0.2, -0.05, 0.162);
        this.add(startButton);
    }
}

MyController.prototype.isGroup = true;

export { MyController };