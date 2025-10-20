import * as THREE from 'three';

class Tube extends THREE.Object3D {
    constructor(material = new THREE.MeshPhongMaterial(), radiusTop = 1, radiusBottom = 1, height = 1, thickness = .1, radialSegments = 32, heightSegments = 1) {
        super();
        this.height = height;

        const outerMaterial = material.clone();
        outerMaterial.side = THREE.FrontSide;
        const innerMaterial = material.clone();
        innerMaterial.side = THREE.BackSide;

        const tube = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, heightSegments, true), outerMaterial);

        const outerCylinder = new THREE.Object3D();
        outerCylinder.add(tube.clone());
        this.add(outerCylinder);

        const innerCylinder = new THREE.Object3D();
        tube.material = innerMaterial;
        innerCylinder.add(tube);
        const innerScale = 1.0 - thickness;
        innerCylinder.scale.set(innerScale, 1, innerScale);
        this.add(innerCylinder);

        const ring = new THREE.Mesh(new THREE.RingGeometry(innerScale * radiusTop, radiusTop, radialSegments), outerMaterial);
        ring.rotateX(-Math.PI / 2);
        ring.position.y = height / 2;
        this.add(ring.clone());

        ring.scale.set(radiusBottom / radiusTop, radiusBottom / radiusTop, 1);
        ring.position.y = -height / 2;
        ring.rotateX(Math.PI);
        this.add(ring);
    }
}

export { Tube };
