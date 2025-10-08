import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';

/**
 *  This class contains the contents of out application
 */
class MyContents  {

    /**
       constructs the object
       @param {MyApp} app The application object
    */ 
    constructor(app) {
        this.app = app

        this.axis = null;
    }

    /**
     * initializes the contents
     */
    init() {
        // (un)comment for fixed/random seeds
        SgiUtils.setSeed(Math.floor(Math.random() * 4294967296));

        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            this.app.scene.add(this.axis)
        }

        // add a point light on top of the model
        const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x555555 );
        this.app.scene.add( ambientLight );
        
        // Create a Plane Mesh with basic material

        let plane = new THREE.PlaneGeometry( 10, 10 );
        this.planeMesh = new THREE.Mesh( plane, new THREE.MeshPhongMaterial({color: 0x00ffff}) );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );

        // Add Corals

        const texture = new THREE.TextureLoader().load('textures/tube-coral.png');
        const corals = [
            new TubeCoral(0xff0000),
            new BrainCoral(0xffff00, 0.7),
        ];

        for (let i = 0; i < 23; ++i)
            corals.push(new TubeCoral(SgiUtils.rand(0, 0xffffff)));

        corals.forEach((coral, i) => {
            coral.position.x = -4 + 2 * Math.floor(i / 5);
            coral.position.z = -4 + 2 * (i % 5);
            this.app.scene.add(coral);
        });
    }

    update() {

    }
}

export { MyContents };