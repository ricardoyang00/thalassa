import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';

/**
    This class customizes the gui interface for the app
*/
class MyGuiInterface  {

    /**
     * 
     * @param {MyApp} app The application object 
     */
    constructor(app) {
        this.app = app
        this.datgui =  new GUI();
        this.contents = null
    }

    /**
     * Set the contents object
     * @param {MyContents} contents the contents objects 
     */
    setContents(contents) {
        this.contents = contents
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // // add a folder to the gui interface for the box
        // const boxFolder = this.datgui.addFolder( 'Box' );
        // // note that we are using a property from the contents object 
        // boxFolder.add(this.contents, 'boxMeshSize', 0, 10).name("size").onChange( () => { this.contents.rebuildBox() } );
        // boxFolder.add(this.contents, 'boxEnabled', true).name("enabled");
        // boxFolder.add(this.contents.boxDisplacement, 'x', -5, 5)
        // boxFolder.add(this.contents.boxDisplacement, 'y', -5, 5)
        // boxFolder.add(this.contents.boxDisplacement, 'z', -5, 5)
        // boxFolder.open()

        // const tableFolder = this.datgui.addFolder( 'Table' );
        // tableFolder.add(this.contents, 'tableEnabled', true).name("enabled");
        // tableFolder.open()

        const wallsFolder = this.datgui.addFolder( 'Walls' );
        wallsFolder.add(this.contents, 'wallsEnabled', true).name("enabled");
        wallsFolder.open()
        
        // const objFolder = this.datgui.addFolder( 'Objects' );
        // objFolder.add(this.contents, 'objEnabled', true).name("enabled");
        // objFolder.open()

        const data = {  
            'diffuse color': this.contents.diffusePlaneColor,
            'specular color': this.contents.specularPlaneColor,
        };

        // adds a folder to the gui interface for the plane
        // const planeFolder = this.datgui.addFolder( 'Plane' );
        // planeFolder.addColor( data, 'diffuse color' ).onChange( (value) => { this.contents.updateDiffusePlaneColor(value) } );
        // planeFolder.addColor( data, 'specular color' ).onChange( (value) => { this.contents.updateSpecularPlaneColor(value) } );
        // planeFolder.add(this.contents, 'planeShininess', 0, 1000).name("shininess").onChange( (value) => { this.contents.updatePlaneShininess(value) } );
        // planeFolder.close();

        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Perspective2', 'Right', 'Left', 'Top', 'Front', 'Back' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        cameraFolder.open()

        // // adds a folder to the gui interface for the spot light
        // const spotLightFolder = this.datgui.addFolder('Spotlight');
        // const spotLightData = {
        //     'color': this.contents.spotLightColor
        // };

        // spotLightFolder.addColor(spotLightData, 'color').onChange((value) => { this.contents.updateSpotLightColor(value)});
        // spotLightFolder.add(this.contents, 'spotLightIntensity', 0, 100).name("intensity").onChange((value) => {this.contents.updateSpotLightIntensity(value)});
        // spotLightFolder.add(this.contents, 'spotLightDistance', 0, 100).name("distance").onChange((value) => {this.contents.updateSpotLightDistance(value)});
        // spotLightFolder.add(this.contents, 'spotLightAngle', 0, 90).name("angle (degrees)").onChange((value) => {this.contents.updateSpotLightAngle(value)});        
        // spotLightFolder.add(this.contents, 'spotLightPenumbra', 0, 1).name("penumbra").onChange((value) => {this.contents.updateSpotLightPenumbra(value)});
        // spotLightFolder.add(this.contents, 'spotLightDecay', 0, 2).name("decay").onChange((value) => {this.contents.updateSpotLightDecay(value)});
        // spotLightFolder.add(this.contents, 'spotLightPositionY', 0, 20).name("position Y").onChange((value) => {this.contents.updateSpotLightPositionY(value)});
        // spotLightFolder.add(this.contents, 'spotLightTargetY', -10, 7.5).name("target Y").onChange((value) => {this.contents.updateSpotLightTargetY(value)});
        // spotLightFolder.add(this.contents, 'spotLightVisible').name("visible").onChange((value) => {this.contents.updateSpotLightVisible(value)});
        // spotLightFolder.open();


        // // adds a folder to the gui interface for the wrap mode
        // const wrapFolder = this.datgui.addFolder('Wrap mode');
        // wrapFolder.add(
        //     { mode: 'ClampToEdge' },
        //     'mode',
        //     { 'Clamp to Edge': 'ClampToEdge', 'Repeat': 'Repeat' }
        // ).name('Wall Wrap Mode').onChange((value) => {
        //     if (this.contents && this.contents.walls && this.contents.walls.setWrapMode) {
        //         this.contents.walls.setWrapMode(value);
        //     }
        // });
        // wrapFolder.open();
        
        const lightsFolder = this.datgui.addFolder('Lights Control');
        
        // Master toggle for all lights
        lightsFolder.add(this.contents.lightsEnabled, 'all')
            .name('All Lights')
            .onChange((value) => { 
                this.contents.toggleAllLights(value);
                this.updateLightControllers();
            });

        // Store references to individual light controllers
        this.lightControllers = {};

        const sceneLightFolder = lightsFolder.addFolder('Scene Light');
        sceneLightFolder.add(this.contents, 'sceneLightIntensity', 0, 2)
            .name('Intensity')
            .onChange((value) => { this.contents.updateSceneLightIntensity(value) });
        
        this.lightControllers.scene = sceneLightFolder.add(this.contents.lightsEnabled, 'sceneLight')
            .name('Enabled')
            .onChange((value) => { this.contents.toggleLightGroup('sceneLight', value) });
        
        sceneLightFolder.open();

        // Individual light controls
        // this.lightControllers.ceiling1 = lightsFolder.add(this.contents.lightsEnabled, 'ceiling1')
        //     .name('Ceiling Light 1')
        //     .onChange((value) => { this.contents.toggleLightGroup('ceiling1', value) });

        // this.lightControllers.ceiling2 = lightsFolder.add(this.contents.lightsEnabled, 'ceiling2')
        //     .name('Ceiling Light 2')
        //     .onChange((value) => { this.contents.toggleLightGroup('ceiling2', value) });

        this.lightControllers.coffeeTable = lightsFolder.add(this.contents.lightsEnabled, 'coffeeTable')
            .name('Coffee Table Light')
            .onChange((value) => { this.contents.toggleLightGroup('coffeeTable', value) });

        this.lightControllers.floorLamp1 = lightsFolder.add(this.contents.lightsEnabled, 'floorLamp1')
            .name('Floor Lamp 1')
            .onChange((value) => { this.contents.toggleLightGroup('floorLamp1', value) });

        this.lightControllers.floorLamp2 = lightsFolder.add(this.contents.lightsEnabled, 'floorLamp2')
            .name('Floor Lamp 2')
            .onChange((value) => { this.contents.toggleLightGroup('floorLamp2', value) });

        this.lightControllers.lightBars = lightsFolder.add(this.contents.lightsEnabled, 'lightBars')
            .name('Light Bars')
            .onChange((value) => { this.contents.toggleLightGroup('lightBars', value) });
        
        this.lightControllers.lightWall = lightsFolder.add(this.contents.lightsEnabled, 'lightWall')
            .name('Light Wall')
            .onChange((value) => { this.contents.toggleLightGroup('lightWall', value) });

        this.lightControllers.monitorScreen = lightsFolder.add(this.contents.lightsEnabled, 'monitorScreen')
            .name('Monitor Screen')
            .onChange((value) => { this.contents.toggleLightGroup('monitorScreen', value) });

        this.lightControllers.icons = lightsFolder.add(this.contents.lightsEnabled, 'icons')
            .name('PS Icons')
            .onChange((value) => { this.contents.toggleLightGroup('icons', value) });

        this.lightControllers.shelf = lightsFolder.add(this.contents.lightsEnabled, 'shelf')
            .name('Shelf Lights')
            .onChange((value) => { this.contents.toggleLightGroup('shelf', value) });

        this.lightControllers.sofaBacklight = lightsFolder.add(this.contents.lightsEnabled, 'sofaBacklight')
            .name('Sofa Backlight')
            .onChange((value) => { this.contents.toggleLightGroup('sofaBacklight', value) });

        this.lightControllers.tableLamp = lightsFolder.add(this.contents.lightsEnabled, 'tableLamp')
            .name('Table Lamp')
            .onChange((value) => { this.contents.toggleLightGroup('tableLamp', value) });

        this.lightControllers.pictureSpots = lightsFolder.add(this.contents.lightsEnabled, 'pictureSpots')
            .name('Picture Spots')
            .onChange((value) => { this.contents.toggleLightGroup('pictureSpots', value) });

        this.lightControllers.tvBacklight = lightsFolder.add(this.contents.lightsEnabled, 'tvBacklight')
            .name('TV Backlight')
            .onChange((value) => { this.contents.toggleLightGroup('tvBacklight', value) });

        this.lightControllers.tvScreen = lightsFolder.add(this.contents.lightsEnabled, 'tvScreen')
            .name('TV Screen')
            .onChange((value) => { this.contents.toggleLightGroup('tvScreen', value) });


        const helpersFolder = lightsFolder.addFolder('Light Helpers');
    
        helpersFolder.add(this.contents.helpersVisible, 'directional')
            .name('Directional Helpers')
            .onChange((value) => { this.contents.toggleDirectionalHelpers(value) });
        
        helpersFolder.add(this.contents.helpersVisible, 'point')
            .name('Point Light Helpers')
            .onChange((value) => { this.contents.togglePointHelpers(value) });
        
        helpersFolder.add(this.contents.helpersVisible, 'spot')
            .name('Spot Light Helpers')
            .onChange((value) => { this.contents.toggleSpotHelpers(value) });

        lightsFolder.open();
    }

    updateLightControllers() {
        Object.keys(this.lightControllers).forEach(key => {
            this.lightControllers[key].updateDisplay();
        });
    }
}

export { MyGuiInterface };