import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './MyTerrain.js';
import { MyRock } from './MyRock.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';
import { MyFishLOD } from './objects/fish/MyFishLOD.js';
import { FishFlock } from './objects/fish/FishFlock.js';
import { MySubmarine } from './objects/submarine/MySubmarine.js';


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

        // fish related attributes
        this.fishGroup = new THREE.Group(); // parent container
        this.fishGroups = [];               // array of THREE.Group (one per group)
        this.fishByGroup = [];              // array of arrays with fish references per group
        this.fish = [];                     // flat list of all fish
        this.showFish = true;

        this.flocks = [];
        this._lastUpdateTime = null;

        // submarine
        this.submarine = null;
    }

    /**
     * builds the seafloor with terrain, rocks and corals
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

    buildSubmarine() {
        this.submarine = new MySubmarine(this.app, 1);
        this.submarine.position.set(0, 5, 0);
        this.app.scene.add(this.submarine);
    }

    /**
     * Create multiple fish groups. Each group is a THREE.Group with 20-30 fish by default.
     * Fish references are stored in this.fishByGroup (array of arrays) and flat in this.fish.
     */
    buildFishGroups(numGroups = 3, minPer = 20, maxPer = 30, palette = [0xff6b6b, 0x4ecdc4, 0xffd166]) {
        this.fish = [];
        this.fishGroups.forEach(g => this.fishGroup.remove(g));
        this.fishGroups = [];
        this.fishByGroup = [];
    
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
    
        for (let g = 0; g < numGroups; ++g) {
            const group = new THREE.Group();
            group.name = `fishGroup_${g}`;
        
            const cols = Math.ceil(Math.sqrt(numGroups));
            const rows = Math.ceil(numGroups / cols);
            const spacing = 20;
            const col = g % cols;
            const row = Math.floor(g / cols);
            const cx = (cols - 1) / 2;
            const rz = (rows - 1) / 2;
            group.position.set((col - cx) * spacing, SgiUtils.rand(1, 6), (row - rz) * spacing);

            const count = Math.max(minPer, Math.floor(SgiUtils.rand(minPer, maxPer + 1)));
            const groupFishes = [];
        
            for (let i = 0; i < count; ++i) {
                const color = colors[Math.floor(Math.random() * colors.length)];
                const fishLOD = new MyFishLOD({
                    scale: 0.08 + SgiUtils.rand(0, 0.08),
                    color: color,
                    texturePath: '../pw2/textures/fish.jpg'
                });
            
                const fish = new THREE.Group(); // new 'fish' object for the flock
                fish.add(fishLOD);

                fishLOD.rotation.y = -Math.PI / 2;

                // local position inside group (clustered)
                fish.position.set(SgiUtils.rand(-4, 4), SgiUtils.rand(-1, 3), SgiUtils.rand(-4, 4));
                fish.rotation.y = SgiUtils.rand(-Math.PI, Math.PI);

                group.add(fish);
                groupFishes.push(fish);
                this.fish.push(fish);
            }
        
            this.fishGroups.push(group);
            this.fishByGroup.push(groupFishes);
            this.fishGroup.add(group);

            // create a FishFlock to govern the boids for this group
            const flock = new FishFlock(groupFishes);
            if (this.submarine) {
                flock.addDanger(this.submarine);
            }
            this.flocks.push(flock);
        }
        this.app.scene.add(this.fishGroup);
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
        this.buildSubmarine();
        this.buildFishGroups(3, 100, 200);

        this._lastUpdateTime = Date.now() * 0.001;
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

    update() {
        // Animate all fish
        const now = Date.now() * 0.001; // Convert to seconds
        const dt = this._lastUpdateTime ? Math.min(0.1, now - this._lastUpdateTime) : 0;
        this._lastUpdateTime = now;
        
        this.flocks.forEach(f => f.update(dt));
        if (this.submarine && typeof this.submarine.update === 'function') {
            this.submarine.update(dt);
        }
    }
}

export { MyContents };