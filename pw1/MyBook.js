import * as THREE from 'three';

class MyBook extends THREE.Object3D {
    constructor(app, coverColor = 0x8B4513) {
        super();
        this.app = app;
        this.type = 'Group';

        const coverMaterial = new THREE.MeshPhongMaterial({ 
            color: coverColor,
            shininess: 25,
            specular: 0,
        });

        const paperTexture = new THREE.TextureLoader().load('textures/paper.jpg');
        paperTexture.wrapS = THREE.RepeatWrapping;
        paperTexture.wrapT = THREE.RepeatWrapping;
        paperTexture.repeat.set(1, 1);

        const pagesMaterial = new THREE.MeshPhongMaterial({ 
            color: 0xfffaf0,
            shininess: 2,
            map: paperTexture,
        });

        const spineMaterial = new THREE.MeshPhongMaterial({ 
            color: coverColor,
            shininess: 30,
        });

        const pagesGeometry = new THREE.BoxGeometry(0.8, 1.2, 0.12);
        const pagesMesh = new THREE.Mesh(pagesGeometry, pagesMaterial);
        pagesMesh.position.set(0, 0.61, 0);
        this.add(pagesMesh);

        const frontCoverGeometry = new THREE.BoxGeometry(0.81, 1.22, 0.02);
        const frontCoverMesh = new THREE.Mesh(frontCoverGeometry, coverMaterial);
        frontCoverMesh.position.set(0.0131, 0.61, 0.07);
        this.add(frontCoverMesh);

        const backCoverGeometry = new THREE.BoxGeometry(0.81, 1.22, 0.02);
        const backCoverMesh = new THREE.Mesh(backCoverGeometry, coverMaterial);
        backCoverMesh.position.set(0.0131, 0.61, -0.07);
        this.add(backCoverMesh);

        const spineGeometry = new THREE.BoxGeometry(0.02, 1.22, 0.16);
        const spineMesh = new THREE.Mesh(spineGeometry, spineMaterial);
        spineMesh.position.set(-0.401, 0.61, 0);
        this.add(spineMesh);
    }
}

MyBook.prototype.isGroup = true;

export { MyBook };