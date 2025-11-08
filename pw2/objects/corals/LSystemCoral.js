import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';
import { InstancedMesh2 } from '@three.ez/instanced-mesh';
import { MultiInstancedEntity } from '../MultiInstancedEntity.js';

function branchGeoGen(radialSegments) {
    return new THREE.CylinderGeometry(0.15, 0.15, 1, radialSegments, 1).translate(0, 0.5, 0);
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
            uniform float baseY;
            `
            + shader.vertexShader.replace(
            '#include <project_vertex>',
            `
            vec4 mvPosition = vec4( transformed, 1.0 );
            mvPosition = instanceMatrix * mvPosition;

            float coralAlpha = time + timeBias;
            float sway = 0.2 + 0.1 * (
                sin(2.0 * mod(coralAlpha, PI))
                +
                cos(mod(coralAlpha, 2.0 * PI))
            );
            mvPosition.x += (mvPosition.y - baseY) * sway;

            mvPosition = modelViewMatrix * mvPosition;
            gl_Position = projectionMatrix * mvPosition;
            `
        );

        mat.userData.shader = shader;
    }

    return mat;
}

export class LSystemCoralsOwner extends InstancedMesh2 {
    static #geo = [
        branchGeoGen(16),
        branchGeoGen(5),
        branchGeoGen(3),
    ];

    constructor() {
        const geo = LSystemCoralsOwner.#geo;
        super(geo[0], matGen(), {createEntities: true});
        this.addLOD(geo[1], matGen(), 20);
        this.addLOD(geo[2], matGen(), 50);
        this.initUniformsPerInstance({
            vertex: {
                timeBias: 'float',
                baseY: 'float',
            },
        });
    }
}

export class LSystemCoral extends MultiInstancedEntity {
    static defaultOwner = new LSystemCoralsOwner();

    constructor(color = 0xffffff, size = 1, owner = LSystemCoral.defaultOwner) {
        super(owner);
        this.position = new LSystemCoral.Position(this);
        this.size = size;
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
                        : this.#chooseNextRule(rules[char])
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

        let i = 0;
        const timeBias = SgiUtils.rand(0, 69420);
        this.addInstances(branchMatrices.length, (obj, j) => {
            // obj.applyMatrix4(branchMatrices[i]);
            const t = transformations[i];
            obj.scale = t.scale;
            obj.quaternion = t.quaternion;
            obj.position = t.position;
            obj.setUniform("timeBias", timeBias);

            owner.setColorAt(j, color); // Using "obj.color" throws an error
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

    #chooseNextRule(options) {
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

    dispose(object) {
        object.children.forEach(child => {
            if (child.geometry) child.geometry.dispose();
            if (child.material) child.material.dispose();
        });
    }

    // JS seems to shit itself if I try to override the Y setter so I'm just reimplementing the class here
    static Position = class extends THREE.Vector3 {
        constructor(entity, x = 0, y = 0, z = 0) {
            super(x, y, z);
            this.entity = entity;
        }

        set x(val) {
            this.entity?._instances.forEach((obj) => obj.position.x += val - this._x);
            this._x = val;
        }

        set y(val) {
            this.entity?._instances.forEach((obj) => {
                obj.position.y += val - this._y;
                obj.setUniform("baseY", val);
            });
            this._y = val;
        }

        set z(val) {
            this.entity?._instances.forEach((obj) => obj.position.z += val - this._z);
            this._z = val;
        }

        get x() {
            return this._x;
        }

        get y() {
            return this._y;
        }

        get z() {
            return this._z;
        }
    }
}

