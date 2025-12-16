import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, MeshBVHHelper, SAH, AVERAGE } from 'three-mesh-bvh';

class SgiUtils {
    static #seed = 0;
    static debug = false;

    static setSeed(seed) {
        this.#seed = seed;
    }

    static rand(from = 1, to = 0) {
        if (from > to) {
            const temp = from;
            from = to;
            to = temp;
        }

        // mulberry32
        let t = this.#seed += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return from + (to - from) * ((t ^ t >>> 14) >>> 0) / 4294967296;
    }

    static randInt(from = 1, to = 0) {
        return Math.floor(this.rand(from, to));
    }

    static collideTestCounter = 0;
    static getCollidingObjects(a, b, result = new Set()) {
        this.collideTestCounter++;

        if (a.obj) {
            if (b.obj) {
                if (a.box.intersectsBox(b.box))
                    result.add({a: a.obj, b: b.obj});
            } else {
                b.children.forEach(node => this.getCollidingObjects(a, node, result));
            }
        } else if (b.obj) {
            a.children.forEach(node => this.getCollidingObjects(node, b, result));
        } else {
            a.children.forEach(nodeA => b.children.forEach(nodeB => {
                if (nodeA.box.intersectsBox(nodeB.box))
                    this.getCollidingObjects(nodeA, nodeB, result);
            }));
        }

        return result;
    }

    static isObjectVisible(obj) {
        while (obj) {
            if (!obj.visible)
                return false;
            obj = obj.parent;
        }
        return true;
    }

    static buildColliderGeo(obj) {
        obj.updateMatrixWorld();

        const geometries = [];
        obj.traverse((child) => {
            const geo = new THREE.BufferGeometry();
            const fullGeo = (
                child.isMesh ? child.parent?.isLOD ? null : child.geometry :
                child.isLOD ? child.levels[child.levels.length - 1].object.geometry :
                null
            );

            if (!fullGeo)
                return;

            geo.setAttribute('position', fullGeo.getAttribute('position').clone());
            geo.setIndex(fullGeo.index ? fullGeo.index.clone() : null);

            child.updateMatrixWorld();
            geo.applyMatrix4(child.matrixWorld);
            geometries.push(geo);
        });

        const bvhGeo = BufferGeometryUtils.mergeGeometries(geometries);
        bvhGeo.boundsTree = new MeshBVH(bvhGeo);
        return bvhGeo;
    }
}

export { SgiUtils };
