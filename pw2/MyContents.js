import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { BrainCoral } from './objects/corals/BrainCoral.js';
import { LSystemCoral } from './objects/corals/LSystemCoral.js';
import { MyTemple } from './objects/temple/MyTemple.js';
import { FishFlock } from './objects/fish/FishFlock.js';
import { MySubmarineLOD } from './objects/submarine/MySubmarineLOD.js';
import { TubeCoral } from './objects/corals/TubeCoral.js';
import { Fish } from './objects/fish/Fish.js';
import { Apollo } from './objects/sculpture/Apollo.js';
import { HorsePillar } from './objects/sculpture/HorsePillar.js';
import { Vase } from './objects/others/Vase.js';
import { Chest } from './objects/others/Chest.js';
import { Pillar } from './objects/temple/Pillar.js';
import { SharkController } from './objects/shark/SharkController.js';
import { Bubble } from './objects/bubble/Bubble.js';
import { MySubmarine } from './objects/submarine/MySubmarine.js';
import { MyRock } from './objects/terrain/MyRock.js';
import { MyTerrain } from './objects/terrain/MyTerrain.js';
import { SgiUtils } from './SgiUtils.js';

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
        this.fastLoad = true;
        this.mainRaycaster = new THREE.Raycaster();
        this.selectedObject = null;

        this.axis = null;

        // seafloor related attributes
        this.seafloorGroup = null;
        this.terrainSize = 100;
        this.terrain = new MyTerrain(this, this.terrainSize);
        this.rocks = null;
        this.coralMeshes = null;

        // fish related attributes
        this.allFishMesh = null;
        this.fishByGroup = [];              // array of arrays with fish references per group
        this.fish = [];                     // flat list of all fish
        this.fishScale = 0.1;
        this.showFish = true;
        this.fishBVHHelper = new THREE.Group();
        this.fishBVHHelper.visible = false;

        this.coralsBVH = {box: new THREE.Box3(), children: []};
        this.coralsBVHHelper = new THREE.Group();
        this.coralsBVHHelper.visible = false;

        this.flocks = [];
        this._lastUpdateTime = null;

        // this.aquaman = new MyAquaman(this.app);
        // this.app.scene.add(this.aquaman);
        // this.aquaman.position.set(0, 0, 0);
        this.apollo = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new Apollo(this.app);
        this.apollo.name = "Apollo";
        this.apollo.castShadow = true;
        this.apollo.receiveShadow = true;
        this.apollo.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.app.scene.add(this.apollo);
    
        //this.apollo.rotation.set(-Math.PI/12, -Math.PI/7, Math.PI/3 + Math.PI/12);
        this.apollo.rotateOnAxis(new THREE.Vector3(1, 0, 0), -Math.PI/2 + 1 * Math.PI/12);
        this.apollo.rotateOnAxis(new THREE.Vector3(0, 1, 0), Math.PI/6 - Math.PI/12);
        //this.apollo.position.set(25, -3.5, 20);

        this.apollo.position.set(12, -4.8, 30);


        ///// horse
        this.groupHorsePillars = new THREE.Group();

        this.horse1 = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new HorsePillar(this.app);
        this.horse1.scale.setScalar(0.75);
        this.horse1.position.set(-15, 0, 22);
        this.horse1.rotateY(Math.PI/2);
        this.groupHorsePillars.add(this.horse1);

        this.horse2 = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new HorsePillar(this.app);
        this.horse2.scale.setScalar(0.75);
        this.horse2.position.set(22, 0, -15);
        this.horse2.rotateY(-Math.PI);
        this.groupHorsePillars.add(this.horse2);

        this.groupHorsePillars.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });

        // this.horse3 = new HorsePillar(this.app);
        // this.horse3.position.set(-25, 0, -64);
        // this.horse3.rotateY(-Math.PI/2);
        // this.groupHorsePillars.add(this.horse3);

        const limestoneTexture = new THREE.TextureLoader().load('textures/limestone.jpg');
        limestoneTexture.wrapS = THREE.RepeatWrapping;
        limestoneTexture.wrapT = THREE.RepeatWrapping;
        const repeatFactor = 5;
        limestoneTexture.repeat.set(repeatFactor, repeatFactor);

        const limestoneMaterial = new THREE.MeshPhongMaterial({
            color: "#f9f6e3",
            specular: 0x111111,
            shininess: 10,
            map: limestoneTexture,
        });

        // this.horse3 = new Pillar({state: "broken"}, limestoneMaterial);
        // this.horse3.position.set(-25, 0, -64);
        // this.horse3.rotateY(-Math.PI/2);
        // this.groupHorsePillars.add(this.horse3);

        // this.horse4 = new HorsePillar(this.app);
        // this.horse4.position.set(-64, 0, -25);
        // this.groupHorsePillars.add(this.horse4);

        this.app.scene.add(this.groupHorsePillars);

        this._horsePositioned = false;

        this.vase = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new Vase(this.app);
        this.vase.position.set(10, 0, 10);
        this.app.scene.add(this.vase);
        this._vasePositioned = false;

        this.chest = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new Chest(this.app);
        this.chest.position.set(1, 0, 18);
        this.chest.rotateY(-Math.PI/4);
        this.app.scene.add(this.chest);


        

        this._clippingApplied = false;

        // submarine
        this.submarine = null;

        this.sharkController = null;

        this.bubble = new Bubble(this.app.scene);
    }

    /**
     * builds the seafloor with terrain, rocks and corals
     */
    buildSeafloor() {
        // TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO TODO 
        /// temp function, only for visualization, still need to organize the scene and optimize the constructors
        this.seafloorGroup = new THREE.Group();
        this.seafloorGroup.name = "seafloorGroup";
        this.seafloorGroup.add(this.terrain);   

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
            LSystemCoral,
            BrainCoral,
        ]

        for (let i = 0; i < 200; ++i) {
            const coralType = coralTypes[SgiUtils.randInt(coralTypes.length)];
            const coral = new coralType(SgiUtils.rand(0, 0xffffff), 2);

            coral.position.copy(new THREE.Vector3(SgiUtils.rand(-maxRadius, maxRadius), 0, SgiUtils.rand(-maxRadius, maxRadius)));
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
        this.coralMeshes.add(TubeCoral.defaultOwner);
        this.coralMeshes.add(BrainCoral.defaultOwner);
        this.coralMeshes.add(LSystemCoral.defaultOwner);

        this.coralMeshes.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });

        this.seafloorGroup.add(this.coralMeshes);

        TubeCoral.defaultOwner.computeBVH({margin: 0.5});
        BrainCoral.defaultOwner.computeBVH({margin: 0.5});
        LSystemCoral.defaultOwner.computeBVH({margin: 0.5});

        this.app.scene.add(this.seafloorGroup);
    }

    buildSubmarine() {
        if (this.submarine) {
            this.app.scene.remove(this.submarine);
        }
    
        this.submarine = new MySubmarineLOD(this.app, {
            size: 2,
            assetsPath: 'models/submarine/',
            gltfFile: 'scene.gltf'
        });
        
        this.submarine.position.set(0, 10, -4);
        this.app.scene.add(this.submarine);
        this.submarine.initControls();
    }

    /**
     * Create multiple fish groups. Each group is a THREE.Group with 20-30 fish by default.
     * Fish references are stored in this.fishByGroup (array of arrays) and flat in this.fish.
     */
    buildFishGroups(numGroups = 3, minPer = 20, maxPer = 30, palette = [0xff6b6b, 0x4ecdc4, 0xffd166]) {
        this.fish = [];
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
            const cols = Math.ceil(Math.sqrt(numGroups));
            const rows = Math.ceil(numGroups / cols);
            const spacing = 20;
            const col = g % cols;
            const row = Math.floor(g / cols);
            const cx = (cols - 1) / 2;
            const rz = (rows - 1) / 2;

            const count = Math.max(minPer, Math.floor(SgiUtils.rand(minPer, maxPer + 1)));
            const groupFishes = [];
        
            for (let i = 0; i < count; ++i) {
                const color = colors[Math.floor(Math.random() * colors.length)];

                const fish = new Fish({
                    scale: SgiUtils.rand(0.08, 0.16),
                    color: color,
                });

                // local position inside group (clustered)
                fish.position.set(SgiUtils.rand(-4, 4), SgiUtils.rand(-1, 3), SgiUtils.rand(-4, 4));

                groupFishes.push(fish);
                this.fish.push(fish);
            }

            this.fishByGroup.push(groupFishes);

            // create a FishFlock to govern the boids for this group
            const flock = new FishFlock(groupFishes);
            flock.position.set((col - cx) * spacing, SgiUtils.rand(1, 6), (row - rz) * spacing);
            if (this.submarine) {
                flock.addDanger(this.submarine);
            }
            if (this.shark) {
                flock.addDanger(this.shark);
            }
            flock.addObstacle(this.coralsBVH, 1);
            this.flocks.push(flock);
            this.fishBVHHelper.add(new THREE.Box3Helper(flock._bvh.box));
            flock._bvh.children.forEach(fish => this.fishBVHHelper.add(new THREE.Box3Helper(fish.box, 0x00ffff)));
        }
        this.app.scene.add(this.fishBVHHelper);
        this.app.scene.add(Fish.defaultOwner);
        this.allFishMesh = Fish.defaultOwner.updateInstances(() => {});
    }

    /**
     * Creates the shark, its wrapper, and its flock controller.
     */
    buildShark() {
        this.sharkController = new SharkController(this.app, this.app.scene, {
            size: 1,
            assetsPath: 'models/shark/'
        });
        this.sharkController.buildShark();
        this.shark = this.sharkController.shark;
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

        // shadows config
        this.app.renderer.shadowMap.enabled = true;
        this.app.renderer.shadowMap.type = THREE.PCFShadowMap;

        // UNDERWATER LIGHTING SETUP
        // Blue-tinted ambient light simulating water's natural color filtering
        const underwaterAmbient = new THREE.AmbientLight("#6b9fb0", 0.3);
        this.app.scene.add(underwaterAmbient);

        // Main directional light: sun rays filtering through water (blueish)
        const sunlight = new THREE.DirectionalLight("#7dd3d1", 0.55);
        sunlight.position.set(40, 70, 40);
        sunlight.castShadow = false;
        sunlight.shadow.mapSize.set(2048, 2048);
        sunlight.shadow.camera.near = 0.5;
        sunlight.shadow.camera.far = 150;
        sunlight.shadow.camera.left = -70;
        sunlight.shadow.camera.right = 70;
        sunlight.shadow.camera.top = 70;
        sunlight.shadow.camera.bottom = -70;
        this.app.scene.add(sunlight);

        // Hemisphere light for natural color balance (sky: light blue, ground: darker blue-green)
        const hemi = new THREE.HemisphereLight("#9dd9ff", "#1a4d5c", 0.4);
        this.app.scene.add(hemi);

        // Soft fill light from below to simulate light reflecting off the seafloor
        const fillLight = new THREE.PointLight("#5a8fb3", 0.3, 120);
        fillLight.position.set(-40, 1, 30);
        this.app.scene.add(fillLight);

        // Additional subtle point light for depth variation and atmosphere
        const accentLight = new THREE.PointLight("#6bc4d0", 0.25, 100);
        accentLight.position.set(35, 40, -40);
        this.app.scene.add(accentLight);



        // spotlights
        const spot1 = new THREE.SpotLight(0xffffff, 5000);
        spot1.position.set(50, 75, 10);
        spot1.target.position.set(10, 0, 5);
        spot1.angle = Math.PI / 12;
        spot1.penumbra = 0.5;
        spot1.decay = 2;
        spot1.distance = 150;
        spot1.castShadow = false;
        spot1.shadow.mapSize.set(2048, 2048);
        spot1.shadow.camera.near = 0.5;
        spot1.shadow.camera.far = 200;
        this.app.scene.add(spot1);
        const spotLightHelper1 = new THREE.SpotLightHelper(spot1);
        // this.app.scene.add(spotLightHelper1);

        // temple spots
        const spot2 = new THREE.SpotLight(0xffffff, 2000);
        spot2.position.set(-20, 75, -45);
        spot2.target.position.set(-10, 0, -10);
        spot2.angle = Math.PI / 8;
        spot2.penumbra = 0.5;
        spot2.decay = 2;
        spot2.distance = 150;
        spot2.castShadow = false;
        spot2.shadow.mapSize.set(2048, 2048);
        spot2.shadow.camera.near = 0.5;
        spot2.shadow.camera.far = 200;
        this.app.scene.add(spot2);
        const spotLightHelper2 = new THREE.SpotLightHelper(spot2);
        // this.app.scene.add(spotLightHelper2);


        const spot3 = new THREE.SpotLight(0xffffff, 1500);
        spot3.position.set(-20, 50, 40);
        spot3.target.position.set(-10, 0, -10);
        spot3.angle = Math.PI / 8;
        spot3.penumbra = 0.5;
        spot3.decay = 2;
        spot3.distance = 150;
        spot3.castShadow = false;
        spot3.shadow.mapSize.set(2048, 2048);
        spot3.shadow.camera.near = 0.5;
        spot3.shadow.camera.far = 200;
        this.app.scene.add(spot3);
        const spotLightHelper3 = new THREE.SpotLightHelper(spot3);
        // this.app.scene.add(spotLightHelper3);


        // main spotlight
        const spot4 = new THREE.SpotLight(0xffffff, 7500);
        spot4.position.set(-5, 75, 40);
        spot4.target.position.set(-5, 0, -5);
        spot4.angle = Math.PI / 5;
        spot4.penumbra = 0.5;
        spot4.decay = 2;
        spot4.distance = 150;
        // spot4.castShadow = true;
        spot4.shadow.mapSize.set(2048, 2048);
        spot4.shadow.camera.near = 0.5;
        spot4.shadow.camera.far = 200;
        this.app.scene.add(spot4);
        const spotLightHelper4 = new THREE.SpotLightHelper(spot4);
        // this.app.scene.add(spotLightHelper4);



        this.buildSeafloor();
        this.buildSubmarine();
        if (!this.fastLoad)
            this.buildShark();
        this.buildFishGroups(5, 100, 200);
        

        this.seafloorGroup.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
            }
        });

        this._lastUpdateTime = Date.now() * 0.001;

        this.temple = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new MyTemple();
        this.temple.name = "Temple";
        this.temple.rotateY(-Math.PI / 4);
        this.temple.position.set(-15, 1, -15);
        const templeScale = 0.75;
        this.temple.scale.setScalar(templeScale);

        this.temple.traverse((child) => {
            if (child.isMesh) {
                child.receiveShadow = true;
                child.castShadow = true;
            }
        });

        this.app.scene.add(this.temple);
        
        if (this.submarine) {
            this.submarine.setBubbleSystem(this.bubble);
        }

        this.setupClickHandler();

        // // CLIPPING ///////////
        // // clipping plane at y = 0
        // const clippingPlanes = [
        //     new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),                         // y = 0 (bottom)
        //     new THREE.Plane(new THREE.Vector3(1, 0, 0), this.terrainSize / 2),      // x = 50 (right)
        //     new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.terrainSize / 2),     // x = -50 (left)
        //     new THREE.Plane(new THREE.Vector3(0, 0, 1), this.terrainSize / 2),      // z = 50 (front)
        //     new THREE.Plane(new THREE.Vector3(0, 0, -1), this.terrainSize / 2),     // z = -50 (back)
        // ];

        // this.app.renderer.localClippingEnabled = true;

        // //clipping to all materials
        // const clippingObjects = ["Apollo", "Temple"];
        // this.app.scene.traverse((object) => {
        //     if (object.isMesh && object.material) {
        //         if (clippingObjects.includes(object.parent?.name) || clippingObjects.some(name => object.name.includes(name))) {
        //             if (Array.isArray(object.material)) {
        //                 object.material.forEach(m => {
        //                     m.clippingPlanes = clippingPlanes;
        //                 });
        //             } else {
        //                 object.material.clippingPlanes = clippingPlanes;
        //             }
        //         }
        //     }
        // });
        // /////////////////////
    }

    setFishesScale(s) {
        this.fish.forEach(fish => fish.scale.multiplyScalar(s / this.fishScale));
        this.fishScale = s;
    }

    update(/* now, dt */) {
        const now = Date.now() * 0.001; // Convert to seconds
        const dt = this._lastUpdateTime ? Math.min(0.1, now - this._lastUpdateTime) : 0;
        this._lastUpdateTime = now;

        if (!this._horsePositioned && 
            this.terrain.mesh && 
            this.terrain.mesh.material.displacementMap && 
            this.terrain.mesh.material.displacementMap.image &&
            this.terrain.mesh.material.displacementMap.image.width) {
            
            this.groupHorsePillars.children.forEach((horse) => {
            const terrainHeight = this.terrain.displacementAtXY(horse.position.x, horse.position.z);
            horse.position.y = terrainHeight;

            // Apply terrain inclination to rotate horse with the terrain
            const inclination = this.terrain.inclinationAtXY(horse.position.x, horse.position.z);
                horse.rotateX(inclination[1]);
                horse.rotateZ(-inclination[0]);
            });
            
            this._horsePositioned = true;
        }

        if (!this._clippingApplied && this.apollo.isLoaded && this.apollo.isLoaded()) {
            this.applyClipping();
            this._clippingApplied = true;
        }

        if (!this._vasePositioned && 
            this.terrain.mesh && 
            this.terrain.mesh.material.displacementMap && 
            this.terrain.mesh.material.displacementMap.image &&
            this.terrain.mesh.material.displacementMap.image.width) {
            
            const terrainHeight = this.terrain.displacementAtXY(this.vase.position.x, this.vase.position.z);
            this.vase.position.y = terrainHeight;

            // Apply terrain inclination to rotate vase with the terrain
            const inclination = this.terrain.inclinationAtXY(this.vase.position.x, this.vase.position.z);
            this.vase.rotateX(inclination[1]);
            this.vase.rotateZ(-inclination[0]);
            
            this._vasePositioned = true;
        }
                                                                            
        if (this.sharkController) {
            this.sharkController.update(dt);
        }

        this.flocks.forEach(f => f.update(dt));
        this.allFishMesh.updateInstances(() => {});

        if (this.bubble) {
            this.bubble.update(dt); 
        }

        if (this.submarine && typeof this.submarine.update === 'function') {
            this.submarine.updateSubmarine(dt);
        }

        const alpha = now % (2 * Math.PI);
        LSystemCoral.defaultOwner.LODinfo.objects.forEach((lod) => {
            const time = lod.material.userData?.shader?.uniforms.time;
            if (time)
                time.value = alpha;
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

    /**
     * Picks a new random patrol target for the shark within its territory.
     */
    pickNewSharkTarget() {
        this.sharkTarget.copy(this.sharkPatrolCenter)
            .add(new THREE.Vector3(
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius),
                SgiUtils.rand(-5, 5), // Swims in a 10-unit vertical band
                SgiUtils.rand(-this.sharkPatrolRadius, this.sharkPatrolRadius)
            ));
    }

    /**
     * Updates the shark's movement and rotation.
     * @param {number} dt - delta time
     */
    updateShark(dt) {
        // Stop if shark isn't loaded
        if (!this.shark || !this.shark.visible) return;

        // 1. Check if we've reached the target
        const distanceToTarget = this.shark.position.distanceTo(this.sharkTarget);
        if (distanceToTarget < 5.0) { // Close enough
            this.pickNewSharkTarget();
        }

        // 2. Move the shark towards the target
        const direction = new THREE.Vector3()
            .subVectors(this.sharkTarget, this.shark.position)
            .normalize();
        this.shark.position.add(direction.multiplyScalar(this.sharkSwimSpeed * dt));

        // 3. Smoothly rotate the shark to look at the target
        // We use slerp (spherical linear interpolation) for smooth turning
        
        // Calculate the target rotation
        this._sharkLookAtMatrix.lookAt(this.sharkTarget, this.shark.position, this.shark.up);
        this._sharkTargetQuaternion.setFromRotationMatrix(this._sharkLookAtMatrix);
        
        // Interpolate the shark's current rotation towards the target rotation
        this.shark.quaternion.slerp(this._sharkTargetQuaternion, this.sharkTurnSpeed * dt);
    }

    setupClickHandler() {
        const clickStart = new THREE.Vector2();
        let clickTime;

        window.addEventListener('mousedown', (e) => {
            clickStart.set(e.clientX, e.clientY);
            clickTime = performance.now();
        });

        window.addEventListener('mouseup', (e) => {
            if (e.target.tagName != 'CANVAS')
                return;

            const dx = e.clientX - clickStart.x;
            const dy = e.clientY - clickStart.y;
            const d = Math.sqrt(dx * dx + dy * dy);
            if (d >= 5 || (performance.now() - clickTime) >= 500)
                return;

            const mouse = new THREE.Vector2(
                (e.clientX / window.innerWidth) * 2 - 1,
                -(e.clientY / window.innerHeight) * 2 + 1,
            );

            this.mainRaycaster.setFromCamera(mouse, this.app.activeCamera);
            const intersects = this.mainRaycaster
                .intersectObjects([this.allFishMesh, this.coralMeshes, this.rocks, this.vase, this.chest])
                .filter(x => SgiUtils.isObjectVisible(x.object))
                ;

            console.log(intersects);
            if (this.selectedObject) {
                this.selectedObject.scale.divideScalar(5);
                this.selectedObject.updateMatrix();
            }

            if (intersects.length === 0) {
                this.selectedObject = null;
                return;
            }

            let obj = intersects[0];
            obj = obj.object.isInstancedMesh
                ? obj.object.instances[obj.instanceId].userData.owner
                : obj.object;

            obj.scale.multiplyScalar(5);
            obj.updateMatrix();
            this.selectedObject = obj;
        })
    }

    applyClipping() {
    const clippingPlanes = [
        new THREE.Plane(new THREE.Vector3(0, 1, 0), 0),
        new THREE.Plane(new THREE.Vector3(1, 0, 0), this.terrainSize / 2),
        new THREE.Plane(new THREE.Vector3(-1, 0, 0), this.terrainSize / 2),
        new THREE.Plane(new THREE.Vector3(0, 0, 1), this.terrainSize / 2),
        new THREE.Plane(new THREE.Vector3(0, 0, -1), this.terrainSize / 2),
    ];
    
    this.app.renderer.localClippingEnabled = true;

    const clippingObjects = ["Apollo", "Temple"];

    const isClippingObject = (obj) => {
        let current = obj;
        while (current) {
            if (clippingObjects.includes(current.name)) {
                return true;
            }
            current = current.parent;
        }
        return false;
    };

    this.app.scene.traverse((object) => {
        if (object.isMesh && object.material && isClippingObject(object)) {
            if (Array.isArray(object.material)) {
                object.material.forEach(m => {
                    m.clippingPlanes = clippingPlanes;
                });
            } else {
                object.material.clippingPlanes = clippingPlanes;
            }
        }
    });
}
}

export { MyContents };
