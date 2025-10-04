import * as THREE from 'three';

// landscape should be a texture path
class MyWindow extends THREE.Object3D {
    constructor(app, landscapeTexture, metalTexture, lightIntensity = 0.5, emissiveIntensity = 0.3) {
        super();
        this.app = app;
        this.lightIntensity = lightIntensity;
        this.type = 'Group';

        const y = 2;
        const x = y / 1.5;
        const frameThickness = 0.04;
        const frameDepth = 0.08;
        
        // window glass
        const windowGeometry = new THREE.PlaneGeometry(x - frameThickness * 2, y - frameThickness * 2);
        
        const windowMaterial = new THREE.MeshPhongMaterial({
            map: landscapeTexture,
            transparent: true,
            opacity: 1,
            shininess: 100,
            emissive: 0xb3c6ff,
            emissiveIntensity: emissiveIntensity
        });
        
        const windowMesh = new THREE.Mesh(windowGeometry, windowMaterial);
        windowMesh.position.set(0, y/2, 0);
        this.add(windowMesh);

        // metal frame materials
        const frameMaterial = new THREE.MeshPhongMaterial({
            map: metalTexture,
            color: "#2a2a2a"
        });

        const darkFrameMaterial = new THREE.MeshPhongMaterial({
            color: "#1a1a1a"
        });

        // Main frame borders (thicker)
        // Top frame
        const topFrameGeometry = new THREE.BoxGeometry(x, frameThickness, frameDepth);
        const topFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        topFrame.position.set(0, y - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topFrame);

        // Bottom frame
        const bottomFrame = new THREE.Mesh(topFrameGeometry, frameMaterial);
        bottomFrame.position.set(0, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomFrame);

        // Left frame
        const sideFrameGeometry = new THREE.BoxGeometry(frameThickness, y, frameDepth);
        const leftFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
        leftFrame.position.set(-x/2 + frameThickness/2, y/2, frameDepth/2 - 0.02);
        this.add(leftFrame);

        // Right frame
        const rightFrame = new THREE.Mesh(sideFrameGeometry, frameMaterial);
        rightFrame.position.set(x/2 - frameThickness/2, y/2, frameDepth/2 - 0.02);
        this.add(rightFrame);

        // Window cross dividers (mullions)
        // Horizontal divider
        const horizontalDividerGeometry = new THREE.BoxGeometry(x - frameThickness * 2, 0.03, 0.02);
        const horizontalDivider = new THREE.Mesh(horizontalDividerGeometry, darkFrameMaterial);
        horizontalDivider.position.set(0, y/2, 0.01);
        this.add(horizontalDivider);

        // Vertical divider
        const verticalDividerGeometry = new THREE.BoxGeometry(0.03, y - frameThickness * 2, 0.02);
        const verticalDivider = new THREE.Mesh(verticalDividerGeometry, darkFrameMaterial);
        verticalDivider.position.set(0, y/2, 0.01);
        this.add(verticalDivider);

        // Window sill (bottom ledge)
        const sillGeometry = new THREE.BoxGeometry(x + 0.1, 0.08, 0.05);
        const windowSill = new THREE.Mesh(sillGeometry, frameMaterial);
        windowSill.position.set(0, frameThickness/2 - 0.04, frameDepth/2 + 0.02);
        this.add(windowSill);

        // Window header (top ledge)
        const headerGeometry = new THREE.BoxGeometry(x + 0.05, 0.05, 0.01);
        const windowHeader = new THREE.Mesh(headerGeometry, frameMaterial);
        windowHeader.position.set(0, y - frameThickness/2 + 0.025, frameDepth/2 + 0.01);
        this.add(windowHeader);

        // Corner reinforcements
        const cornerSize = 0.1;
        const cornerGeometry = new THREE.BoxGeometry(cornerSize, cornerSize, frameDepth + 0.01);
        
        // Top corners
        const topLeftCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        topLeftCorner.position.set(-x/2 + frameThickness/2, y - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topLeftCorner);

        const topRightCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        topRightCorner.position.set(x/2 - frameThickness/2, y - frameThickness/2, frameDepth/2 - 0.02);
        this.add(topRightCorner);

        // Bottom corners
        const bottomLeftCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        bottomLeftCorner.position.set(-x/2 + frameThickness/2, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomLeftCorner);

        const bottomRightCorner = new THREE.Mesh(cornerGeometry, darkFrameMaterial);
        bottomRightCorner.position.set(x/2 - frameThickness/2, frameThickness/2, frameDepth/2 - 0.02);
        this.add(bottomRightCorner);


        // moonlight spotlight coming through the window
        this.moonlight = new THREE.SpotLight(0xb3c6ff, this.lightIntensity, 10, Math.PI / 10, 0.3, 1);
        this.moonlight.position.set(0, y, -2);
        this.moonlight.target.position.set(0, -0.9, 2);
        
        // Add subtle blue tint for moonlight
        this.moonlight.color.setHSL(0.6, 0.3, 0.8);
    

        this.add(this.moonlight);
        this.add(this.moonlight.target);

        this.spotLightHelper = new THREE.SpotLightHelper(this.moonlight);
        this.spotLightHelper.visible = false;
        this.add(this.spotLightHelper);

    }

    setHelperVisible(visible) {
        if (this.spotLightHelper) {
            this.spotLightHelper.visible = visible;
            this.spotLightHelper.update();
        }
    }
    
    getLight() {
        return this.moonlight;
    }
}

MyWindow.prototype.isGroup = true;

export { MyWindow };