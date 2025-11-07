import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { SgiUtils } from './SgiUtils.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { MyTerrain } from './objects/terrain/MyTerrain.js';
import { MyRock } from './objects/terrain/MyRock.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';
import { MyTemple } from './objects/temple/MyTemple.js';
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

        // seafloor related attributes
        this.seafloorGroup = null;
        this.terrain = null;
        this.rocks = null;
        this.coralMeshes = null;

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
        // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
        /// temp function, only for visualization, still need to organize the scene and optimize the constructors
        this.seafloorGroup = new THREE.Group();
        this.seafloorGroup.name = "seafloorGroup";

        const terrain = new MyTerrain(this);
        this.seafloorGroup.add(terrain);
        this.terrain = terrain;

        // --- Define the spawn boundaries ---
        const minArea = 50;
        const maxArea = 90;



        const maxRadius = maxArea/2;
        const templeRadius = minArea/2;

        this.rocks = new THREE.Group();
        this.rocks.name = "rocks";
        for (let i = 0; i < 50; i++) {
            const rock = new MyRock(this, SgiUtils.rand(0.5, 2) * 1.5, SgiUtils.rand.bind(SgiUtils));

            while (true) {
                // Use the new spawn function to get a valid position
                const pos = this.generateRandomSpawnPos(templeRadius, maxRadius);

                // Now we only need to check for rock-to-rock distance
                if (this.rocks.children.every((rock) => rock.position.distanceTo(pos) > rock.size + rock.size)) {
                    rock.position.copy(pos);
                    break;
                }
            };
            this.rocks.add(rock);
        }
        this.seafloorGroup.add(this.rocks);

        // Add Corals
        this.coralMeshes = new THREE.Group();
        this.coralMeshes.name = "corals";

        this.corals = [];

        const coralTypes = [
            TubeCoral,
            // LSystemCoral,
            // BrainCoral,
        ]

        for (let i = 0; i < 50; ++i) {
            const coral = new coralTypes[SgiUtils.randInt(coralTypes.length)](SgiUtils.rand(0, 0xffffff), 2);

            while (true) {
                // Use the new spawn function to get a valid position
                const pos = this.generateRandomSpawnPos(templeRadius, maxRadius);

                // Now we only need to check for rock/coral distances
                if (this.rocks.children.every((rock) => rock.position.distanceTo(pos) > rock.size + 0.75)
                    && this.corals.every((coral) => coral.position.distanceTo(pos) > 4)
                ) {
                    coral.position.copy(pos);
                    break;
                }
            }
            this.corals.push(coral);
        }
        this.coralMeshes.add(TubeCoral.defaultContainer);
        this.seafloorGroup.add(this.coralMeshes);

        this.app.scene.add(this.seafloorGroup);
    }

    buildSubmarine() {
        this.submarine = new MySubmarine(this.app, 1);
        this.submarine.position.set(0, 10, 0);
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

        // Balanced lighting: hemisphere (ambient-ish), directional key, and a soft fill
        // Hemisphere light gives a sky/ground color balance
        const hemi = new THREE.HemisphereLight(0x88aaff, 0x444422, 0.2);
        this.app.scene.add(hemi);

        // Directional light as the main (sun/key) light — casts stronger shading without blowing out details
        const dir = new THREE.DirectionalLight(0xffffff, 0.1);
        dir.position.set(5, 10, 5);
        dir.castShadow = true;
        dir.shadow.mapSize.set(1024, 1024);
        dir.shadow.camera.near = 0.5;
        dir.shadow.camera.far = 50;
        this.app.scene.add(dir);

        // // soft fill point light to lift shadowed areas slightly
        // const fill = new THREE.PointLight(0xffffff, 0, 30, 2); // intensity, distance, decay
        // fill.position.set(-5, 3, -5);
        // this.app.scene.add(fill);

        const spot1 = new THREE.SpotLight(0xffffff, 7500);
        spot1.position.set(30, 50, -30);
        spot1.target.position.set(0, 0, 0);
        spot1.angle = Math.PI / 6;
        spot1.penumbra = 0.2;
        spot1.decay = 2;
        spot1.distance = 100;
        spot1.castShadow = true;
        this.app.scene.add(spot1);

        const spotLightHelper1 = new THREE.SpotLightHelper(spot1);
        //this.app.scene.add(spotLightHelper1);

        const spot2 = new THREE.SpotLight(0xffffff, 7500);
        spot2.position.set(-30, 50, 30);
        spot2.target.position.set(0, 0, 0);
        spot2.angle = Math.PI / 6;
        spot2.penumbra = 0.2;
        spot2.decay = 2;
        spot2.distance = 100;
        spot2.castShadow = true;
        this.app.scene.add(spot2);
        
        const spotLightHelper2 = new THREE.SpotLightHelper(spot2);
        //this.app.scene.add(spotLightHelper2);



        // low ambient to preserve overall visibility but keep contrast
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
        this.app.scene.add(ambientLight);


        this.buildSeafloor();
        this.buildSubmarine();
        this.buildFishGroups(3, 100, 200);

        this._lastUpdateTime = Date.now() * 0.001;
        this.app.scene.add(this.fishGroup);



        // this.temple = new MyTemple();
        // this.temple.position.set(0, 1, 0);
        // const templeScale = 0.75;
        // this.temple.scale.setScalar(templeScale);
        // this.app.scene.add(this.temple);
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

    update(/* now, dt */) {
        const now = Date.now() * 0.001; // Convert to seconds
        const dt = this._lastUpdateTime ? Math.min(0.1, now - this._lastUpdateTime) : 0;
        this._lastUpdateTime = now;

        this.flocks.forEach(f => f.update(dt));

        if (this.submarine && typeof this.submarine.update === 'function') {
            this.submarine.update(dt);
        }

        const alpha = now % (2 * Math.PI);
        this.corals?.forEach((coral) => {
            if (coral instanceof LSystemCoral) {
                const time = coral.levels[coral.getCurrentLevel()].object.material.userData?.shader?.uniforms.time;
                if (time)
                    time.value = alpha;
            }
        });
    }

    generateRandomSpawnPos(templeRadius, maxRadius) {
        // Generate a random position in the full area
        let x = SgiUtils.rand(-maxRadius, maxRadius);
        let z = SgiUtils.rand(-maxRadius, maxRadius);

        // 

        // Check if it's inside the temple's "forbidden" box
        if (Math.abs(x) < templeRadius && Math.abs(z) < templeRadius) {
            // It's inside. We must "push" it out to the allowed frame.
            // Randomly pick which axis (X or Z) to push.
            if (Math.random() > 0.5) {
                // Push on the X-axis
                // Set x to be in [templeRadius, maxRadius] or [-maxRadius, -templeRadius]
                x = (x > 0 ? 1 : -1) * SgiUtils.rand(templeRadius, maxRadius);
            } else {
                // Push on the Z-axis
                // Set z to be in [templeRadius, maxRadius] or [-maxRadius, -templeRadius]
                z = (z > 0 ? 1 : -1) * SgiUtils.rand(templeRadius, maxRadius);
            }
        }

        return new THREE.Vector3(x, 0, z);
    }
}

export { MyContents };