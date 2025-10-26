import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';
import { MyFish } from './objects/fish/MyFish.js';
import { Pillar } from './objects/temple/pillar.js';


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
        const ambientLight = new THREE.AmbientLight( 0xffffff, 2.5 );
        this.app.scene.add( ambientLight );

        this.buildSeafloor();
        this.buildFish();

        this.app.scene.add(this.fishGroup);



        const gridSize = 7;
        const spacing = 5;
        const half = Math.floor(gridSize / 2);
        const pillarGroup = new THREE.Group();
        pillarGroup.name = 'pillars';

        for (let ix = 0; ix < gridSize; ix++) {
            for (let iz = 0; iz < gridSize; iz++) {
                if (ix === 0 || ix === gridSize - 1 || iz === 0 || iz === gridSize - 1) {
                    const x = (ix - half) * spacing;
                    const z = (iz - half) * spacing;
                    const p = new Pillar();
                    p.position.set(x, 2, z);
                    pillarGroup.add(p);
                }
            }
        }

        pillarGroup.scale.setScalar(1.5);
        this.app.scene.add(pillarGroup);
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