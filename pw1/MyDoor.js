import * as THREE from 'three';

class MyDoor extends THREE.Object3D {
    constructor(app, metalTexture) {
        super();
        this.app = app;
        this.type = 'Group';

        const width = 1.0; 
        const height = 2.1;
        const frameThickness = 0.06;
        const frameDepth = 0.12;
        const doorThickness = 0.04;
        
        // Door panel material
        const doorMaterial = new THREE.MeshPhongMaterial({
            map: metalTexture,
            color: "#3a3a3a",
            specular: "#666666",
            shininess: 80
        });
        
        // Door panel
        const doorGeometry = new THREE.BoxGeometry(width - frameThickness * 2, height - frameThickness * 2, doorThickness);
        const doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
        doorMesh.position.set(0, height/2, 0);
        this.add(doorMesh);

        // Metal frame materials
        const frameMaterial = new THREE.MeshPhongMaterial({
            map: metalTexture,
            color: "#2a2a2a"
        });

        const darkFrameMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a"
        });

        // Main frame borders
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(width, frameThickness, frameDepth);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        topFrame.position.set(0, height - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topFrame);

        // Bottom frame (threshold)
        const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        bottomFrame.position.set(0, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomFrame);

        // Left frame (door jamb)
        const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, height, frameDepth);
        const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
        leftFrame.position.set(-width/2 + frameThickness/2, height/2, frameDepth/2 - 0.02);
        this.add(leftFrame);

        // Right frame (door jamb)
        const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
        rightFrame.position.set(width/2 - frameThickness/2, height/2, frameDepth/2 - 0.02);
        this.add(rightFrame);

        // Door panels (decorative rectangles)
        // Upper panel
        const upperPanelGeometry = new THREE.BoxGeometry(width - 0.2, 0.8, 0.02);
        const upperPanel = new THREE.Mesh(upperPanelGeometry, darkFrameMaterial);
        upperPanel.position.set(0, height - 0.5, doorThickness/2 + 0.01);
        this.add(upperPanel);

        // Lower panel
        const lowerPanelGeometry = new THREE.BoxGeometry(width - 0.2, 0.8, 0.02);
        const lowerPanel = new THREE.Mesh(lowerPanelGeometry, darkFrameMaterial);
        lowerPanel.position.set(0, 0.6, doorThickness/2 + 0.01);
        this.add(lowerPanel);

        // Door handle
        const handleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.15, 16);
        const handleMaterial = new THREE.MeshPhongMaterial({
            color: "#888888",
            specular: "#aaaaaa",
            shininess: 100,
            map: metalTexture
        });
        const doorHandle = new THREE.Mesh(handleGeometry, handleMaterial);
        doorHandle.position.set(width/2 - 0.15, height/2, doorThickness/2 );
        doorHandle.rotation.z = Math.PI / 2;
        this.add(doorHandle);

        // Door knob
        const knobGeometry = new THREE.SphereGeometry(0.04, 16, 16);
        const doorKnob = new THREE.Mesh(knobGeometry, handleMaterial);
        doorKnob.position.set(width/2 - 0.15, height/2, doorThickness/2 + 0.055);
        this.add(doorKnob);

        // Door threshold (bottom ledge)
        const thresholdGeometry = new THREE.BoxGeometry(width + 0.1, 0.05, 0.08);
        const doorThreshold = new THREE.Mesh(thresholdGeometry, frameMaterial);
        doorThreshold.position.set(0, 0, frameDepth/2 + 0.02);
        this.add(doorThreshold);

        // Door header (top trim)
        const headerGeometry = new THREE.BoxGeometry(width + 0.08, 0.08, 0.02);
        const doorHeader = new THREE.Mesh(headerGeometry, frameMaterial);
        doorHeader.position.set(0, height - frameThickness/2 + 0.04, frameDepth/2 + 0.01);
        this.add(doorHeader);

        // Corner reinforcements
        const cornerSize = 0.08;
        const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, frameDepth + 0.01);
        
        // Top corners
        const topLeftCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        topLeftCorner.position.set(-width/2 + frameThickness/2, height - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topLeftCorner);

        const topRightCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        topRightCorner.position.set(width/2 - frameThickness/2, height - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topRightCorner);

        // Bottom corners
        const bottomLeftCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        bottomLeftCorner.position.set(-width/2 + frameThickness/2, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomLeftCorner);

        const bottomRightCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        bottomRightCorner.position.set(width/2 - frameThickness/2, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomRightCorner);
    }
}

MyDoor.prototype.isGroup = true;

export { MyDoor };