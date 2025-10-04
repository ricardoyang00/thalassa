import * as THREE from 'three';

class MyPicture extends THREE.Object3D {
    constructor(app, photoTexture, frameTexture, frameColor = "#8B4513") {
        super();
        this.app = app;
        this.type = 'Group';

        const frameMaterial = new THREE.MeshPhongMaterial({ 
            color: frameColor,
            shininess: 30,
            specular: 0x222222,
            map: frameTexture,
        });

        const pictureMaterial = new THREE.MeshBasicMaterial({ 
            map: photoTexture,
        });

        const frameGeometry = new THREE.BoxGeometry(1.2, 1.5, 0.05);
        const frameMesh = new THREE.Mesh(frameGeometry, frameMaterial);
        this.add(frameMesh);

        const pictureGeometry = new THREE.BoxGeometry(1.05, 1.35, 0.01);
        const pictureMesh = new THREE.Mesh(pictureGeometry, pictureMaterial);
        pictureMesh.position.set(0, 0, 0.03);
        this.add(pictureMesh);
    }
}

MyPicture.prototype.isGroup = true;

export { MyPicture };
