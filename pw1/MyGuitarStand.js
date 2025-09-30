import * as THREE from 'three';

class MyGuitarStand extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const material = new THREE.MeshBasicMaterial({color: 0x8B4513});
        const baseGeometry = new THREE.CylinderGeometry(0.015, 0.015, 0.4, 16);

        const leftBase = new THREE.Mesh(baseGeometry, material);
        leftBase.position.set(-0.2, 0.05, 0);
        leftBase.rotation.x = Math.PI / 2;
        this.add(leftBase);

        const rightBase = new THREE.Mesh(baseGeometry, material);
        rightBase.position.set(0.2, 0.05, 0);
        rightBase.rotation.x = Math.PI / 2;
        this.add(rightBase);

        const baseAdditionGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.07, 16);

        const leftFrontBase = new THREE.Mesh(baseAdditionGeometry, material);
        leftFrontBase.position.set(-0.2, 0.05, 0.17);
        leftFrontBase.rotation.x = Math.PI / 2;
        this.add(leftFrontBase);

        const leftBackBase = new THREE.Mesh(baseAdditionGeometry, material);
        leftBackBase.position.set(-0.2, 0.05, -0.17);
        leftBackBase.rotation.x = Math.PI / 2;
        this.add(leftBackBase);

        const rightFrontBase = new THREE.Mesh(baseAdditionGeometry, material);
        rightFrontBase.position.set(0.2, 0.05, 0.17);
        rightFrontBase.rotation.x = Math.PI / 2;
        this.add(rightFrontBase);

        const rightBackBase = new THREE.Mesh(baseAdditionGeometry, material);
        rightBackBase.position.set(0.2, 0.05, -0.17);
        rightBackBase.rotation.x = Math.PI / 2;
        this.add(rightBackBase);

        const supportGeometry = new THREE.CylinderGeometry(0.017, 0.017, 0.5, 16);
        
        const leftSupport = new THREE.Mesh(supportGeometry, material);
        leftSupport.position.set(-0.1, 0.27, 0);
        leftSupport.rotation.z = - Math.PI / 8;
        this.add(leftSupport);

        const rightSupport = new THREE.Mesh(supportGeometry, material);
        rightSupport.position.set(0.1, 0.27, 0);
        rightSupport.rotation.z = Math.PI / 8;
        this.add(rightSupport);

        const topSupport = new THREE.Mesh(baseAdditionGeometry, material);
        topSupport.position.set(0, 0.5, 0);
        topSupport.rotation.z = Math.PI / 2;
        this.add(topSupport);

        const restGeometry = new THREE.CylinderGeometry(0.01, 0.01, 0.15, 16);
        
        const leftRest = new THREE.Mesh(restGeometry, material);
        leftRest.position.set(-0.11, 0.25, 0.075);
        leftRest.rotation.x = Math.PI / 2;
        this.add(leftRest);

        const rightRest = new THREE.Mesh(restGeometry, material);
        rightRest.position.set(0.11, 0.25, 0.075);
        rightRest.rotation.x = Math.PI / 2;
        this.add(rightRest);
    }
}

MyGuitarStand.prototype.isGroup = true;

export { MyGuitarStand };