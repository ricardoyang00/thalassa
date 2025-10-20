import * as THREE from 'three';
import { Tube } from '../primitives/Tube.js';
import { SgiUtils } from '../../SgiUtils.js';

class TubeCoral extends THREE.LOD {
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');

    constructor(color = 0xffffff, size = 1) {
        super();
        const layers = 3;
        let n = 4;

        const material = new THREE.MeshPhongMaterial({
            color,
            map: TubeCoral.#texture,
            bumpMap: TubeCoral.#texture,
            bumpScale: 5,
        });

        const attributes = [];
        let angle = 0;
        let alphaAng = 2 * Math.PI / n;
        for (let layer = 1; layer <= layers; ++layer, n *= 2, alphaAng /= 2) {
            for (let j = 0; j < n; ++j, angle += alphaAng) {
                const ang = angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3);
                const topRadius = SgiUtils.rand(size / 10, size / 7);
                const height = SgiUtils.rand(size / 2, size);
                const thickness = SgiUtils.rand(0.2, 0.3);

                attributes.push({
                    attr: [
                        material,
                        topRadius,
                        topRadius / 2,
                        height,
                        thickness,
                    ],
                    rot: {
                        y: angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3),
                        x: layer * SgiUtils.rand(Math.PI / 20, Math.PI / 10),
                    },
                    pos: new THREE.Vector3(
                        layer * size * Math.sin(ang) / 8,
                        0,
                        layer * size * Math.cos(ang) / 8,
                    ),
                })
            }
        }

        const detailLevelGen = (segments) => {
            const group = new THREE.Group();
            attributes.forEach((attr) => {
                const tube = new Tube(...attr.attr, segments);
                tube.position.y = tube.height / 2;

                // rotate tube around base
                const container = new THREE.Object3D();
                container.add(tube);
                container.rotateY(attr.rot.y);
                container.rotateX(attr.rot.x);
                container.position.copy(attr.pos);
                group.add(container);
            });
            return group;
        }

        this.addLevel(detailLevelGen(32), 0);
        this.addLevel(detailLevelGen(8), size * 20);
        this.addLevel(detailLevelGen(3), size * 50);
    }
}

export { TubeCoral };
