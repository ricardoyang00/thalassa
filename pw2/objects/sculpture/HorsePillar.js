import * as THREE from 'three';
import { Horse } from './Horse.js';
import { Pillar } from '../temple/Pillar.js';
import { createMossMaterial } from '../../shaders/MossShader.js';

class HorsePillar extends THREE.Object3D {
    constructor(app) {
        super();
        this.app = app;

        this.horse = new Horse(this.app, { size: 0.012 });
        this.horse.position.set(0, 6.15, 0);
        this.horse.rotation.y = -Math.PI/4 -Math.PI/9;
        this.add(this.horse);


        const limestoneTexture = new THREE.TextureLoader().load('textures/limestone.jpg');
        limestoneTexture.wrapS = THREE.RepeatWrapping;
        limestoneTexture.wrapT = THREE.RepeatWrapping;
        const repeatFactor = 5;
        limestoneTexture.repeat.set(repeatFactor, repeatFactor);

        const limestoneMaterial = createMossMaterial(
            limestoneTexture, 
            new THREE.Color("#557e4e")
        );
        
        this.pillar = new Pillar({state: "perfect"}, limestoneMaterial);
        this.pillar.position.set(0, 0, 0);
        this.pillar.scale.setY(0.4);
        //this.pillar.rotation.y = Math.PI/4;
        this.add(this.pillar);
    }
}

export { HorsePillar };
