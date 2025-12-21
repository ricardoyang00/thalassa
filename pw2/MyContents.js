import * as THREE from 'three';
import * as BufferGeometryUtils from 'three/addons/utils/BufferGeometryUtils.js';
import { MeshBVH, MeshBVHHelper, acceleratedRaycast } from 'three-mesh-bvh';
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
import { SharkController } from './objects/shark/SharkController.js';
import { Bubble } from './objects/bubble/Bubble.js';
import { MyRock } from './objects/terrain/MyRock.js';
import { MyTerrain } from './objects/terrain/MyTerrain.js';
import { SandPuffManager } from './objects/terrain/SandPuff.js';
import { SgiUtils } from './SgiUtils.js';
import { addVolumetricLight } from './SGILightUtils.js';
import { MarineSnow } from './MarineSnow.js';

THREE.Mesh.prototype.raycast = acceleratedRaycast;

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
        this.fastLoad = false;
        this.mainRaycaster = new THREE.Raycaster();
        this.selectedObject = null;
        this.colliders = [];

        this.axis = null;

        // seafloor related attributes
        this.seafloorGroup = null;
        this.terrainSize = 100;
        this.terrain = new MyTerrain(this, this.terrainSize);
        this.affectedByTerrain = []; // objects whose position depends on the terrain
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
            : new Apollo(this.app, {
                onLoad: () => this.colliders.push(SgiUtils.buildColliderGeo(this.apollo).boundsTree)
            });
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
            : new HorsePillar(this.app, () => this.colliders.push(SgiUtils.buildColliderGeo(this.horse1).boundsTree));
        this.horse1.scale.setScalar(0.75);
        this.horse1.position.set(-15, 0, 22);
        this.horse1.rotateY(Math.PI/2);
        this.groupHorsePillars.add(this.horse1);

        this.horse2 = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new HorsePillar(this.app, () => this.colliders.push(SgiUtils.buildColliderGeo(this.horse2).boundsTree));
        this.horse2.scale.setScalar(0.75);
        this.horse2.position.set(22, 0, -15);
        this.horse2.rotateY(-Math.PI);
        this.groupHorsePillars.add(this.horse2);

        this.groupHorsePillars.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        });

        this.affectedByTerrain.push(...this.groupHorsePillars.children);

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
        this.affectedByTerrain.push(this.vase);

        this.chest = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new Chest(this.app);
        this.chest.position.set(3, 1.5, 15);
        this.chest.rotateY(-Math.PI/4);
        this.app.scene.add(this.chest);
        // this.affectedByTerrain.push(this.chest);

        // Add golden light inside the chest
        const chestGoldenLight = new THREE.PointLight(0xFFD700, 8, 15);
        chestGoldenLight.position.set(5, 3.9, 10.5);
        chestGoldenLight.castShadow = true;
        chestGoldenLight.shadow.mapSize.width = 512;
        chestGoldenLight.shadow.mapSize.height = 512;
        this.app.scene.add(chestGoldenLight);
        
        // Add light helper to visualize the light
        // const chestLightHelper = new THREE.PointLightHelper(chestGoldenLight, 0.5);
        // this.app.scene.add(chestLightHelper);


        

        this._clippingApplied = false;

        // submarine
        this.submarine = null;

        this.sharkController = null;

        this.bubble = new Bubble(this.app.scene);
        this.coralBubblesEnabled = true; // Toggle for coral bubbles

        // sand puff particle system
        this.sandPuff = new SandPuffManager(this.app.scene);

        // Store reference to volumetric light cone
        this.volumetricLightCone = null;
        this.marineSnow = null;
    }

    /**
     * builds the seafloor with terrain, rocks and corals
     * Spawns objects anywhere on terrain except in exclusion zones
     * Natural spacing prevents overlapping
     * 
     * @param {number} rockCount - number of rocks to spawn (default: 50)
     * @param {number} coralCount - number of corals to spawn (default: 150)
     * @param {number} terrainMargin - margin from terrain edges to avoid spawn (default: 10)
     */
    buildSeafloor(rockCount = 100, coralCount = 850, terrainMargin = 3) {
        // Remove old seafloor if it exists
        if (this.seafloorGroup && this.seafloorGroup.parent) {
            this.app.scene.remove(this.seafloorGroup);
        }

        this.seafloorGroup = new THREE.Group();
        this.seafloorGroup.name = "seafloorGroup";
        this.seafloorGroup.add(this.terrain);   

        // Define exclusion zones around existing objects
        this.exclusionZones = [
            { pos: new THREE.Vector3(-15, 0, -15), radius: 26, name: "Temple", rotationY: Math.PI / 4 },
            // { pos: new THREE.Vector3(9, 0, 4), radius: 15, name: "Apollo", rotationY: Math.PI / 4 },
            { pos: new THREE.Vector3(-15, 0, 22), radius: 2, name: "Horse 1", rotationY: 0 },
            { pos: new THREE.Vector3(22, 0, -15), radius: 2, name: "Horse 2", rotationY: 0 },
            { pos: new THREE.Vector3(10, 0, 10), radius: 2, name: "Vase", rotationY: 0 },
            { pos: new THREE.Vector3(4.5, 0, 10.5), radius: 2, name: "Chest", rotationY: 0 },
            { pos: new THREE.Vector3(11, 0, 4), radius: 5, name: "ApolloHead", rotationY:0 },
            { pos: new THREE.Vector3(23, 0, 5), radius: 3.5, name: "ApolloArmLeft", rotationY:0 },
            { pos: new THREE.Vector3(6.5, 0, 14), radius: 2, name: "ApolloArmRight", rotationY:0 }
        ];

        // Draw debug boxes for exclusion zones (visual representation)
        const debugGroup = new THREE.Group();
        debugGroup.name = "exclusionZoneDebug";
        for (const zone of this.exclusionZones) {
            const boxGeometry = new THREE.BoxGeometry(zone.radius * 2, 5, zone.radius * 2);
            const boxMaterial = new THREE.MeshStandardMaterial({ 
                color: 0xff0000, 
                emissive: 0xff0000,
                transparent: true,
                opacity: 0.3,
                wireframe: false
            });
            const box = new THREE.Mesh(boxGeometry, boxMaterial);
            box.position.copy(zone.pos);
            box.position.y = 2.5;
            box.rotation.y = zone.rotationY || 0;
            box.name = `exclusion_${zone.name}`;
            debugGroup.add(box);
        }
        this.seafloorGroup.add(debugGroup);

        // Calculate spawn boundaries with margin
        const terrainSize = this.terrainSize; // 100
        const spawnMinX = -terrainSize / 2 + terrainMargin;
        const spawnMaxX = terrainSize / 2 - terrainMargin;
        const spawnMinZ = -terrainSize / 2 + terrainMargin;
        const spawnMaxZ = terrainSize / 2 - terrainMargin;

        console.log(`Building seafloor: ${rockCount} rocks, ${coralCount} corals, margin=${terrainMargin}`);
        console.log(`Exclusion zones: ${this.exclusionZones.map(z => `${z.name}@(${z.pos.x},${z.pos.z}) r=${z.radius}`).join(', ')}`);
        console.log(`Spawn area: X[${spawnMinX}, ${spawnMaxX}], Z[${spawnMinZ}, ${spawnMaxZ}]`);

        // Spawn rocks across entire terrain
        this.rocks = new THREE.Group();
        this.rocks.name = "rocks";
        const maxAttempts = 100; // Prevent infinite loops
        let rocksPlaced = 0;
        
        for (let i = 0; i < rockCount; i++) {
            const rock = new MyRock(this, SgiUtils.rand(0.2, 1), SgiUtils.rand.bind(SgiUtils));
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < maxAttempts) {
                // Random position with margin from edges
                const x = SgiUtils.rand(spawnMinX, spawnMaxX);
                const z = SgiUtils.rand(spawnMinZ, spawnMaxZ);
                const pos = new THREE.Vector3(x, 0, z);

                // Check exclusion zones FIRST
                if (this.isNearObject(pos)) {
                    attempts++;
                    continue;
                }

                // Check distance from other rocks (natural spacing with randomness) - use XZ distance only
                const minSpacing = rock.size + SgiUtils.rand(0.5, 1.5);
                let tooClose = false;
                for (const existingRock of this.rocks.children) {
                    const rockDistXZ = Math.sqrt(
                        Math.pow(pos.x - existingRock.position.x, 2) + 
                        Math.pow(pos.z - existingRock.position.z, 2)
                    );
                    if (rockDistXZ < minSpacing) {
                        tooClose = true;
                        break;
                    }
                }

                if (!tooClose) {
                    rock.position.copy(pos);
                    this.rocks.add(rock);
                    rocksPlaced++;
                    placed = true;
                }

                attempts++;
            }
        }
        console.log(`Rocks placed: ${rocksPlaced}/${rockCount}`);
        this.seafloorGroup.add(this.rocks);

        // Spawn corals across entire terrain
        this.coralMeshes = new THREE.Group();
        this.coralMeshes.name = "corals";
        this.corals = [];
        let coralsPlaced = 0;

        const coralTypes = [
            TubeCoral,
            LSystemCoral,
            BrainCoral,
        ];

        const naturalCoralPalette = [
            0xff7f50, // Coral (The classic color)
            0xf08080, // Light Coral / Salmon
            0xe9967a, // Dark Salmon
            0xda70d6, // Orchid (Soft Purple)
            0x9370db, // Medium Purple
            0x8b008b, // Dark Magenta (Deep water fans)
            0x4682b4, // Steel Blue (Staghorn corals)
            0x20b2aa, // Light Sea Green
            0xf0e68c, // Khaki (Sponge/Sand look)
            0xffd700, // Gold (Yellow Sponges)
            0xcd5c5c, // Indian Red (Hard pipe corals)
        ];

        for (let i = 0; i < coralCount; ++i) {
            const coralType = coralTypes[SgiUtils.randInt(coralTypes.length)];

            const baseHex = naturalCoralPalette[SgiUtils.randInt(naturalCoralPalette.length)];
            const colorObj = new THREE.Color(baseHex);
            const hueShift = (Math.random() - 0.5) * 0.05;  // Slight tint change
            const satShift = (Math.random() - 0.5) * 0.15;  // Some are pale, some vivid
            const lightShift = (Math.random() - 0.5) * 0.1; // Shadows/Sunlight diff
            colorObj.offsetHSL(hueShift, satShift, lightShift);

            const coral = new coralType(colorObj.getHex(), SgiUtils.rand(0.9, 1.2));
            let placed = false;
            let attempts = 0;

            while (!placed && attempts < maxAttempts) {
                // Random position with margin from edges
                const x = SgiUtils.rand(spawnMinX, spawnMaxX);
                const z = SgiUtils.rand(spawnMinZ, spawnMaxZ);
                const pos = new THREE.Vector3(x, 0, z);

                // Check exclusion zones FIRST
                if (this.isNearObject(pos)) {
                    attempts++;
                    continue;
                }

                // Check distance from rocks (natural spacing) - use XZ distance only
                const rockMinSpacing = 0.75;
                let tooCloseToRock = false;
                for (const rock of this.rocks.children) {
                    const rockDistXZ = Math.sqrt(
                        Math.pow(pos.x - rock.position.x, 2) + 
                        Math.pow(pos.z - rock.position.z, 2)
                    );
                    if (rockDistXZ < rock.size + rockMinSpacing) {
                        tooCloseToRock = true;
                        break;
                    }
                }

                if (tooCloseToRock) {
                    attempts++;
                    continue;
                }

                // Check distance from other corals (natural spacing with randomness) - use XZ distance only
                const coralMinSpacing = SgiUtils.rand(0.5, 1.5);
                let tooCloseToCoral = false;
                for (const existingCoral of this.corals) {
                    const coralDistXZ = Math.sqrt(
                        Math.pow(pos.x - existingCoral.position.x, 2) + 
                        Math.pow(pos.z - existingCoral.position.z, 2)
                    );
                    if (coralDistXZ < coralMinSpacing) {
                        tooCloseToCoral = true;
                        break;
                    }
                }

                if (!tooCloseToCoral) {
                    coral.position.copy(pos);
                    
                    // Set bubble system for TubeCoral instances
                    if (coral instanceof TubeCoral) {
                        coral.setBubbleSystem(this.bubble);
                    }
                    
                    this.corals.push(coral);
                    coralsPlaced++;
                    placed = true;
                }

                attempts++;
            }
            this.affectedByTerrain.push(coral);
            this.corals.push(coral);
        }

        console.log(`Corals placed: ${coralsPlaced}/${coralCount}`);

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

        // Verify no objects are in exclusion zones
        this.verifyExclusionZones();
    }

    /**
     * Verify that no rocks or corals are inside exclusion zones
     */
    verifyExclusionZones() {
        let violations = 0;
        
        // Check rocks
        for (const rock of this.rocks.children) {
            if (this.isNearObject(rock.position)) {
                violations++;
                console.warn(`❌ VIOLATION: Rock at (${rock.position.x.toFixed(2)}, ${rock.position.z.toFixed(2)}) is in exclusion zone!`);
            }
        }
        
        // Check corals
        for (const coral of this.corals) {
            if (this.isNearObject(coral.position)) {
                violations++;
                console.warn(`❌ VIOLATION: Coral at (${coral.position.x.toFixed(2)}, ${coral.position.z.toFixed(2)}) is in exclusion zone!`);
            }
        }
        
        if (violations === 0) {
            console.log(`✅ Verification passed: No objects in exclusion zones`);
        } else {
            console.warn(`⚠️  Found ${violations} objects in exclusion zones!`);
        }
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
        this.submarine.initControls(this.colliders);
    }

    /**
     * Create multiple fish groups. Each group is a THREE.Group with 20-30 fish by default.
     * Fish references are stored in this.fishByGroup (array of arrays) and flat in this.fish.
     */
    buildFishGroups(numGroups = 3, minPer = 20, maxPer = 30) {
        this.fish = [];
        this.fishByGroup = [];

        // 1. DEFINED WARM/NATURAL PALETTE (Heavy on Gold, Orange, Silver, Pink)
        // We explicitly avoid deep blues to prevent them blending into the water or dominating.
        const colorPalette = [
            0xff4500, // OrangeRed (High Vis)
            0xff8c00, // DarkOrange
            0xffa500, // Orange
            0xff6347, // Tomato
            0xff0000, // Pure Red
            0xffb7c5, // Cherry Blossom Pink (Good contrast vs blue)
        ];

        // Use user palette if provided, otherwise use our natural warm palette
        const activePalette = colorPalette;

        // Helper to parse colors safely
        const parseColor = (c) => {
            if (typeof c === 'number') return c;
            if (typeof c === 'string') return parseInt(c.replace(/^#|^0x/, ''), 16);
            return 0xffffff;
        };

        const colors = activePalette.map(parseColor);

        for (let g = 0; g < numGroups; ++g) {
            const cols = Math.ceil(Math.sqrt(numGroups));
            const spacing = 20;
            const col = g % cols;
            const row = Math.floor(g / cols);
            const cx = (cols - 1) / 2;
            const rz = (Math.ceil(numGroups / cols) - 1) / 2;

            const count = Math.max(minPer, Math.floor(SgiUtils.rand(minPer, maxPer + 1)));
            const groupFishes = [];

            // --- STEP 1: PICK A "SPECIES THEME" FOR THE GROUP ---
            // We pick ONE base color for this whole group.
            // This prevents the "confetti" look where every fish is different.
            const baseColorHex = colors[g % colors.length];
            const baseColor = new THREE.Color(baseColorHex);
            
            // Convert to HSL so we can do math on the color wheel
            const baseHSL = { h: 0, s: 0, l: 0 };
            baseColor.getHSL(baseHSL);

            for (let i = 0; i < count; ++i) {
                
                // --- STEP 2: ANALOGOUS VARIATION (The "Natural" Look) ---
                
                // A. Hue Drift: 
                // Allow the color to shift +/- 10% on the color wheel.
                // If the base is Orange, some fish will be Yellowish, some Reddish.
                const hueDrift = (Math.random() - 0.5) * 0.12; 

                // B. Saturation drop (The "Silver" Scale Effect):
                // Real fish are rarely 100% saturated neon.
                // We tend to lower saturation to make them look more like living creatures.
                // We allow a wide range: some are dull (grey/silver), some are vibrant.
                const satDrift = (Math.random() - 0.5) * 0.3; 

                // C. Lightness: 
                // Top of fish catches sun, bottom is shadow. Randomize slightly.
                const lightDrift = (Math.random() - 0.5) * 0.2;

                const fishColor = new THREE.Color().setHSL(
                    (baseHSL.h + hueDrift + 1) % 1, // Ensure hue stays 0-1
                    THREE.MathUtils.clamp(baseHSL.s + satDrift, 0.2, 1.0), // Keep between 0.2 (grey) and 1.0 (neon)
                    THREE.MathUtils.clamp(baseHSL.l + lightDrift, 0.3, 0.8) // Keep visible
                );

                const fish = new Fish({
                    scale: SgiUtils.rand(0.08, 0.16),
                    color: fishColor.getHex(),
                });

                fish.position.set(SgiUtils.rand(-4, 4), SgiUtils.rand(-1, 3), SgiUtils.rand(-4, 4));

                groupFishes.push(fish);
                this.fish.push(fish);
            }

            this.fishByGroup.push(groupFishes);

            // ... (Flock Logic unchanged) ...
            const flock = new FishFlock(groupFishes, {
                colliders: this.colliders,
            });
            flock.position.set((col - cx) * spacing, SgiUtils.rand(1, 6), (row - rz) * spacing);
            if (this.submarine) flock.addDanger(this.submarine);
            if (this.shark) flock.addDanger(this.shark);
            this.flocks.push(flock);
            this.fishBVHHelper.add(new THREE.Box3Helper(flock._bvh.box));
            flock._bvh.children.forEach(fish => this.fishBVHHelper.add(new THREE.Box3Helper(fish.box, 0x00ffff)));
        }
        this.app.scene.add(this.fishBVHHelper);
        this.app.scene.add(Fish.defaultOwner);
        this.allFishMesh = Fish.defaultOwner.updateInstances((obj, i) => {Fish.defaultOwner.setBonesAt(i);});
        // Fish.defaultOwner.computeBVH();
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

    buildWater() {
        const waterColor = new THREE.Color("#051a3d");
        this.app.scene.background = waterColor;
        
        // the lower the density, the further we can see
        this.app.scene.fog = new THREE.FogExp2(waterColor, 0.02);

        const surfaceGeo = new THREE.PlaneGeometry(300, 300, 32, 32);

        // Create a radial alpha map so the water fades toward the edges
        function createRadialAlphaTexture(size = 1024, inner = 0.55, outer = 0.95) {
            const canvas = document.createElement('canvas');
            canvas.width = canvas.height = size;
            const ctx = canvas.getContext('2d');

            const cx = size / 2, cy = size / 2;
            const grad = ctx.createRadialGradient(cx, cy, inner * size / 2, cx, cy, outer * size / 2);
            grad.addColorStop(0.0, 'rgba(255,255,255,1)');
            grad.addColorStop(0.7, 'rgba(255,255,255,0.6)');
            grad.addColorStop(1.0, 'rgba(255,255,255,0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, size, size);

            const tex = new THREE.CanvasTexture(canvas);
            tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
            tex.needsUpdate = true;
            return tex;
        }

        const surfaceColor = waterColor.clone();
        surfaceColor.offsetHSL(0, 0, 0.12);

        const surfaceMat = new THREE.MeshPhongMaterial({
            color: surfaceColor,
            specular: new THREE.Color(0x222222),
            shininess: 30,
            opacity: 0.6,
            transparent: true,
            side: THREE.DoubleSide,
            depthWrite: false
        });

        // Assign a radial alpha map to fade edges
        const alphaTex = createRadialAlphaTexture(1024, 0.55, 0.95);
        surfaceMat.alphaMap = alphaTex;
        surfaceMat.alphaMap.wrapS = surfaceMat.alphaMap.wrapT = THREE.ClampToEdgeWrapping;

        const textureLoader = new THREE.TextureLoader();
        textureLoader.load('textures/water.jpg', (texture) => {
            texture.wrapS = THREE.RepeatWrapping;
            texture.wrapT = THREE.RepeatWrapping;
            texture.repeat.set(10, 10);
            surfaceMat.normalMap = texture;
            surfaceMat.needsUpdate = true;
            this.waterTexture = texture;
        });

        // Keep a copy of the original vertex positions so we can displace them each frame
        const posAttr = surfaceGeo.attributes.position;
        this._waterOriginalPositions = new Float32Array(posAttr.array.length);
        this._waterOriginalPositions.set(posAttr.array);

        const surface = new THREE.Mesh(surfaceGeo, surfaceMat);
        surface.rotation.x = -Math.PI / 2;
        surface.position.y = 40;

        this.app.scene.add(surface);

        // Store references for animation
        this.waterSurface = surface;
        this.waterGeometry = surfaceGeo;
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

        const causticsTexture = new THREE.TextureLoader().load('textures/caustics.jpg'); 
        causticsTexture.wrapS = THREE.RepeatWrapping;
        causticsTexture.wrapT = THREE.RepeatWrapping;
        causticsTexture.center.set(0.5, 0.5);

        const causticsLight = new THREE.SpotLight(0xffffff, 5000);
        causticsLight.position.set(0, 39, 0);
        causticsLight.target.position.set(0, 0, 0);
        causticsLight.penumbra = 0.5;
        causticsLight.angle = Math.PI / 3;
        causticsLight.decay = 2;

        causticsLight.map = causticsTexture; 

        this.app.scene.add(causticsLight);
        this.app.scene.add(causticsLight.target);

        // Save reference to animate it
        this.causticsLight = causticsLight;

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
        const spot2 = new THREE.SpotLight(0xffffff, 3000);
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
        
        // Only add volumetric light if not in fly mode
        if (this.app.activeCameraName !== 'Fly') {
            this.volumetricLightCone = addVolumetricLight(this.app.scene, spot2);
        }
        
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
        //this.app.scene.add(spotLightHelper4);

        this.buildWater();
        
        this.marineSnow = new MarineSnow(this.app.scene, {
            count: 2000,
            area: 100,
            topY: 38,
            bottomY: 1,
            size: 0.25,
            color: 0xccddff
        }, this);

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

        const maxAnisotropy = (this.app && this.app.renderer && this.app.renderer.capabilities)
            ? this.app.renderer.capabilities.getMaxAnisotropy()
            : 1;
        console.log("Max Anisotropy: ", maxAnisotropy);

        this.temple = this.fastLoad
            ? new THREE.Mesh(new THREE.BoxGeometry())
            : new MyTemple();
        this.temple.name = "Temple";
        this.temple.rotateY(-Math.PI / 4);
        this.temple.position.set(-15, 1, -15);
        const templeScale = 0.75;
        this.temple.scale.setScalar(templeScale);

        const templeBVHGeo = SgiUtils.buildColliderGeo(this.temple, (boundsTree) => boundsTree.isTempleBVH = true);
        const templeCollideMesh = new THREE.Mesh(templeBVHGeo);
        templeCollideMesh.visible = false;
        this.templeBVHHelper = new MeshBVHHelper(templeCollideMesh, 20);
        this.templeBVHHelper.visible = false;
        this.app.scene.add(this.templeBVHHelper);
        this.colliders.push(templeBVHGeo.boundsTree);

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

        // ALWAYS leave this near near the end to ensure all necessary objects are already on the scene
        this.terrain.loadDisplacement(this.afterTerrainLoads.bind(this));

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

        if (!this._clippingApplied && this.apollo.isLoaded && this.apollo.isLoaded()) {
            this.applyClipping();
            this._clippingApplied = true;
        }
                                                                            
        if (this.sharkController) {
            this.sharkController.update(dt);
        }

        this.flocks.forEach(f => f.update(dt, this.app.activeCamera));
        this.allFishMesh.updateInstances(() => {});

        // Update tube corals for bubble spawning
        this.corals.forEach(coral => {
            if (coral instanceof TubeCoral && typeof coral.update === 'function') {
                coral.bubblesEnabled = this.coralBubblesEnabled;
                coral.update(dt);
            }
        });

        if (this.bubble) {
            this.bubble.update(dt); 
        }

        if (this.sandPuff) {
            this.sandPuff.update(dt);
        }

        if (this.marineSnow) {
            this.marineSnow.update(dt);
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

        if (this.causticsLight) {
            const deepTime = now * 0.0002; 
            const slowTime = now * 0.05; 
        
            this.causticsLight.position.x = (Math.sin(deepTime) * 0.05) + (Math.cos(slowTime) * 0.02);
            this.causticsLight.position.y = 39 + Math.sin(slowTime) * 0.1;
            this.causticsLight.position.z = (Math.cos(deepTime * 0.07) * 0.05) + (Math.sin(slowTime) * 0.02);
        }

        if (this.waterSurface && this.waterGeometry && this._waterOriginalPositions) {
            const positions = this.waterGeometry.attributes.position.array;
            const orig = this._waterOriginalPositions;
            const t = now;

            // Gernster waves
            const waves = [
                { dirDeg: 0,  steepness: 0.4, wavelength: 60 },
                { dirDeg: 30, steepness: 0.4, wavelength: 30 },
                { dirDeg: 60, steepness: 0.4, wavelength: 15 },
            ];

            const wparams = waves.map(w => {
                const rad = (w.dirDeg * Math.PI) / 180.0;
                const d = { x: Math.sin(rad), y: -Math.cos(rad) };
                const k = (Math.PI * 2) / w.wavelength;
                const c = Math.sqrt(9.8 / k);
                const a = w.steepness / k;
                return { d, k, c, a };
            });

            const amplitudeScale = 0.5;

            for (let i = 0; i < positions.length; i += 3) {
                const ox = orig[i];
                const oy = orig[i + 1];
                let dx = 0, dy = 0, dz = 0;

                for (let wi = 0; wi < wparams.length; ++wi) {
                    const wp = wparams[wi];
                    const f = wp.k * (wp.d.x * ox + wp.d.y * oy - wp.c * t);
                    const a = wp.a;
                    const cosf = Math.cos(f);
                    const sinf = Math.sin(f);

                    dx += wp.d.x * (a * cosf);
                    dy += wp.d.y * (a * cosf);
                    dz += a * sinf;
                }

                positions[i] = ox + dx * amplitudeScale;
                positions[i + 1] = oy + dy * amplitudeScale;
                positions[i + 2] = dz * amplitudeScale;
            }

            this.waterGeometry.attributes.position.needsUpdate = true;
            this.waterGeometry.computeVertexNormals();
        }
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
     * Handle camera mode changes - show/hide volumetric light based on camera
     * @param {string} cameraName - The new active camera name
     */
    onCameraChange(cameraName) {
        // Find the spot2 light (temple spotlight)
        const spot2 = this.app.scene.children.find(child => 
            child.isSpotLight && child.position.x === -20 && child.position.z === -45
        );
        
        if (spot2) {
            if (cameraName === 'Fly') {
                // Remove volumetric light when switching to fly mode
                if (this.volumetricLightCone && this.volumetricLightCone.parent) {
                    this.app.scene.remove(this.volumetricLightCone);
                }
            } else {
                // Add volumetric light when switching away from fly mode
                if (!this.volumetricLightCone || !this.volumetricLightCone.parent) {
                    this.volumetricLightCone = addVolumetricLight(this.app.scene, spot2);
                }
            }
        }
    }

    /**
     * Enable or disable the volumetric light cone
     * @param {boolean} enabled - Whether to show the volumetric light
     */
    setVolumetricLightEnabled(enabled) {
        // Find the spot2 light (temple spotlight)
        const spot2 = this.app.scene.children.find(child => 
            child.isSpotLight && child.position.x === -20 && child.position.z === -45
        );
        
        if (spot2) {
            if (enabled) {
                // Add volumetric light if not already present
                if (!this.volumetricLightCone || !this.volumetricLightCone.parent) {
                    this.volumetricLightCone = addVolumetricLight(this.app.scene, spot2);
                }
            } else {
                // Remove volumetric light if present
                if (this.volumetricLightCone && this.volumetricLightCone.parent) {
                    this.app.scene.remove(this.volumetricLightCone);
                }
            }
        }
    }

    /**
     * Check if a position is inside any exclusion zone
     * Supports rotated rectangular zones via rotationY parameter
     */
    isNearObject(pos) {
        if (!this.exclusionZones || this.exclusionZones.length === 0) return false;
        
        for (const zone of this.exclusionZones) {
            // If zone has rotation, we need to check against a rotated rectangle
            if (zone.rotationY && zone.rotationY !== 0) {
                // Translate position relative to zone center
                const relX = pos.x - zone.pos.x;
                const relZ = pos.z - zone.pos.z;
                
                // Rotate position back by -rotationY to align with axis-aligned rectangle
                const cos = Math.cos(-zone.rotationY);
                const sin = Math.sin(-zone.rotationY);
                const rotatedX = relX * cos - relZ * sin;
                const rotatedZ = relX * sin + relZ * cos;
                
                // Check if rotated position is within axis-aligned square/rectangle
                // Using radius as half-width/depth of the box
                if (Math.abs(rotatedX) <= zone.radius && Math.abs(rotatedZ) <= zone.radius) {
                    return true;
                }
            } else {
                // No rotation - use simple circular distance check
                const distXZ = Math.sqrt(
                    Math.pow(pos.x - zone.pos.x, 2) + 
                    Math.pow(pos.z - zone.pos.z, 2)
                );
                
                if (distXZ >= zone.radius) continue;
                
                // If no angle constraint, it's in the zone
                if (zone.angleStart === undefined || zone.angleEnd === undefined) {
                    return true;
                }
                
                // Check if angle is within the sector
                const angle = Math.atan2(pos.z - zone.pos.z, pos.x - zone.pos.x);
                // Normalize angles to [0, 2π)
                const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;
                const normalizedStart = zone.angleStart < 0 ? zone.angleStart + 2 * Math.PI : zone.angleStart;
                const normalizedEnd = zone.angleEnd < 0 ? zone.angleEnd + 2 * Math.PI : zone.angleEnd;
                
                // Handle wraparound case (e.g., from 3π/2 to π/2)
                if (normalizedStart > normalizedEnd) {
                    if (normalizedAngle >= normalizedStart || normalizedAngle <= normalizedEnd) {
                        return true;
                    }
                } else if (normalizedAngle >= normalizedStart && normalizedAngle <= normalizedEnd) {
                    return true;
                }
            }
        }
        
        return false;
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
            const targetObjects = [this.allFishMesh, this.coralMeshes, this.rocks];
            if (this.terrain && this.terrain.terrainMesh) targetObjects.push(this.terrain.terrainMesh);
            const intersects = this.mainRaycaster
                .intersectObjects(targetObjects)
                .filter(x => SgiUtils.isObjectVisible(x.object));
            ;

            if (this.selectedObject) {
                this.selectedObject.scale.divideScalar(5);
                this.selectedObject.updateMatrix();
            }

            if (intersects.length === 0) {
                this.selectedObject = null;
                return;
            }

            let obj = intersects[0];
            // if the first hit is the terrain mesh -> spawn sand puff
            if (obj.object === this.terrain?.terrainMesh) {
                const point = obj.point.clone();
                // derive world-space normal for the hit (fallback to up if missing)
                let normal = new THREE.Vector3(0, 1, 0);
                if (obj.face && obj.face.normal) {
                    normal.copy(obj.face.normal).transformDirection(obj.object.matrixWorld).normalize();
                }
                // spawn a puff at intersection point on seabed
                if (this.sandPuff) {
                    this.sandPuff.spawn(point, { count: 160, spread: 1.6, speed: 4.2, life: 1.6, size: 5.5, normal });
                }
                // do not select the terrain as an object
                return;
            }
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

    afterTerrainLoads() {
        this.colliders.push(SgiUtils.buildColliderGeo(this.terrain).boundsTree);
        this.affectedByTerrain.forEach((obj) => {
            const x = obj.position.x;
            const y = obj.position.z;

            obj.position.y += this.terrain.displacementAtXY(x, y);
            const rotation = this.terrain.inclinationAtXY(x, y);
            obj.rotateX(rotation[1]);
            obj.rotateZ(-rotation[0]);
        });
        TubeCoral.defaultOwner.updateInstances(() => {});
        BrainCoral.defaultOwner.updateInstances(() => {});
        LSystemCoral.defaultOwner.updateInstances(() => {});
        this.rocks.children.forEach((rock) => rock.position.y += this.terrain.displacementAtXY(rock.position.x, rock.position.z));
        this.colliders.push(SgiUtils.buildColliderGeo(this.rocks).boundsTree);

        // calculate BVH only after terrain's displacement
        let xx1 = +Infinity, xx2 = -Infinity, yy1 = +Infinity, yy2 = -Infinity, zz1 = +Infinity, zz2 = -Infinity;
        this.corals.forEach(coral => {
            let x1 = +Infinity, x2 = -Infinity, y1 = +Infinity, y2 = -Infinity, z1 = +Infinity, z2 = -Infinity;
            coral._instances.forEach(obj => {
                const box = obj.owner.bvh.nodesMap.get(obj.id).box;
                x1 = Math.min(x1, box[0]);
                x2 = Math.max(x2, box[1]);
                y1 = Math.min(y1, box[2]);
                y2 = Math.max(y2, box[3]);
                z1 = Math.min(z1, box[4]);
                z2 = Math.max(z2, box[5]);
            });
            xx1 = Math.min(xx1, x1);
            xx2 = Math.max(xx2, x2);
            yy1 = Math.min(yy1, y1);
            yy2 = Math.max(yy2, y2);
            zz1 = Math.min(zz1, z1);
            zz2 = Math.max(zz2, z2);

            coral.box = new THREE.Box3(
                new THREE.Vector3(x1, y1, z1),
                new THREE.Vector3(x2, y2, z2),
            );

            this.coralsBVHHelper.add(new THREE.Box3Helper(coral.box));
        });

        const grid = [];
        const gridSize = 6;
        const dx = (xx2 - xx1) / gridSize, dz = (zz2 - zz1) / gridSize;
        for (let i = 0; i < gridSize; ++i) {
            for (let j = 0; j < gridSize; ++j) {
                const child = {
                    box: new THREE.Box3(
                        new THREE.Vector3(xx1 + i * dx, yy1, zz1 + j * dz),
                        new THREE.Vector3(xx1 + (i+1) * dx, yy2, zz1 + (j+1) * dz),
                    ),
                };
                child.children = this.corals
                    .filter(coral => coral.box.intersectsBox(child.box))
                    .map(coral => {return {box: coral.box, obj: coral}})

                grid.push(child);
                this.coralsBVHHelper.add(new THREE.Box3Helper(child.box, 0x00ff00));
            }
        }

        this.coralsBVH.box = new THREE.Box3(
            new THREE.Vector3(xx1, yy1, zz1),
            new THREE.Vector3(xx2, yy2, zz2),
        );
        this.coralsBVH.children = grid;
        this.app.scene.add(this.coralsBVHHelper);
        this.flocks.forEach(flock => flock.coralsAvoidanceBVH = this.coralsBVH);
        if (this.marineSnow) this.marineSnow.reset();
    }
}

export { MyContents };
