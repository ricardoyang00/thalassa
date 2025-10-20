import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';
import { MyFish } from './objects/fish/MyFish.js';
import { SUBTRACTION, Brush, Evaluator } from 'https://cdn.jsdelivr.net/npm/three-bvh-csg@0.0.17/+esm'


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

        // seafloor related attributes
        this.seafloorGroup = null;
        this.terrain = null;
        this.rocks = null;
        this.corals = null;

        // fish related attributes
        this.fishGroup = new THREE.Group();
        this.fish = [];
        this.showFish = true;
    }

    /**
     * builds the seafloor with terrain, rocks and corals
     */
    buildSeafloor() {
        this.seafloorGroup = new THREE.Group();
        this.seafloorGroup.name = "seafloorGroup";

        const terrain = new MyTerrain(this.app);
        this.seafloorGroup.add(terrain);
        this.terrain = terrain;

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
            BrainCoral,
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
     * Builds fish
     * @param {number} count
     * @param {Object} palette
     */
    buildFish(count = 8, palette = [0xff6b6b, 0x4ecdc4, 0xffd166, 0x5e60ce, 0xff9f1c]) {
        this.fish = [];
        while (this.fishGroup.children.length) {
            this.fishGroup.remove(this.fishGroup.children[0]);
        }

        const rawPalette = Array.isArray(palette) && palette.length ? palette : [0xff9933];
        const colors = rawPalette.map(c => {
            if (typeof c === 'number') return c;
            if (typeof c === 'string') {
                if (c.startsWith('#')) return parseInt(c.slice(1), 16);
                if (c.startsWith('0x')) return parseInt(c.slice(2), 16);
                const n = Number(c);
                return Number.isFinite(n) ? n : parseInt(c, 16);
            }
            return Number(c);
        });

        for (let i = 0; i < count; ++i) {
            const color = colors[Math.floor(Math.random() * colors.length)];

            const fish = new MyFish({
                scale: 0.4 + SgiUtils.rand(0, 0.6),
                color: color,
                texturePath: '../pw2/textures/fish.jpg'
            });
            
            fish.position.set(
                SgiUtils.rand(-8, 8),
                SgiUtils.rand(1, 6),
                SgiUtils.rand(-8, 8)
            );

            fish.rotation.y = SgiUtils.rand(-Math.PI, Math.PI);

            this.fish.push(fish);
            this.fishGroup.add(fish);
        }
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
        const pointLight = new THREE.PointLight( 0xffffff, 1000, 0 );
        pointLight.position.set( 0, 20, 0 );
        this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0xffffff );
        this.app.scene.add( ambientLight );

        this.buildSeafloor();
        this.buildFish();

        this.app.scene.add(this.fishGroup);


        // Create the large cylinder brush
        const grooveCount = 32;           // number of flutes
        const grooveRadius = 0.0986;        // radius of each flute cutter
        const grooveOffset = 1.05;        // radial offset from center (slightly > pillar radius)
        const grooveHeight = 20;          // slightly taller so it cuts through cleanly

        const geometry = new THREE.CylinderGeometry(1, 1, grooveHeight, grooveCount);
        let currentBrush = new Brush(geometry);
        currentBrush.updateMatrixWorld();

        const evaluator = new Evaluator();



        for (let i = 0; i < grooveCount; i++) {
            const angle = (i / grooveCount) * Math.PI * 2;
            const gGeo = new THREE.CylinderGeometry(grooveRadius, grooveRadius, grooveHeight, 16);
            const grooveBrush = new Brush(gGeo);
            // place the small cutter so its axis is parallel to the pillar and offset radially
            grooveBrush.position.set(Math.cos(angle) * grooveOffset, 0, Math.sin(angle) * grooveOffset);
            grooveBrush.updateMatrixWorld();
            currentBrush = evaluator.evaluate(currentBrush, grooveBrush, SUBTRACTION);
        }

        // Create the final mesh
        const material = new THREE.MeshPhongMaterial({ color: "#979797" });
        const hollowCylinder = new THREE.Mesh(currentBrush.geometry, material);
        const x_position = 10;
        const y_position = grooveHeight/2
        hollowCylinder.position.set(x_position, y_position, 0);

        const clone2 = hollowCylinder.clone();
        clone2.position.set(-x_position, y_position, 0);
        
        this.app.scene.add(clone2);

        const clone3 = hollowCylinder.clone();
        clone3.position.set(0, y_position, x_position);
        this.app.scene.add(clone3);
        
        const clone4 = hollowCylinder.clone();
        clone4.position.set(0, y_position, -x_position);
        this.app.scene.add(clone4);


        this.app.scene.add(hollowCylinder);
    }

    /**
     * toggles visibility of fish
     * @param {boolean} visible
     */
    toggleFish(visible) {
        this.showFish = visible;
        this.fishGroup.visible = visible;
        this.fish.forEach(f => f.visible = visible);
    }

    setFishesScale(s) {
        this.fishGroup.scale.setScalar(s);
    }

    update() {}
}

export { MyContents };