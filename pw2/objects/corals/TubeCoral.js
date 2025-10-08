import * as THREE from 'three';
import { Tube } from '../primitives/Tube.js';
import { SgiUtils } from '../../SgiUtils.js';

class TubeCoral extends THREE.Object3D {
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');

    constructor(color = 0xffffff, size = 1) {
        super();
        const layers = 2;
        let n = 4;
        let angle = 0;
        let alphaAng = 2 * Math.PI / n;

        const material = new THREE.MeshPhongMaterial({
            color,
            map: TubeCoral.#texture,
            bumpMap: TubeCoral.#texture,
            bumpScale: 5,
        })

        for (let layer = 1; layer <= layers; ++layer, n *= 2, alphaAng /= 2) {
            for (let j = 0; j < n; ++j, angle += alphaAng) {
                const ang = angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3);
                const topRadius = SgiUtils.rand(size / 10, size / 7);
                const tube = new Tube(
                    material,
                    topRadius,
                    topRadius / 2,
                    SgiUtils.rand(size / 2, size),
                    SgiUtils.rand(0.2, 0.3),
                );
                tube.position.y = tube.height / 2;

                const container = new THREE.Object3D();
                container.add(tube);
                container.rotateY(ang);
                container.rotateX(layer * SgiUtils.rand(Math.PI / 20, Math.PI / 10));

                container.position.add(new THREE.Vector3(
                    layer * size * Math.sin(ang) / 8,
                    0,
                    layer * size * Math.cos(ang) / 8,
                ));
                this.add(container);
            }
        }
    }
}

export { TubeCoral };
