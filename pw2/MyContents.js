import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';

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
        this.wireframeMode = false;

        // seafloor related attributes
        this.seafloorGroup = null;
        this.terrain = null;
        this.rocks = null;
        this.corals = null;
    }

    /**
     * builds the seafloor with terrain and rocks
     */
    buildSeafloor() {
        this.seafloorGroup = new THREE.Group();
        this.seafloorGroup.name = "seafloorGroup";

        const terrain = new MyTerrain(this.app);
        this.seafloorGroup.add(terrain);

        this.rocks = new THREE.Group();
        this.rocks.name = "rocks";
        for (let i = 0; i < 16; i++) {
            const rock = new MyRock(this, SgiUtils.rand(0.5, 2) * 1.5, SgiUtils.rand.bind(SgiUtils));

            while (true) {
                const pos = new THREE.Vector3(
                    SgiUtils.rand(-.5, .5) * 40,
                    0,
                    SgiUtils.rand(-.5, .5) * 40,
                );

                if (this.rocks.children.every((rocc) => rocc.position.distanceTo(pos) > rocc.size + rock.size)) {
                    rock.position.copy(pos);
                    break;
                }
            };

            this.rocks.add(rock);
        }
        this.seafloorGroup.add(this.rocks);

        // Add Corals

        this.corals = new THREE.Group();
        this.corals.name = "corals";

        const coralTypes = [
            TubeCoral,
            LSystemCoral,
        ]

        for (let i = 0; i < 25; ++i) {
            const coral = new coralTypes[SgiUtils.randInt(coralTypes.length)](SgiUtils.rand(0, 0xffffff), 2);

            while (true) {
                const pos = new THREE.Vector3(
                    SgiUtils.rand(-.5, .5) * 40,
                    0,
                    SgiUtils.rand(-.5, .5) * 40,
                );

                if (this.rocks.children.every((rock) => rock.position.distanceTo(pos) > rock.size + 0.75)
                    && this.corals.children.every((koral) => koral.position.distanceTo(pos) > 4)
                ) {
                    coral.position.copy(pos);
                    break;
                }
            }
            this.corals.add(coral);
        }
        this.seafloorGroup.add(this.corals);

        this.app.scene.add(this.seafloorGroup);
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

        this.buildSeafloor();
    }

    update() {}
}

export { MyContents };