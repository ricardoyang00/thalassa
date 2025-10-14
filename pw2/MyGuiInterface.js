import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { MyApp } from './MyApp.js';
import { MyContents } from './MyContents.js';
import { SgiUtils } from './SgiUtils.js';

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
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Fly', 'Left', 'Top', 'Front' ] ).name("active camera");
        // note that we are using a property from the app 
        cameraFolder.add(this.app.activeCamera.position, 'x', 0, 10).name("x coord")
        
        // Add fly camera controls
        const flyCameraFolder = cameraFolder.addFolder('Fly Camera Controls')
        
        // Movement speed control
        const flySettings = {
            movementSpeed: 5.0,
            rollSpeed: 1.0
        };
        
        flyCameraFolder.add(flySettings, 'movementSpeed', 0.1, 20.0).name("Movement Speed").onChange((value) => {
            if (this.app.flyControls !== null) {
                this.app.flyControls.movementSpeed = value;
            }
        });
        
        flyCameraFolder.add(flySettings, 'rollSpeed', 0.1, 2.0).name("Mouse Sensitivity").onChange((value) => {
            if (this.app.flyControls !== null) {
                this.app.flyControls.rollwSpeed = value;
            }
        });
        
        flyCameraFolder.add({ info: 'WASD - Move around' }, 'info').name('Controls').disable();
        flyCameraFolder.add({ info2: 'QE - Rotate' }, 'info2').name('').disable();
        flyCameraFolder.add({ info3: 'RF - Up/Down' }, 'info3').name('').disable();
        flyCameraFolder.add({ info4: 'Drag Mouse - Look around' }, 'info4').name('').disable();

        cameraFolder.open()


        const renderFolder = this.datgui.addFolder('Rendering')
        renderFolder.add(this.app, 'wireframeMode', false).name("Wireframe Mode").onChange( (value) => { this.app.setWireframeMode(value) } );
        renderFolder.open()

        const rocksFolder = this.datgui.addFolder('Rocks');
        rocksFolder.add(this.contents.rocks, 'visible').name("Show Rocks");
        rocksFolder.open();
    }
}

export { MyGuiInterface };