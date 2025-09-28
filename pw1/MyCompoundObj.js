import * as THREE from 'three';

class MyCompoundObj extends THREE.Object3D {

    constructor(app) {
        super();
        this.app = app;
        this.type = 'Group';

        const screenMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const frameMaterial = new THREE.MeshBasicMaterial({ color: 0x2c2c2c });
        const standMaterial = new THREE.MeshBasicMaterial({ color: 0x666666 });
        const baseMaterial = new THREE.MeshBasicMaterial({ color: 0x444444 });
        const powerButtonMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });

        // Screen
        const screenGeometry = new THREE.BoxGeometry(4, 2.5, 0.01);
        const screen = new THREE.Mesh(screenGeometry, screenMaterial);
        screen.position.set(0, 2, 0);
        this.add(screen);

        // Frame around screen
        const frameGeometry = new THREE.BoxGeometry(4.3, 2.8, 0.2);
        const frame = new THREE.Mesh(frameGeometry, frameMaterial);
        frame.position.set(0, 2, -0.1);
        this.add(frame);

        // Back
        const backGeometry = new THREE.BoxGeometry(4.2, 2.7, 0.5);
        const back = new THREE.Mesh(backGeometry, frameMaterial);
        back.position.set(0, 2, -0.4);
        this.add(back);

        // Stand
        const standGeometry = new THREE.CylinderGeometry(0.15, 0.15, 1, 8);
        const stand = new THREE.Mesh(standGeometry, standMaterial);
        stand.position.set(0, 0.6, -0.3);
        this.add(stand);

        // Base
        const baseGeometry = new THREE.CylinderGeometry(0.8, 0.8, 0.1, 12);
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        base.position.set(0, 0.1, -0.3);
        this.add(base);

        // Power button
        const buttonGeometry = new THREE.CylinderGeometry(0.05, 0.05, 0.02, 8);
        const powerButton = new THREE.Mesh(buttonGeometry, powerButtonMaterial);
        powerButton.rotation.x = Math.PI / 2;
        powerButton.position.set(1.8, 0.68, 0);
        this.add(powerButton)
    }
}

MyCompoundObj.prototype.isGroup = true;

export { MyCompoundObj };