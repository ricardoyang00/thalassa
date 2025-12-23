import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';

function branchGeoGen(radialSegments, openEnded = false) {
    return new THREE.CylinderGeometry(0.15, 0.15, 1, radialSegments, 1, openEnded).translate(0, 0.5, 0);
}

function matGen() {
    const mat = new THREE.MeshStandardMaterial({
        metalness: 0.1,
        roughness: 0.8,
        map: new THREE.TextureLoader().load('textures/tube-coral.png')
    });

    mat.onBeforeCompile = (shader) => {
        shader.uniforms.time = { value: 0 };
        shader.uniforms.timeBias = { value: 0 };

        // Manual vertex projection, might not work on different/future versions
        shader.vertexShader =
            `
            uniform float time;
            uniform float timeBias;
            `
            + shader.vertexShader.replace(
            '#include <begin_vertex>',
            `
            #include <begin_vertex>

            float coralAlpha = time + timeBias;
            float sway = 0.2 + 0.1 * (
                sin(2.0 * mod(coralAlpha, PI))
                +
                cos(mod(coralAlpha, 2.0 * PI))
            );
            transformed.x += transformed.y * sway;

            // vec4 mvPosition = vec4( transformed, 1.0 );
            // mvPosition = instanceMatrix * mvPosition;

            // float coralAlpha = time + timeBias;
            
            // mvPosition.x += mvPosition.y * sway;

            // mvPosition = modelViewMatrix * mvPosition;
            // gl_Position = projectionMatrix * mvPosition;
            `
        );

        mat.userData.shader = shader;
    }

    return mat;
}

export class LSystemCoralsOwner extends InstancedMesh2 {
    static #branchGeo = [
        branchGeoGen(10),
        branchGeoGen(5),
        branchGeoGen(3),
    ];

    static #mat = matGen();

    constructor() {
        const iterations = 3;

        const low = 0.3, high = 1-low;
        const rules = {
            'X': '',
            'F': [
                {prob: 1, rule: 'F[+R]F'},
                {prob: 1, rule: 'F[-L]F'},
                {prob: 1, rule: 'F[&U]F'},
                {prob: 1, rule: 'F[^D]F'},
                {prob: 10, rule: 'F'},
            ],
            'R': [ // right
                {prob: low, rule: 'F[&U][^D][+R][-L]'},
                {prob: high, rule: 'F[&U][^D][-L]'},
            ],
            'L' : [ // left
                {prob: low, rule: 'F[&U][^D][+R][-L]'},
                {prob: high, rule: 'F[&U][^D][+R]'},
            ],
            'U': [ // up
                {prob: low, rule: 'F[&U][^D][+R][-L]'},
                {prob: high, rule: 'F[&U][+R][-L]'},
            ],
            'D': [ // down
                {prob: low, rule: 'F[&U][^D][+R][-L]'},
                {prob: high, rule: 'F[&U][+R][-L]'},
            ],
        };
        const axiom = '[+R][-L][&R][^L]';
        const scaleFactor = 1;
        // const lengthFactor = 1;
        // const radiusFactor = 0.7;

        const baseAngle = 25 * THREE.MathUtils.DEG2RAD;
        const variableAngle = 10 * THREE.MathUtils.DEG2RAD; // random angle variation for more natural trees

        // --- Expand the string ---
        let currentString = axiom;
        for (let i = 0; i < iterations; i++) {
            let nextString = '';
            for (const char of currentString) {
                nextString += rules[char] !== undefined
                    ? typeof(rules[char]) == "string"
                        ? rules[char]
                        : LSystemCoralsOwner.#chooseNextRule(rules[char])
                    : char;
            }
            currentString = nextString;
        }

        // --- Turtle interpretation ---
        const stack = [];
        let turtle = {
            position: new THREE.Vector3(0, 0, 0),
            quaternion: new THREE.Quaternion(),
        };

        let branchLength = 0.5;
        const branchMatrices = [];
        const transformations = [];
        const leafMatrices = [];

        const axisX = new THREE.Vector3(1, 0, 0);
        const axisY = new THREE.Vector3(0, 1, 0);
        const axisZ = new THREE.Vector3(0, 0, 1);
        const q = new THREE.Quaternion();

        const randomAngle = (base) => base + (SgiUtils.rand() * 2 - 1) * variableAngle;

        for (const char of currentString) {
            switch (char) {
                case 'F': {
                    const startPosition = turtle.position.clone();
                    const forward = new THREE.Vector3(0, 1, 0)
                        .applyQuaternion(turtle.quaternion)
                        .multiplyScalar(branchLength);
                    turtle.position.add(forward);

                    const instanceMatrix = new THREE.Matrix4();
                    const orientation = new THREE.Quaternion().setFromUnitVectors(axisY, forward.clone().normalize());
                    const scale = new THREE.Vector3(branchLength, branchLength, branchLength);
                    instanceMatrix.compose(startPosition, orientation, scale);
                    branchMatrices.push(instanceMatrix);
                    transformations.push({
                        position: startPosition,
                        quaternion: orientation,
                        scale: scale,
                    });
                    break;
                }
                case 'X': {
                    const leafMatrix = new THREE.Matrix4();
                    leafMatrix.compose(
                        turtle.position,
                        new THREE.Quaternion(),
                        new THREE.Vector3(1, 1, 1)
                    );
                    leafMatrices.push(leafMatrix);
                    break;
                }
                case '+':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, randomAngle(baseAngle)));
                    break;
                case '-':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisZ, -randomAngle(baseAngle)));
                    break;
                case '&':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, randomAngle(baseAngle)));
                    break;
                case '^':
                    turtle.quaternion.multiply(q.setFromAxisAngle(axisX, -randomAngle(baseAngle)));
                    break;
                case '[':
                    stack.push({
                        position: turtle.position.clone(),
                        quaternion: turtle.quaternion.clone(),
                        length: branchLength
                    });
                    branchLength *= scaleFactor;
                    break;
                case ']': {
                    const state = stack.pop();
                    if (!state) break;
                    turtle.position = state.position;
                    turtle.quaternion = state.quaternion;
                    branchLength = state.length;
                    break;
                }
                default:
                    break;
            }
        }

        const lod = [];
        for (const branchGeo of LSystemCoralsOwner.#branchGeo) {
            const branches = [];
            for (const matrix of branchMatrices) {
                const branch = branchGeo.clone();
                branch.applyMatrix4(matrix);
                branches.push(branch);
            }
            lod.push(BufferGeometryUtils.mergeGeometries(branches));
        }

        const mat = LSystemCoralsOwner.#mat;

        super(lod[0], matGen(), {createEntities: true});
        this.addLOD(lod[1], matGen(), 15);
        this.addLOD(lod[2], matGen(), 30);
        this.addShadowLOD(lod[2]);

        // super(LSystemCoralsOwner.#branchGeo[0], LSystemCoralsOwner.#mat.clone());

        this.initUniformsPerInstance({
            vertex: {
                timeBias: 'float',
            },
        });

        // this.addInstances(branchMatrices.length, (obj, j) => {
        //     // obj.applyMatrix4(branchMatrices[i]);
        //     const t = transformations[i];
        //     obj.scale = t.scale;
        //     obj.quaternion = t.quaternion;
        //     obj.position = t.position;
        //     obj.setUniform("timeBias", timeBias);

        //     owner.setColorAt(j, color); // Using "obj.color" throws an error
        //     i++;
        // });

        // super(branchGeo[0], matGen(), {createEntities: true});
        // this.addLOD(branchGeo[1], matGen(), 15);
        // this.addLOD(branchGeo[2], matGen(), 30);
        // this.initUniformsPerInstance({
        //     vertex: {
        //         timeBias: 'float',
        //         baseY: 'float',
        //     },
        // });
        // this.addShadowLOD(branchGeoGen(3, true)); // TODO: this causes a shader compilation error, but it still works...?
        // this.frustumCulled = false;
    }

    static #chooseNextRule(options) {
        //Sum the weights (probabilities) of all options.
        const total = options.reduce((sum, o) => sum + o.prob, 0);

        //Number between 0 and `total`
        let randomValue = Math.random() * total;

        //The first option that makes `r <= 0` is the winner.
        for (const opt of options) {
            randomValue -= opt.prob;
            if (randomValue <= 0)
                return opt.rule;
        }

        //default: return the last option.
        return options[options.length - 1].rule;
    }
}

export class LSystemCoral extends MultiInstancedEntity {
    static defaultOwners = (() => {
        const n_variants = 10;
        const result = [];
        for (let i = 0; i < n_variants; ++i) {
            result.push(new LSystemCoralsOwner());
        }
        return result;
    })();

    constructor(color = 0xffffff, size = 1, owner = null) {
        if (!owner)
            owner = LSystemCoral.defaultOwners[SgiUtils.randInt(0, LSystemCoral.defaultOwners.length)];

        super(owner);
        this.size = size;
        const timeBias = SgiUtils.rand(0, 69420);

        this.addInstances(1, (obj, i) => {
            obj.scale.multiplyScalar(size);
            // // obj.applyMatrix4(branchMatrices[i]);
            // const t = transformations[i];
            // obj.scale = t.scale;
            // obj.quaternion = t.quaternion;
            // obj.position = t.position;
            obj.setUniform("timeBias", timeBias);
            owner.setColorAt(i, color); // Using "obj.color" throws an error
            i++;
        });

        // if (leafMatrices.length > 0) {
        //     const leafGeo = new THREE.IcosahedronGeometry(0.2, 0);
        //     const leafMat = new THREE.MeshStandardMaterial({ color: 0x228B22, metalness: 0, roughness: 0.8 });
        //     const leafMesh = new THREE.InstancedMesh(leafGeo, leafMat, leafMatrices.length);
        //     leafMesh.name = "leaves";
        //     for (let i = 0; i < leafMatrices.length; i++) {
        //         leafMesh.setMatrixAt(i, leafMatrices[i]);
        //     }
        //     group.add(leafMesh);
        // }
    }

    dispose(object) {
        object.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }
}

