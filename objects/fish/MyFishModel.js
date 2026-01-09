import * as THREE from 'three';
import { FishGeometry } from './FishGeometry.js';

class MyFishModel extends THREE.Group {
    constructor({
        scale = 0.3,
        color = 0xff9933,
        texturePath = null,
        numBones = 5,
        //showBones = true
    } = {}) {
        super();
        this.scaleFactor = scale;
        this.color = color;
        this.texturePath = texturePath;
        this.finSize = 0.8;
        this.numBones = Math.max(3, numBones);
        //this.showBones = showBones;

        this.skeleton = null;
        this.bones = [];
        this.skinnedMesh = null;
        this.skeletonHelper = null;

        this.swimSpeed = 30;
        this.swimAmplitude = 0.15;
        this.idleSpeed = 7;
        this.lastUpdateTime = 0;

        this.#buildFish();

        this.scale.setScalar(this.scaleFactor);
    }

    #buildFish() {
        // Create skeleton with specified number of bones
        this.bones = this.#createSkeleton();

        const bodyGeometry = FishGeometry.geometry[0];
        this.#addSkinningData(bodyGeometry);
        
        const material = FishGeometry.getSharedMaterial(this.color, this.texturePath);
        
        this.skinnedMesh = new THREE.SkinnedMesh(bodyGeometry, material);
        this.skinnedMesh.add(this.bones[0]);
        if (this.bones[1]) this.skinnedMesh.add(this.bones[1]);

        this.add(this.skinnedMesh);
        
        this.skeleton = new THREE.Skeleton(this.bones);
        this.skinnedMesh.bind(this.skeleton);
        
        this.#addFins(material);

        // skeleton helper to visualize bones
        // uncomment constructor param to enable
        if (this.showBones) {
            this.skeletonHelper = new THREE.SkeletonHelper(this.skinnedMesh);
            this.skeletonHelper.material.linewidth = 3;
            this.add(this.skeletonHelper);
        }
    }

    #createSkeleton() {
        const bones = [];
        const fishLength = 4; // Fish spans from x=1 to x=-3
        const segmentLength = fishLength / (this.numBones - 1);

        // HEAD BONE (index 0)
        const headBone = new THREE.Bone();
        headBone.position.set(1, 0, 0);
        bones.push(headBone);

        // SPINE ROOT (index 1)
        const spineRoot = new THREE.Bone();
        spineRoot.position.set(1, 0, 0);
        bones.push(spineRoot);

        // Create remaining spine bones as a chain starting from spineRoot
        for (let i = 2; i < this.numBones; i++) {
            const bone = new THREE.Bone();
            // each child is placed segmentLength behind its parent
            bone.position.set(-segmentLength, 0, 0);
            bones[i - 1].add(bone); // parent is previous spine bone
            bones.push(bone);
        }

        return bones;
    }

    #addSkinningData(geometry) {
        const position = geometry.attributes.position;
        const vertexCount = position.count;
        
        const skinIndices = [];
        const skinWeights = [];
        
        // Calculate bone positions along the fish spine
        const bonePositions = [];
        const fishLength = 4;
        const segmentLength = fishLength / (this.numBones - 1);
        
        for (let i = 0; i < this.numBones; i++) {
            bonePositions.push(1 - i * segmentLength);
        }
        
        for (let i = 0; i < vertexCount; i++) {
            const x = position.getX(i);
            
            const weights = new Array(this.numBones).fill(0);
            
            let segmentIndex = 0;
            for (let j = 0; j < this.numBones - 1; j++) {
                if (x >= bonePositions[j + 1] && x <= bonePositions[j]) {
                    segmentIndex = j;
                    break;
                }
            }
            
            if (x > bonePositions[0]) {
                weights[0] = 1.0;
            } else if (x < bonePositions[this.numBones - 1]) {
                weights[this.numBones - 1] = 1.0;
            } else {
                const bone1Pos = bonePositions[segmentIndex];
                const bone2Pos = bonePositions[segmentIndex + 1];
                const segmentSize = bone1Pos - bone2Pos;
                
                if (segmentSize !== 0) {
                    const t = (x - bone2Pos) / segmentSize;
                    weights[segmentIndex] = t;
                    weights[segmentIndex + 1] = 1 - t;
                } else {
                    weights[segmentIndex] = 0.5;
                    weights[segmentIndex + 1] = 0.5;
                }
            }
            
            // Find up to 4 bones with non-zero weights
            const influences = [];
            for (let j = 0; j < this.numBones; j++) {
                if (weights[j] > 0) {
                    influences.push({ index: j, weight: weights[j] });
                }
            }
            
            // Sort by weight (descending) and take top 4
            influences.sort((a, b) => b.weight - a.weight);
            influences.length = Math.min(4, influences.length);
            
            // Normalize weights to sum to 1.0
            const totalWeight = influences.reduce((sum, inf) => sum + inf.weight, 0);
            
            // Pad to 4 influences
            while (influences.length < 4) {
                influences.push({ index: 0, weight: 0 });
            }
            
            const indices = influences.map(inf => inf.index);
            const finalWeights = influences.map(inf => totalWeight > 0 ? inf.weight / totalWeight : 0);
            
            skinIndices.push(...indices);
            skinWeights.push(...finalWeights);
        }

        this.skinIndices = skinIndices;
        this.skinWeights = skinWeights;

        geometry.setAttribute(
            'skinIndex',
            new THREE.Uint16BufferAttribute(skinIndices, 4)
        );
        geometry.setAttribute(
            'skinWeight',
            new THREE.Float32BufferAttribute(skinWeights, 4)
        );
    }

    #addFins(baseMaterial) {
        const finGeom = FishGeometry.finGeometry;
        const finMaterial = baseMaterial.clone();
        finMaterial.side = THREE.DoubleSide;

        const middleBone = this.bones[2];

        // dorsal fin (top)
        const dorsalFin = new THREE.Mesh(finGeom, finMaterial);
        dorsalFin.position.set(-0.5, 0.7, 0);
        dorsalFin.rotateY(Math.PI);
        dorsalFin.rotateZ(-Math.PI / 6);
        middleBone.add(dorsalFin);

        // belly fin (left)
        const bellyFinLeft = new THREE.Mesh(finGeom, finMaterial);
        bellyFinLeft.position.set(-1.2, -1, 0.6);
        bellyFinLeft.rotateX(-Math.PI / 6);
        middleBone.add(bellyFinLeft);

        // belly fin (right)
        const bellyFinRight = new THREE.Mesh(finGeom, finMaterial);
        bellyFinRight.position.set(-1.2, -1, -0.6);
        bellyFinRight.rotateX(Math.PI / 6);
        middleBone.add(bellyFinRight);
    }

    /**
     * Animate the fish based on its current speed.
     * @param {Fish} fish - peixe com chocolate
     * @param {number} dt - Delta time (time since last frame).
     * @param {number} [speedFactor=0] - Current speed as a factor (0.0 to 1.0).
     */
    animate(fish, dt, speedFactor = 0) {
        if (this.bones.length < 2 || dt <= 0) return;

        // Calculate an effective speed:
        // - At speedFactor=0 (stationary), it uses idleSpeed.
        // - At speedFactor=1 (max speed), it uses swimSpeed.
        const effectiveSwimSpeed = this.idleSpeed + (this.swimSpeed - this.idleSpeed) * speedFactor;

        // Advance our internal animation clock based on dt and effective speed
        fish.animationTime += dt * effectiveSwimSpeed;

        const head = this.bones[0];
        const headAmplitude = this.swimAmplitude * 0.3;
        // Use animationTime instead of 'time * this.swimSpeed'
        head.rotation.y = -Math.sin(fish.animationTime) * headAmplitude;

        const spineCount = this.bones.length - 1;
        for (let i = 1; i < this.bones.length; i++) {
            const k = i - 1; // 0..spineCount-1
            const phase = (k / Math.max(1, spineCount - 1)) * Math.PI * 0.5;
            const amplitudeFactor = Math.pow((k + 1) / Math.max(1, spineCount), 1.5);
            const amplitude = this.swimAmplitude * amplitudeFactor;

            // Use animationTime instead of 'time * this.swimSpeed'
            this.bones[i].rotation.y = Math.sin((fish.animationTime + phase)) * amplitude;
        }
    }

    setScaleFactor(s) {
        this.scaleFactor = s;
        this.scale.setScalar(s);
    }
}

export { MyFishModel };