import * as THREE from 'three';
import { SgiUtils } from '../../SgiUtils.js';

export class LSystemCoral extends THREE.LOD {
    constructor(color = 0xffffff, size = 1) {
        super();
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

        let branchLength = 2;
        const branchMatrices = [];
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

        const branchMat = new THREE.MeshStandardMaterial({ color, metalness: 0.1, roughness: 0.8 });
        const branchMeshGen = (radialSegments) => new THREE.InstancedMesh(
            new THREE.CylinderGeometry(0.15, 0.15, 1, radialSegments, 1).translate(0, 0.5, 0),
            branchMat,
            branchMatrices.length,
        );

        const detailLevels = [
            branchMeshGen(16),
            branchMeshGen(5),
            branchMeshGen(3),
        ];
        detailLevels.forEach((level) => branchMatrices.forEach((matrix, i) => level.setMatrixAt(i, matrix)));

        this.addLevel(detailLevels[0], 0);
        this.addLevel(detailLevels[1], 20);
        this.addLevel(detailLevels[2], 50);

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

        this.scale.setScalar(0.4);
        this.position.y = -4;

        this.scale.set(.25, .25, .25);
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
}

