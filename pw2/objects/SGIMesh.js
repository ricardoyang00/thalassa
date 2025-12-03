import * as THREE from 'three';
import { MeshBVH, MeshBVHHelper, SAH, AVERAGE } from 'three-mesh-bvh';

export class SGIMesh extends THREE.Mesh {
    static new(geometry, material, bvhParams = {}) {
        const mesh = new THREE.Mesh(geometry, material);
        return this.fromThreeMesh(mesh, bvhParams);
    }

    static fromThreeMesh(mesh, bvhParams = {}) {
        const geometry = mesh.geometry;
        geometry.boundsTree = new MeshBVH(geometry, bvhParams);
        mesh.bvh = geometry.boundsTree;
        mesh.bvhhelper = new MeshBVHHelper(mesh);
        mesh.bvhhelper.visible = false;
        mesh.add(mesh.bvhhelper);
        return mesh;
    }
}
