import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';

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
        this.axis = null
        this.wireframeMode = false;

        // seeded random number generator
        this.seed = 12345;

        // seafloor related attributes
        this.seafloorGroup = new THREE.Group();
        this.terrain = null;
        this.rocks = [];
        this.showRocks = true; 
    }

    /**
     * Seeded random number generator (using mulberry32)
     * @param {number} a - seed value
     * @returns {function} - random function that returns values between 0 and 1
     */
    mulberry32(a) {
        return function() {
            var t = a += 0x6D2B79F5;
            t = Math.imul(t ^ t >>> 15, t | 1);
            t ^= t + Math.imul(t ^ t >>> 7, t | 61);
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        }
    }

    /**
     * builds the seafloor with terrain and rocks
     */
    buildSeafloor() {
        this.terrain = new MyTerrain(this);
        this.seafloorGroup.add(this.terrain);

        const seededRandom = this.mulberry32(this.seed);

        for (let i = 0; i < 15; i++) {
            const rock = new MyRock(this, 0.5 + seededRandom() * 1.5, seededRandom);
            rock.position.set(
                (seededRandom() - 0.5) * 40,
                seededRandom() - 1.2,
                (seededRandom() - 0.5) * 40
            );
            this.rocks.push(rock);
            this.seafloorGroup.add(rock);
        }
    }

    /**
     * initializes the contents
     */
    init() {
       
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

        this.buildSeafloor();
        this.app.scene.add(this.seafloorGroup);
    }

    /**
     * toggles rock visibility
     * @param {boolean} visible 
     */
    toggleRocks(visible) {
        this.showRocks = visible;
        this.rocks.forEach(rock => {
            rock.visible = visible;
        });
    }

    /**
     * toggles wireframe mode for all objects
     * @param {boolean} wireframe 
     */
    toggleWireframe(wireframe) {
        this.wireframeMode = wireframe;
        if (this.terrain) this.terrain.toggleWireframe(wireframe);
        this.rocks.forEach(rock => rock.toggleWireframe(wireframe));
    }

    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        
    }

}

export { MyContents };