import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';
import { MyFish } from './objects/fish/MyFish.js';


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
        this.seafloorGroup = new THREE.Group();
        this.terrain = null;
        this.rocks = [];
        this.showRocks = true; 

        this.fishGroup = new THREE.Group();
        this.fish = [];
        this.showFish = true;
    }

    /**
     * builds the seafloor with terrain and rocks
     */
    buildSeafloor() {
        this.terrain = new MyTerrain(this);
        this.seafloorGroup.add(this.terrain);

        const seededRandom = SgiUtils.rand.bind(SgiUtils);

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
                color: color
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
        // SgiUtils.setSeed(Math.floor(Math.random() * 4294967296));

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
        this.buildFish();

        this.app.scene.add(this.seafloorGroup);
        this.app.scene.add(this.fishGroup);

        // Add Corals
        const corals = [
            new TubeCoral(0xff0000),
            new BrainCoral(0xffff00, 0.7),
        ];

        for (let i = 0; i < 23; ++i)
            corals.push(new TubeCoral(SgiUtils.rand(0, 0xffffff), 2));

        corals.forEach((coral, i) => {
            coral.position.x = -20 + 10 * Math.floor(i / 5);
            coral.position.y = -1.2;
            coral.position.z = -20 + 10 * (i % 5);
            this.app.scene.add(coral);
        });

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