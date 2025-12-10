import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { SgiUtils } from '../../SgiUtils.js';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';

function tubeGeoGen(radialSegments) {
    const size = 1;
    const radiusTop = size / 8;
    const radiusBottom = radiusTop / 2;
    const height = size;
    const thickness = 0.25;

    const outerCylinderGeo = new THREE.CylinderGeometry(radiusTop, radiusBottom, height, radialSegments, 1, true);

    const innerScale = 1.0 - thickness;
    const innerCylinderGeo = outerCylinderGeo.clone().scale(innerScale, 1, innerScale);
    innerCylinderGeo.getIndex().array.reverse();

    const ringGeo = new THREE.RingGeometry(innerScale * radiusTop, radiusTop, radialSegments)
        .rotateX(-Math.PI / 2)
        .translate(0, height / 2, 0);

    return BufferGeometryUtils.mergeGeometries([outerCylinderGeo, innerCylinderGeo, ringGeo]).translate(0, height / 2, 0);
};

// Mesh that groups all tube corals for performance reasons
export class TubeCoralsOwner extends InstancedMesh2 {
    static #tubeGeo = [
        tubeGeoGen(32),
        tubeGeoGen(8),
        tubeGeoGen(4),
    ];
    static #texture = new THREE.TextureLoader().load('textures/tube-coral.png');
    static #highDetailMat = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        map: this.#texture,
        bumpMap: this.#texture,
        bumpScale: 5,
    });
    static #mediumDetailMat = (() => {
        const mat = TubeCoralsOwner.#highDetailMat.clone();
        mat.bumpMap = null;
        return mat;
    })();

    constructor() {
        const tubeGeo = TubeCoralsOwner.#tubeGeo;
        // createEntities needed for updateInstances()
        super(tubeGeo[0], TubeCoralsOwner.#highDetailMat, {createEntities: true});
        this.addLOD(tubeGeo[1], TubeCoralsOwner.#mediumDetailMat, 30);
        this.addLOD(tubeGeo[2], TubeCoralsOwner.#mediumDetailMat, 60);
        this.frustumCulled = false;
    }
}

export class TubeCoral extends MultiInstancedEntity {
    static defaultOwner = new TubeCoralsOwner();

    constructor(color = 0xffffff, size = 1, owner = TubeCoral.defaultOwner) {
        super(owner);
        this.color = color;
        this.size = size;
        this.bubbleSpawner = null;
        this.bubbleSpawnTime = 0;
        
        // Give each coral its own unique personality
        this.bubbleIntensity = SgiUtils.rand(0.8, 2.0); // How much bubbles this coral produces (0.8 = active, 2.0 = very intense)
        this.bubbleConcentration = SgiUtils.rand(1.5, 3.5); // Concentration multiplier (affects bubble density per spawn)
        this.baseSpawnInterval = SgiUtils.rand(3.0, 6.0); // Longer spawn intervals for pop effect
        this.bubbleSpawnInterval = this.baseSpawnInterval / this.bubbleIntensity; // More active corals spawn more frequently
        this.bubbleSpawnPhase = SgiUtils.rand(0, this.bubbleSpawnInterval); // Random phase offset for natural staggering
        this.bubbleSpawnTime = this.bubbleSpawnPhase; // Start at phase offset
        
        const layers = 3;
        let n = 4;

        const attributes = [];
        let angle = 0;
        let alphaAng = 2 * Math.PI / n;
        for (let layer = 1; layer <= layers; ++layer, n *= 2, alphaAng /= 2) {
            for (let j = 0; j < n; ++j, angle += alphaAng) {
                const ang = angle + SgiUtils.rand(-alphaAng / 3, alphaAng / 3);
                const height = SgiUtils.rand(0.5, 1.0);

                attributes.push({
                    height: height,
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

        let i = 0;
        this.addInstances(attributes.length, (obj, j) => {
            const attr = attributes[i];
            obj.position.copy(attr.pos);
            obj.rotateY(attr.rot.y);
            obj.rotateX(attr.rot.x);
            obj.scale.set(size, attr.height * size, size);
            owner.setColorAt(j, color); // Using "obj.color" throws an error
            i++;
        });
    }

    setBubbleSystem(bubbleSystem) {
        this.bubbleSpawner = bubbleSystem;
    }

    update(dt) {
        if (!this.bubbleSpawner) return;
        
        this.bubbleSpawnTime += dt;
        
        if (this.bubbleSpawnTime >= this.bubbleSpawnInterval) {
            // Spawn bubbles based on this coral's intensity
            // Low intensity corals spawn 2-4 bubbles, high intensity spawn 4-8 clusters
            const bubblesPerSpawn = Math.max(2, Math.round(SgiUtils.rand(2, 8) * this.bubbleConcentration));
            
            for (let i = 0; i < bubblesPerSpawn; i++) {
                // Randomize spawn position on coral
                const angle = Math.random() * Math.PI * 2;
                const radius = SgiUtils.rand(0.0, 0.3);
                
                const topOffset = new THREE.Vector3(
                    Math.cos(angle) * radius + SgiUtils.rand(-0.1, 0.1),
                    this.size * (0.4 + Math.random() * 0.2), // Varied height on coral
                    Math.sin(angle) * radius + SgiUtils.rand(-0.1, 0.1)
                );
                
                // Get world position without triggering custom setters
                const spawnPos = new THREE.Vector3(this.position.x, this.position.y, this.position.z).add(topOffset);
                
                // Highly randomized bubble properties for natural feel
                // Low intensity corals have smaller, dimmer bubbles
                const bubbleScale = SgiUtils.rand(0.18, 0.55) * this.bubbleIntensity;
                const glowIntensity = SgiUtils.rand(1.0, 2.0) * this.bubbleIntensity;
                const velocity = SgiUtils.rand(0.6, 3.0);
                
                this.bubbleSpawner.spawnBubble(
                    spawnPos,
                    bubbleScale,
                    velocity,
                    glowIntensity,
                    1000, // More particles for better visibility
                    8.0, // Much longer lifetime so bubbles spread more before disappearing
                    true // isCoralBubble - use continuous distribution
                );
            }
            
            this.bubbleSpawnTime = 0;
            // Add some variation to interval for organic feel
            this.bubbleSpawnInterval = (this.baseSpawnInterval + SgiUtils.rand(-0.2, 0.2)) / this.bubbleIntensity;
            this.bubbleSpawnInterval = Math.max(0.2, this.bubbleSpawnInterval); // Never below 0.2s
        }
    }
}
