import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyWalls } from './MyWalls.js';
import { MyCompoundObj } from './MyCompoundObj.js';
import { MyShelf } from './MyShelf.js';
import { MyGuitar } from './MyGuitar.js';
import { MyGuitarStand } from './MyGuitarStand.js';
import { MyLightBar } from './MyLightBar.js';
import { MySofa } from './MySofa.js';
import { MyPiano } from './MyPiano.js';
import { MyCoffeeTable } from './MyCoffeeTable.js';
import { MyCarpet } from './MyCarpet.js';
import { MyKeyboard } from './MyKeyboard.js';
import { MyTVTable } from './MyTVTable.js';
import { MyAcousticFoam } from './MyAcousticFoam.js';
import { MyTV } from './MyTV.js';
import { MyMouse } from './MyMouse.js';
import { MyLamp } from './MyLamp.js';
import { MyFloorLamp } from './MyFloorLamp.js';
import { MyBook } from './MyBook.js';
import { MyGamingChair } from './MyGamingChair.js';
import { MyWindow } from './MyWindow.js';

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

        // box related attributes
        this.boxMesh = null
        this.boxMeshSize = 1.0
        this.boxEnabled = false
        this.lastBoxEnabled = null
        this.boxDisplacement = new THREE.Vector3(0,2,0)

        // table related attributes
        this.table = null
        this.tableEnabled = true
        this.lastTableEnabled = null

        // walls related attributes
        this.walls = null
        this.wallsEnabled = true
        this.lastWallsEnabled = null

        // compound obj related attributes
        this.obj = null             // monitor 0 zero
        this.objEnabled = true
        this.lastObjEnabled = null

        this.monitor1 = null
        this.monitor2 = null

        // spotlight related attributes
        this.spotLight = null
        this.spotLightHelper = null
        this.spotLightColor = "#ffffff"
        this.spotLightIntensity = 15
        this.spotLightDistance = 14
        this.spotLightAngle = 20
        this.spotLightPenumbra = 0
        this.spotLightDecay = 0
        this.spotLightPositionY = 10
        this.spotLightTargetY = 0
        this.spotLightVisible = true

        // plane related attributes
        this.diffusePlaneColor = "#ff0000"
        this.specularPlaneColor = "#808080"
        this.planeShininess = 100

        // light bar
        this.lightBars = []

        // sofa
        this.sofa = null
        this.sofaEnabled = true
        this.lastSofaEnabled = null

        this.coffeeTable = null
        this.coffeeTableEnabled = true
        this.lastCoffeeTableEnabled = null

        this.tvTable = null
        this.tv = null
        this.acousticFoam = null
        this.acousticFoam2 = null

        this.carpet = null
        this.carpetEnabled = true
        this.lastCarpetEnabled = null

        const floor_texture = new THREE.TextureLoader().load('textures/wood_floor2.jpg');
        floor_texture.wrapS = THREE.RepeatWrapping;
        floor_texture.wrapT = THREE.RepeatWrapping;
        floor_texture.repeat.set(4, 4);

        //this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
        //    specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess, map: floor_texture })

        this.planeMaterial = new THREE.MeshPhongMaterial({ 
            color: "#8b7355",        // Much darker brown (instead of "#ffffffff")
            specular: "#2a2a2a",     // Dark gray specular for subtle shine
            emissive: "#000000", 
            shininess: 30,           // Lower shininess for wood-like appearance
            map: floor_texture 
        })
        this.shelf = null
        this.guitar = null
        this.guitarStand = null
        this.piano = null
        this.keyboard = null
        this.mouse = null
        this.lamp = null
        this.floorLamp = null
        this.floorLamp2 = null
        this.book = null
        this.book2 = null
        this.book3 = null
        this.book4 = null
        this.book5 = null
        this.gamingChair = null;
        this.window1 = null
        this.window2 = null
    }

    /**
     * builds the box mesh with material assigned
     */
    buildBox() {    
        let boxMaterial = new THREE.MeshPhongMaterial({ color: "#ffff77", 
        specular: "#000000", emissive: "#000000", shininess: 90 })

        // Create a Cube Mesh with basic material
        let box = new THREE.BoxGeometry(  this.boxMeshSize,  this.boxMeshSize,  this.boxMeshSize );
        this.boxMesh = new THREE.Mesh( box, boxMaterial );

        this.boxMesh.position.y = this.boxDisplacement.y;
        this.boxMesh.rotateX(Math.PI / 6);
        this.boxMesh.rotateX(Math.PI / 6);
        this.boxMesh.scale.set(3, 2, 1);
        
        
    }

    /**
     * initializes the contents
     */
    init() {
       
        // create once 
        if (this.axis === null) {
            // create and attach the axis to the scene
            this.axis = new MyAxis(this)
            //this.app.scene.add(this.axis)
        }

        if (this.table === null) { 
            // Load textures for table (same as shelf)
            const blackWoodTexture = new THREE.TextureLoader().load('textures/wood_black.jpg');
            blackWoodTexture.wrapS = THREE.RepeatWrapping;
            blackWoodTexture.wrapT = THREE.RepeatWrapping;
            blackWoodTexture.repeat.set(2, 1); // Horizontal grain for table top

            const inoxTexture = new THREE.TextureLoader().load('textures/inox_black.jpg');
            inoxTexture.wrapS = THREE.RepeatWrapping;
            inoxTexture.wrapT = THREE.RepeatWrapping;
            inoxTexture.repeat.set(1, 3); // Vertical pattern for legs

            // Create materials (same as shelf)
            const blackWoodMaterial = new THREE.MeshPhongMaterial({
                color: "#2a2a2a",        // Dark gray tint for black wood
                specular: "#404040",     // Medium gray specular
                emissive: "#000000",
                shininess: 30,           // Medium shine for finished wood
                map: blackWoodTexture
            });

            const inoxMaterial = new THREE.MeshPhongMaterial({
                color: "#1a1a1a",        // Very dark gray for black steel
                specular: "#666666",     // Bright specular for metallic shine
                emissive: "#000000",
                shininess: 90,           // High shininess for polished metal
                map: inoxTexture
            });

            // Create table with both materials (assuming MyTable accepts materials)
            this.table = new MyTable(this, blackWoodMaterial, inoxMaterial)
            this.table.position.set(0, 0, -3.6)
            this.app.scene.add(this.table)
        }

        if (this.walls === null) {
            this.walls = new MyWalls(this)
            this.app.scene.add(this.walls)
        }

        if (this.obj === null) {
            this.obj = new MyCompoundObj(this)
            
            this.obj.position.set(0, 1.05, -4)
            this.obj.scale.set(0.2, 0.2, 0.2)
            //this.obj.rotation.y = Math.PI / 4
            
            this.app.scene.add(this.obj)
        }

        if (this.shelf === null) {
            this.shelf = new MyShelf(this)
            this.shelf.rotation.y = Math.PI
            this.shelf.position.set(-3.6, 0, -4)
            this.app.scene.add(this.shelf)
        }

        if (this.guitar === null) {
            this.guitar = new MyGuitar(this)
            this.guitar.rotation.y = - Math.PI / 4
            this.guitar.rotateX(- Math.PI / 8)
            this.guitar.scale.set(0.3, 0.3, 0.3)
            this.guitar.position.set(3.5, 0.78, -3.7)
            this.app.scene.add(this.guitar)
        }

        if (this.guitarStand === null) {
            this.guitarStand = new MyGuitarStand(this)
            this.guitarStand.scale.set(1.5, 1.5, 1.5)
            this.guitarStand.position.set(3.5, -0.05, -3.7)
            this.guitarStand.rotation.y = -Math.PI / 4
            this.app.scene.add(this.guitarStand)
        }

        if (this.piano === null) {
            this.piano = new MyPiano(this)
            this.piano.scale.set(0.8, 0.8, 0.8)
            this.piano.rotation.z = Math.PI / 12 * 5
            this.piano.position.set(4.2, 0.73, -2.7)
            this.app.scene.add(this.piano)
        }

        if (this.keyboard === null) {
            this.keyboard = new MyKeyboard(this)
            this.keyboard.rotateY(Math.PI)
            this.keyboard.scale.set(0.3, 0.3, 0.3)
            this.keyboard.position.set(-0.2, 1.05, -3.3)
            this.app.scene.add(this.keyboard)
        }

        if (this.mouse === null) {
            this.mouse = new MyMouse(this)
            this.mouse.scale.set(0.12, 0.12, 0.12)
            this.mouse.position.set(0.7, 1.05, -3.3)
            this.app.scene.add(this.mouse)
        }

        if (this.lamp === null) {
            this.lamp = new MyLamp(this)
            this.lamp.scale.set(0.7, 0.7, 0.7)
            this.lamp.position.set(1.4, 1.05, -4)
            this.app.scene.add(this.lamp)
        }

        if (this.floorLamp === null) {
            this.floorLamp = new MyFloorLamp(this);
            this.floorLamp.position.set(4.1, 0, -0.7);
            this.app.scene.add(this.floorLamp);
        }

        if (this.floorLamp2 === null) {
            this.floorLamp2 = new MyFloorLamp(this);
            this.floorLamp2.position.set(0.8, 0, 4.1);
            this.app.scene.add(this.floorLamp2);
        }

        if (this.book === null) {
            this.book = new MyBook(this);
            this.book.scale.set(0.5, 0.5, 0.5);
            this.book.rotation.y = Math.PI/2;
            this.book.position.set(-4, 1.83, -4);
            this.app.scene.add(this.book);
        }

        if (this.book2 === null) {
            this.book2 = new MyBook(this, 0x5C4033);
            this.book2.scale.set(0.5, 0.5, 0.5);
            this.book2.rotation.y = Math.PI/2;
            this.book2.position.set(-3.918, 1.83, -4);
            this.app.scene.add(this.book2);
        }

        if (this.book3 === null) {
            this.book3 = new MyBook(this, 0x8B5A2B);
            this.book3.scale.set(0.5, 0.5, 0.5);
            this.book3.rotation.y = Math.PI/2;
            this.book3.position.set(-4.082, 1.83, -4);
            this.app.scene.add(this.book3);
        }

        if (this.book4 === null) {
            this.book4 = new MyBook(this, 0xA0522D);
            this.book4.scale.set(0.5, 0.5, 0.5);
            this.book4.rotation.y = Math.PI/2;
            this.book4.rotateX(-Math.PI/9);
            this.book4.position.set(-3.63, 1.83, -4);
            this.app.scene.add(this.book4);
        }

        if (this.book5 === null) {
            this.book5 = new MyBook(this, 0xC19A6B);
            this.book5.scale.set(0.5, 0.5, 0.5);
            this.book5.rotation.x = Math.PI/2;
            this.book5.rotateZ(Math.PI/4);
            this.book5.position.set(-3.2, 1.06, -4.3);
            this.app.scene.add(this.book5);
        }

        if (this.gamingChair === null) {
            this.gamingChair = new MyGamingChair(this, {
                accentColor: 0xff0066,  // Pink gaming accent
                seatWidth: 0.6,
                seatDepth: 0.5
            });
            this.gamingChair.position.set(-0.3, 0, -2.2); // Position at desk
            this.gamingChair.rotation.y = Math.PI - Math.PI / 4;
            this.gamingChair.scale.set(1.2, 1.2, 1.2);
            this.app.scene.add(this.gamingChair);
        }

        // sofa
        if (this.sofa === null) {
            this.sofa = new MySofa(this, { width: 4.5, depth: 1.6, height: 1.1, cushionHeight: 0.45, color: 0x0b0b0b, cushionColor: 0x1a1a1a, lShape: true, chaiseLength: 2.0, lSide: 'left' });

            this.sofa.position.set(3.5, 0.1, 2);
            this.sofa.rotation.y = Math.PI;
            this.app.scene.add(this.sofa);
        }

        // coffee table in front of sofa
        if (this.coffeeTable === null) {
            const topMat = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
            this.coffeeTable = new MyCoffeeTable(this, topMat);
            // position coffee table roughly centered in front of the sofa
            this.coffeeTable.position.set(1.5, 0.3, 1.4);
            this.coffeeTable.rotation.y = Math.PI/2;
            this.app.scene.add(this.coffeeTable);
        }

        if (this.tvTable === null) {
            const tableMat = new THREE.MeshPhongMaterial({ color: 0x8b5a2b });
            this.tvTable = new MyTVTable(this, tableMat);
            this.tvTable.position.set(-3.8, 0.4, 1.8);
            this.tvTable.rotation.y = Math.PI/2;
            this.app.scene.add(this.tvTable);
        }

        if (this.acousticFoam === null) {
            this.acousticFoam = new MyAcousticFoam(this, {
                wallWidth: 3.7,
                wallHeight: 3.5,
                triangleSize: 0.2,
                triangleHeight: 0.1,
                color: 0x444444,
                rows: 10,
                cols: 10
            });
            // Position it on one of your walls (e.g., back wall)
            this.acousticFoam.position.set(4.5, 2, -2.6);
            this.acousticFoam.rotation.y = -Math.PI / 2; // facing into the room
            this.app.scene.add(this.acousticFoam);
        }

        if (this.acousticFoam2 === null) {
            this.acousticFoam2 = new MyAcousticFoam(this, {
                wallWidth: 1.9,
                wallHeight: 3.5,
                triangleSize: 0.2,
                triangleHeight: 0.1,
                color: 0x444444,
                rows: 10,
                cols: 10
            });
            // Position it on one of your walls (e.g., back wall)
            this.acousticFoam2.position.set(3.5, 2, -4.5);
            this.app.scene.add(this.acousticFoam2);
        }

        if (this.window1 === null) {
            this.window1 = new MyWindow(this, "textures/landscape3.jpg", 50, 0.03);
            this.window1.position.set(-4.49, 1.75, -2);

            this.window1.rotation.y = Math.PI / 2; // facing into the room
            this.app.scene.add(this.window1);
        }

        if (this.window2 === null) {
            this.window2 = new MyWindow(this, "textures/landscape2.jpg", 15, 0.01);
            this.window2.position.set(3, 1.75, 4.49);

            this.window2.rotation.y = Math.PI;
            this.app.scene.add(this.window2);
        }


        if (this.tv === null) {
            this.tv = new MyTV(this, {
                screenWidth: 5,
                screenHeight: 2.8,
                depth: 0.08,
                frameWidth: 0.04,
                standWidth: 0.75,
                standHeight: 0.05,
                standDepth: 0.3,
                screenColor: 0x111111,
                frameColor: 0x2c2c2c,
                standColor: 0x1a1a1a
            });
            
            // Position TV on top of the TV table
            // TV table is at position (-4.3, 0.4, 2) with rotation Math.PI/2
            this.tv.position.set(-4, 0.48, 1.8); // On top of the table
            this.tv.rotation.y = Math.PI/2; // Match table rotation
            
            // Set TV to "on" state with dark blue screen
            
            this.app.scene.add(this.tv);
        }

        // carpet under sofa and coffee table
        if (this.carpet === null) {
            // choose a carpet texture; using uv_grid.jpg as a placeholder
            this.carpet = new MyCarpet(this);
            // position carpet roughly under sofa main seating area
            this.carpet.position.set(-1, 0, 2);
            this.carpet.rotation.y = Math.PI/2;
            this.app.scene.add(this.carpet);
        }

        // light bars
        if (this.lightBars.length === 0) {
            const barConfigs = [
                { x: 0, y: 0.05, z: -4.5, rotY: 0 },
                { x: 0, y: 0.05, z: 4.5,  rotY: 0 },
                { x: -4.5, y: 0.05, z: 0, rotY: Math.PI / 2 },
                { x: 4.5,  y: 0.05, z: 0, rotY: Math.PI / 2 },
                { x: 0, y: 4.5, z: -4.5, rotY: 0 },
                { x: 0, y: 4.5, z: 4.5,  rotY: 0 },
                { x: -4.5, y: 4.5, z: 0, rotY: Math.PI / 2 },
                { x: 4.5,  y: 4.5, z: 0, rotY: Math.PI / 2 },
            ];

            for (const cfg of barConfigs) {
                const bar = new MyLightBar(this, {
                    length: 9,
                    color: "#ff5c00", //#ff5c00 //#ff00f2
                    intensity: 5,
                    width: 0.1,
                    height: 0.1,
                });

                bar.position.set(cfg.x, cfg.y, cfg.z);

                // apply rotation
                bar.rotation.set(0, cfg.rotY, 0);

                this.app.scene.add(bar);
                this.lightBars.push(bar);
            }
        }

        ////////////////// OLD VERSION OF LIGHTS ////////////////////////
        // add a point light on top of the model
        // const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        // pointLight.position.set( 0, -20, 0 );
        // this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        // const sphereSize = 0.5;
        // const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        // this.app.scene.add( pointLightHelper );

        // add an ambient light
        // const ambientLight = new THREE.AmbientLight( 0x444444 );
        // this.app.scene.add( ambientLight );
        
        // add a directional light
        // const directionalLight = new THREE.DirectionalLight( 0xffffff, 5 );
        // directionalLight.position.set(5, 10, 2);
        // directionalLight.target.position.set(1, 0, 1);
        // this.app.scene.add( directionalLight );
        // this.app.scene.add( directionalLight.target );

        // const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, sphereSize );
        // this.app.scene.add( directionalLightHelper );

        // add a spot light
        // this.spotLight = new THREE.SpotLight( 
        //     this.spotLightColor, 
        //     this.spotLightIntensity, 
        //     this.spotLightDistance,
        //     THREE.MathUtils.degToRad(this.spotLightAngle),
        //     this.spotLightPenumbra,
        //     this.spotLightDecay
        // );
        // this.spotLight.position.set(5, this.spotLightPositionY, 2);
        // this.spotLight.target.position.set(1, this.spotLightTargetY, 1);
        // this.app.scene.add( this.spotLight );
        // this.app.scene.add( this.spotLight.target );
        
        // this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight, sphereSize );
        // this.app.scene.add( this.spotLightHelper );

        //////////////////////////////////////////////////

        
        // === AMBIENT LIGHT ===
        // Increase ambient light significantly for better visibility
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4); // Increased from 0.6 to 1.2
        this.app.scene.add(ambientLight);

        // === MAIN DIRECTIONAL LIGHT ===
        // Add strong directional light for overall scene illumination
        const mainLight = new THREE.DirectionalLight("#ffffff", 0.8); // Bright white light
        mainLight.position.set(5, 10, 5);
        mainLight.target.position.set(0, 0, 0);
        mainLight.castShadow = true;
        // this.app.scene.add(mainLight);
        // this.app.scene.add(mainLight.target);

        // === POINT LIGHTS ===
        // 1. Under coffee table - warm accent lighting
        const coffeeTableLight = new THREE.PointLight(0xff6b35, 3, 4); // Increased intensity
        coffeeTableLight.position.set(1.5, 0.1, 1.4);
        this.app.scene.add(coffeeTableLight);

        // 2. Behind TV - cool backlight effect
        const tvBacklight = new THREE.PointLight(0x00d4ff, 4, 5); // Increased intensity
        tvBacklight.position.set(-4.2, 0.6, 1.8);
        this.app.scene.add(tvBacklight);

        // 3. Behind sofa - warm mood lighting
        const sofaBacklight = new THREE.PointLight(0xffa500, 3, 4); // Increased intensity
        sofaBacklight.position.set(4.4, 0.8, 4.4);
        this.app.scene.add(sofaBacklight);

        // shelf
        const shelfLightPositions = [
            { x: -3.6, y: 0.15, z: -4 },  // Under bottom shelf
            { x: -3.6, y: 0.95, z: -4 },  // Under second shelf
            { x: -3.6, y: 1.75, z: -4 },  // Under third shelf
            { x: -3.6, y: 2.55, z: -4 },  // Under fourth shelf
            { x: -3.6, y: 3.35, z: -4 }   // Under top shelf
        ];

        for (const lightPos of shelfLightPositions) {
            const shelfLight = new THREE.PointLight(
                0xff6b35,    // Same warm orange color as coffee table
                2,           // Slightly less intensity than coffee table
                3,           // Good range for shelf lighting
                1            // Natural decay
            );
            
            shelfLight.position.set(lightPos.x, lightPos.y, lightPos.z);
            this.app.scene.add(shelfLight);
        }

        // === PURPLE ACCENT LIGHTING (Like in reference image) ===
        for (const lightBar of this.lightBars) {
            // Create purple point lights for accent lighting
            const purpleLight = new THREE.PointLight(
                "#ff5c00",    // Purple color
                8,           // High intensity for visibility
                6,           // Good range
                1            // Natural decay
            );
            
            purpleLight.position.copy(lightBar.position);
            this.app.scene.add(purpleLight);
            
            lightBar.userData.accentLight = purpleLight;
        }

        // === CEILING LIGHTS FOR GENERAL ILLUMINATION ===
        // Add ceiling lights to ensure everything is well-lit
        const ceilingLight1 = new THREE.PointLight(0xffffff, 5, 8);
        ceilingLight1.position.set(-2, 4, -2);
        this.app.scene.add(ceilingLight1);

        const ceilingLight2 = new THREE.PointLight(0xffffff, 5, 8);
        ceilingLight2.position.set(2, 4, 2);
        this.app.scene.add(ceilingLight2);

        // === SPOT LIGHT FOR TASK LIGHTING ===
        // musical area spotlight
        this.spotLight = new THREE.SpotLight(
            0xffffff,    // White light
            12,          // Higher intensity
            8,           // Increased distance
            THREE.MathUtils.degToRad(30), // Wider cone
            0.2,         // Sharp edges
            1            // Natural decay
        );
        this.spotLight.position.set(-2, 3.5, -3);
        this.spotLight.target.position.set(0, 1, -4);
        // this.app.scene.add(this.spotLight);
        // this.app.scene.add(this.spotLight.target);

        // === LIGHT HELPERS (Optional - remove for final version) ===
        const coffeeTableHelper = new THREE.PointLightHelper(coffeeTableLight, 0.2);
        this.app.scene.add(coffeeTableHelper);

        const tvBacklightHelper = new THREE.PointLightHelper(tvBacklight, 0.2);
        this.app.scene.add(tvBacklightHelper);

        const sofaBacklightHelper = new THREE.PointLightHelper(sofaBacklight, 0.2);
        this.app.scene.add(sofaBacklightHelper);

        const mainLightHelper = new THREE.DirectionalLightHelper(mainLight, 1);
        this.app.scene.add(mainLightHelper);

        // Purple accent light helpers
        for (const lightBar of this.lightBars) {
            if (lightBar.userData.accentLight) {
                const purpleHelper = new THREE.PointLightHelper(lightBar.userData.accentLight, 0.1);
                this.app.scene.add(purpleHelper);
            }
        }

        // Store helpers for management
        this.lightHelpers = [
            coffeeTableHelper,
            tvBacklightHelper,
            sofaBacklightHelper,
            mainLightHelper
        ];

        this.toggleLightHelpers(false);


        this.buildBox()
        
        // Create a Plane Mesh with basic material
        
        let plane = new THREE.PlaneGeometry( 9, 9 );
        this.planeMesh = new THREE.Mesh( plane, this.planeMaterial );
        this.planeMesh.rotation.x = -Math.PI / 2;
        this.planeMesh.position.y = -0;
        this.app.scene.add( this.planeMesh );
    }
    
    /**
     * updates the diffuse plane color and the material
     * @param {THREE.Color} value 
     */
    updateDiffusePlaneColor(value) {
        this.diffusePlaneColor = value
        this.planeMaterial.color.set(this.diffusePlaneColor)
    }
    /**
     * updates the specular plane color and the material
     * @param {THREE.Color} value 
     */
    updateSpecularPlaneColor(value) {
        this.specularPlaneColor = value
        this.planeMaterial.specular.set(this.specularPlaneColor)
    }
    /**
     * updates the plane shininess and the material
     * @param {number} value 
     */
    updatePlaneShininess(value) {
        this.planeShininess = value
        this.planeMaterial.shininess = this.planeShininess
    }

    /**
     * updates spotlight color
     * @param {string} value 
     */
    updateSpotLightColor(value) {
        this.spotLightColor = value;
        this.spotLight.color.set(this.spotLightColor);
    }

    /**
     * updates spotlight intensity
     * @param {number} value 
     */
    updateSpotLightIntensity(value) {
        this.spotLightIntensity = value;
        this.spotLight.intensity = this.spotLightIntensity;
    }

    /**
     * updates spotlight distance
     * @param {number} value 
     */
    updateSpotLightDistance(value) {
        this.spotLightDistance = value;
        this.spotLight.distance = this.spotLightDistance;
    }
    
    /**
     * updates spotlight angle
     * @param {number} value 
     */
    updateSpotLightAngle(value) {
        this.spotLightAngle = value;
        this.spotLight.angle = THREE.MathUtils.degToRad(this.spotLightAngle);
    }

    /**
     * updates spotlight penumbra
     * @param {number} value 
     */
    updateSpotLightPenumbra(value) {
        this.spotLightPenumbra = value;
        this.spotLight.penumbra = this.spotLightPenumbra;
    }

    /**
     * updates spotlight decay
     * @param {number} value 
     */
    updateSpotLightDecay(value) {
        this.spotLightDecay = value;
        this.spotLight.decay = this.spotLightDecay;
    }

    /**
     * updates spotlight position Y
     * @param {number} value 
     */
    updateSpotLightPositionY(value) {
        this.spotLightPositionY = value;
        this.spotLight.position.y = this.spotLightPositionY;
        this.spotLightHelper.update();
    }

    /**
     * updates spotlight target Y
     * @param {number} value 
     */
    updateSpotLightTargetY(value) {
        this.spotLightTargetY = value;
        this.spotLight.target.position.y = this.spotLightTargetY;
        this.spotLightHelper.update();
    }

    /**
     * updates spotlight visibility
     * @param {boolean} value 
     */
    updateSpotLightVisible(value) {
        this.spotLightVisible = value;
        this.spotLight.visible = this.spotLightVisible;
        this.spotLightHelper.visible = this.spotLightVisible;
    }

    /**
     * rebuilds the box mesh if required
     * this method is called from the gui interface
     */
    rebuildBox() {
        // remove boxMesh if exists
        if (this.boxMesh !== undefined && this.boxMesh !== null) {  
            this.app.scene.remove(this.boxMesh)
        }
        this.buildBox();
        this.lastBoxEnabled = null
    }
    
    /**
     * updates the box mesh if required
     * this method is called from the render method of the app
     * updates are trigered by boxEnabled property changes
     */
    updateBoxIfRequired() {
        if (this.boxEnabled !== this.lastBoxEnabled) {
            this.lastBoxEnabled = this.boxEnabled
            if (this.boxEnabled) {
                this.app.scene.add(this.boxMesh)
            }
            else {
                this.app.scene.remove(this.boxMesh)
            }
        }
    }

    updateTableIfRequired() {
        if (this.tableEnabled !== this.lastTableEnabled) {
            this.lastTableEnabled = this.tableEnabled
            if (this.tableEnabled) {
                this.app.scene.add(this.table)
            }
            else {
                this.app.scene.remove(this.table)
            }
        }
    }

    updateWallsIfRequired() {
        if (this.wallsEnabled !== this.lastWallsEnabled) {
            this.lastWallsEnabled = this.wallsEnabled
            if (this.wallsEnabled) {
                this.app.scene.add(this.walls)
            }
            else {
                this.app.scene.remove(this.walls)
            }
        }
    }

    updateObjIfRequired() {
        if (this.objEnabled !== this.lastObjEnabled) {
            this.lastObjEnabled = this.objEnabled
            if (this.objEnabled) {
                this.app.scene.add(this.obj)
            }
            else {
                this.app.scene.remove(this.obj)
            }
        }
    }

    updateSofaIfRequired() {
        if (this.sofaEnabled !== this.lastSofaEnabled) {
            this.lastSofaEnabled = this.sofaEnabled
            if (this.sofaEnabled) {
                this.app.scene.add(this.sofa)
            }
            else {
                this.app.scene.remove(this.sofa)
            }
        }
    }
    
    /**
     * updates the contents
     * this method is called from the render method of the app
     * 
     */
    update() {
        // check if box mesh needs to be updated
        this.updateBoxIfRequired()

        this.updateTableIfRequired()

        this.updateWallsIfRequired()

        this.updateObjIfRequired()

        this.updateSofaIfRequired()

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
        
    }


    toggleLightHelpers(visible) {
        if (this.lightHelpers && this.lightHelpers.length > 0) {
            this.lightHelpers.forEach(helper => {
                helper.visible = visible;
            });
        }
        
        // Also toggle the spotlight helper if it exists
        if (this.spotLightHelper) {
            this.spotLightHelper.visible = visible;
        }
    }

}


export { MyContents };