import * as THREE from 'three';

class MyRock extends THREE.Object3D {
    constructor(app, size = 1, randomFunc = Math.random) {
        super();
        this.app = app;
        this.size = size;
        this.random = randomFunc;
        this.buildRock();
    }

    buildRock() {
        const baseRadius = this.size * (0.4 + this.random() * 0.2);
        const topRadius = baseRadius * (0.4 + this.random() * 0.2);
        const height = this.size * (0.6 + this.random() * 0.6);

        const radialSegments = Math.floor(this.random() * 3) + 3;

        const rockGeometry = new THREE.CylinderGeometry(
            topRadius,
            baseRadius,
            height,
            radialSegments
        );

        const texture = new THREE.TextureLoader().load('textures/im-the-rock.jpg');
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(1,1);

        const rockMaterial = new THREE.MeshPhongMaterial({ 
            color: "#696969",
            map: texture,
        });

        const rockMesh = new THREE.Mesh(rockGeometry, rockMaterial);
        
        rockMesh.rotation.x = (this.random() * 2 - 1) * 0.3;
        rockMesh.rotation.y = (this.random() * 2 - 1) * Math.PI;
        rockMesh.rotation.z = (this.random() * 2 - 1) * 0.3;

        this.add(rockMesh);
    }
}

export { MyRock };