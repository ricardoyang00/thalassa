import * as THREE from 'three';

class Bubble {
    constructor(scene) {
        this.scene = scene;
        this.bubbles = [];

        this.debugMeshes = new Map();

        this.geometry = new THREE.SphereGeometry(1, 24, 24);
        this.material = new THREE.MeshPhongMaterial({
            color: 0x88ccff,
            transparent: true,
            opacity: 0.4,
            shininess: 100,
            specular: 0xffffff
        });

        this.lifeTime = 2.0;
    }

    spawnBubble(position, scale = 0.2) {
        const mesh = new THREE.Mesh(this.geometry, this.material);
        mesh.position.copy(position);
        const randomScale = scale * (0.8 + Math.random() * 0.5);
        mesh.scale.set(randomScale, randomScale, randomScale);
        mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
        this.scene.add(mesh);
        this.bubbles.push({
            mesh: mesh,
            age: 0,
            wobbleSpeed: 2.0 + Math.random() * 2.0,
            wobbleOffset: Math.random() * Math.PI * 2,
            riseSpeed: 1.0 + Math.random() * 0.5,
            drift: new THREE.Vector3((Math.random() - 0.5) * 0.5, 0, (Math.random() - 0.5) * 0.5)
        });
    }

    spawnFromObject(object, offset = new THREE.Vector3(0, 0, 0), scale = 0.2) {
        const localOffset = offset.clone();
        localOffset.applyQuaternion(object.quaternion);
        const spawnPos = object.position.clone().add(localOffset);
        this.spawnBubble(spawnPos, scale);
    }

    /**
     * DEBUG HELPER: Visualizes the spawn position with a RED DOT.
     */
    updateSpawnHelper(object, offset, id = 'default') {
        let dot = this.debugMeshes.get(id);

        // Create if it doesn't exist
        if (!dot) {
            const geo = new THREE.SphereGeometry(0.1, 8, 8);
            const mat = new THREE.MeshBasicMaterial({ color: 0xff0000, depthTest: false, transparent: true, opacity: 0.8 });
            dot = new THREE.Mesh(geo, mat);
            this.scene.add(dot);
            this.debugMeshes.set(id, dot);
        }

        // Position logic
        const localOffset = offset.clone();
        localOffset.applyQuaternion(object.quaternion);
        const worldPos = object.position.clone().add(localOffset);
        dot.position.copy(worldPos);
    }

    update(dt) {
        for (let i = this.bubbles.length - 1; i >= 0; i--) {
            const b = this.bubbles[i];
            b.age += dt;
            b.mesh.position.y += b.riseSpeed * dt;
            b.mesh.position.x += b.drift.x * dt;
            b.mesh.position.z += b.drift.z * dt;
            const wobble = Math.sin((b.age * b.wobbleSpeed) + b.wobbleOffset) * 0.02;
            b.mesh.position.x += wobble;
            const growth = 1 + (dt * 0.5);
            b.mesh.scale.multiplyScalar(growth);
            if (b.age >= this.lifeTime) {
                this.removeBubble(i);
            }
        }
    }

    removeBubble(index) {
        const b = this.bubbles[index];
        this.scene.remove(b.mesh);
        this.bubbles.splice(index, 1);
    }
    
    dispose() {
        this.geometry.dispose();
        this.material.dispose();
        this.bubbles.forEach(b => this.scene.remove(b.mesh));
        this.bubbles = [];

        // Cleanup all debug dots
        this.debugMeshes.forEach(mesh => this.scene.remove(mesh));
        this.debugMeshes.clear();
    }
}

export { Bubble };