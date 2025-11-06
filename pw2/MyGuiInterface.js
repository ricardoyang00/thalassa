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
        this.contents = contents;
    }

    /**
     * Initialize the gui interface
     */
    init() {
        // adds a folder to the gui interface for the camera
        const cameraFolder = this.datgui.addFolder('Camera')
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Fly', 'SubmarineFPV', 'Left', 'Top', 'Front' ] ).name("active camera");
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

        cameraFolder.close()


        const renderFolder = this.datgui.addFolder('Rendering')
        renderFolder.add(this.app, 'wireframeMode', false).name("Wireframe Mode").onChange( (value) => { this.app.setWireframeMode(value) } );
        renderFolder.close()

        const rocksFolder = this.datgui.addFolder('Rocks');
        rocksFolder.add(this.contents.rocks, 'visible').name("Show Rocks");
        rocksFolder.close();

        const coralsFolder = this.datgui.addFolder('Corals');
        coralsFolder.add(this.contents.corals, 'visible').name('Show Corals');
        coralsFolder.close();

        const fishesFolder = this.datgui.addFolder('Fishes');
        fishesFolder.add(this.contents, 'showFish', true).name("Show Fishes").onChange((value) => {
            this.contents.toggleFish(value);
        });
        const initialScale = (this.contents && this.contents.fishGroup) ? this.contents.fishGroup.scale.x : 1;
        const fishParams = { scale: initialScale };
        fishesFolder.add(fishParams, 'scale', 0.1, 3, 0.01).name('Scale').onChange((value) => {
            if (this.contents) this.contents.setFishesScale(value);
        });
        fishesFolder.close();

        if (this.contents.flocks && this.contents.flocks.length > 0) {
            const defaultOpts = this.contents.flocks[0].opt;
            const flockParams = {
                alignmentWeight: defaultOpts.alignmentWeight,
                cohesionWeight: defaultOpts.cohesionWeight,
                separationWeight: defaultOpts.separationWeight,
                maxSpeed: defaultOpts.maxSpeed,
                maxForce: defaultOpts.maxForce,
                neighborRadius: defaultOpts.neighborRadius,
                separationRadius: defaultOpts.separationRadius,
                wanderIntensity: defaultOpts.wanderIntensity,
                avoidanceRadius: defaultOpts.avoidanceRadius,
                avoidanceWeight: defaultOpts.avoidanceWeight,
            };

            const flockFolder = this.datgui.addFolder('Flocking Controls');
            
            // helper function to update all flocks when a slider changes
            const updateAllFlocks = (paramName, value) => {
                this.contents.flocks.forEach(flock => {
                    flock.opt[paramName] = value;
                });
            };

            flockFolder.add(flockParams, 'alignmentWeight', 0.0, 5.0).name('Alignment').onChange(v => updateAllFlocks('alignmentWeight', v));
            flockFolder.add(flockParams, 'cohesionWeight', 0.0, 5.0).name('Cohesion').onChange(v => updateAllFlocks('cohesionWeight', v));
            flockFolder.add(flockParams, 'separationWeight', 0.0, 5.0).name('Separation').onChange(v => updateAllFlocks('separationWeight', v));
            flockFolder.add(flockParams, 'maxSpeed', 1.0, 10.0).name('Max Speed').onChange(v => updateAllFlocks('maxSpeed', v));
            flockFolder.add(flockParams, 'maxForce', 0.1, 10.0).name('Max Force (Turn)').onChange(v => updateAllFlocks('maxForce', v));
            flockFolder.add(flockParams, 'neighborRadius', 1.0, 20.0).name('Neighbor Radius').onChange(v => updateAllFlocks('neighborRadius', v));
            flockFolder.add(flockParams, 'separationRadius', 0.1, 10.0).name('Separation Radius').onChange(v => updateAllFlocks('separationRadius', v));
            flockFolder.add(flockParams, 'wanderIntensity', 0.0, 2.0).name('Wander').onChange(v => updateAllFlocks('wanderIntensity', v));
            
            const avoidanceFolder = flockFolder.addFolder('Danger Avoidance');
            avoidanceFolder.add(flockParams, 'avoidanceRadius', 1.0, 30.0).name('Avoid Radius').onChange(v => updateAllFlocks('avoidanceRadius', v));
            avoidanceFolder.add(flockParams, 'avoidanceWeight', 0.0, 10.0).name('Avoid Force').onChange(v => updateAllFlocks('avoidanceWeight', v));
            avoidanceFolder.close();

            flockFolder.close();
        }
    }
}

export { MyGuiInterface };