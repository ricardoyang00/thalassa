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
        cameraFolder.add(this.app, 'activeCameraName', [ 'Perspective', 'Fly', 'SubmarineFPV', 'SubmarinePeriscope', 'Left', 'Top', 'Front' ] ).name("active camera");
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

        const dofFolder = cameraFolder.addFolder('Depth of Field (Fly Mode)');

        if (this.app.postProcessingParams) {
            dofFolder.add(this.app.postProcessingParams, 'focus', 1.0, 300.0).name('Focus Distance').onChange((value) => {
                this.app.updateBokehParams(this.app.postProcessingParams.aperture, value, this.app.postProcessingParams.maxblur);
            });

            dofFolder.add(this.app.postProcessingParams, 'aperture', 0, 0.05, 0.001).name('Aperture (Blur)').onChange((value) => {
                this.app.updateBokehParams(value, this.app.postProcessingParams.focus, this.app.postProcessingParams.maxblur);
            });

            dofFolder.add(this.app.postProcessingParams, 'maxblur', 0.0, 0.1, 0.001).name('Max Blur').onChange((value) => {
                this.app.updateBokehParams(this.app.postProcessingParams.aperture, this.app.postProcessingParams.focus, value);
            });
        }
        dofFolder.open();
        
        cameraFolder.close()


        const renderFolder = this.datgui.addFolder('Rendering')
        renderFolder.add(this.app, 'wireframeMode', false).name("Wireframe Mode").onChange( (value) => { this.app.setWireframeMode(value) } );
        renderFolder.close()

        const submarineFolder = this.datgui.addFolder('Submarine Lights');
        const submarine = this.contents.submarine;

        // const submarineOpt = {
        //     showBVH: false,
        //     showBoundingSphere: false,
        // };
        // submarineFolder.add(submarineOpt, 'showBVH').name("Show BVH").onChange((val) => {
        //     if (this.contents.submarine.bvhhelper) {
        //         this.contents.submarine.bvhhelper.visible = val;
        //     }
        // });
        // submarineFolder.add(submarineOpt, 'showBoundingSphere').name('Show Bounding Sphere').onChange((val) => {
        //     if (this.contents.submarine.boundingSphereHelper)
        //         this.contents.submarine.boundingSphereHelper.visible = val;
        // });
        
        if (submarine && submarine.frontLight) {
            const frontLightFolder = submarineFolder.addFolder('Front Light');
            
            // Front light color control
            const frontLightParams = {
                color: submarine.frontLight.color.getHex(),
                intensity: submarine.frontLight.intensity,
                decay: submarine.frontLight.decay
            };
            
            frontLightFolder.addColor(frontLightParams, 'color').name('Color').onChange(value => {
                submarine.frontLight.color.setHex(value);
            });
            
            frontLightFolder.add(frontLightParams, 'intensity', 0, 3000, 100).name('Intensity').onChange(value => {
                submarine.frontLight.intensity = value;
            });
            
            frontLightFolder.add(frontLightParams, 'decay', 0.5, 5, 0.1).name('Attenuation (Decay)').onChange(value => {
                submarine.frontLight.decay = value;
            });
            
            frontLightFolder.close();
        }
        
        if (submarine && submarine.periscopeLight) {
            const periscopeLightFolder = submarineFolder.addFolder('Warning Light');
            
            // Periscope light flash controls
            const periscopeLightParams = {
                intensity: submarine.periscopeLightIntensity,
                flashCycle: submarine._flashCycle,
                flashOn: submarine._flashOn
            };
            
            periscopeLightFolder.add(periscopeLightParams, 'intensity', 500, 3000, 100).name('Intensity').onChange(value => {
                submarine.periscopeLightIntensity = value;
            });
            
            periscopeLightFolder.add(periscopeLightParams, 'flashCycle', 0.2, 2.0, 0.1).name('Flash Cycle').onChange(value => {
                submarine._flashCycle = value;
            });
            
            periscopeLightFolder.add(periscopeLightParams, 'flashOn', 0.05, 1.0, 0.05).name('Flash On Duration').onChange(value => {
                submarine._flashOn = value;
            });
            
            periscopeLightFolder.close();
        }
        
        submarineFolder.close();

        // Shield controls
        const shieldFolder = this.datgui.addFolder('Submarine Shield');

        if (submarine) {
            const shieldParams = {
                active: submarine.shieldActive,
                color: submarine.shieldColor.getHex(),
                opacity: submarine.shieldOpacity
            };

            shieldFolder.add(shieldParams, 'active').name('Activate Shield').onChange(value => {
                submarine.setShieldActive(value);
            });

            shieldFolder.addColor(shieldParams, 'color').name('Shield Color').onChange(value => {
                submarine.shieldColor.setHex(value);
                if (submarine.shieldMesh && submarine.shieldMesh.material.uniforms) {
                    submarine.shieldMesh.material.uniforms.uShieldColor.value.setHex(value);
                }
            });

            shieldFolder.add(shieldParams, 'opacity', 0.0, 1.0, 0.05).name('Glow Opacity').onChange(value => {
                submarine.shieldOpacity = value;
                if (submarine.shieldMesh && submarine.shieldMesh.material.uniforms) {
                    submarine.shieldMesh.material.uniforms.uOpacity.value = value;
                }
            });

            shieldFolder.close();
        }

        const rocksFolder = this.datgui.addFolder('Rocks');
        rocksFolder.add(this.contents.rocks, 'visible').name("Show Rocks");
        rocksFolder.close();

        const coralOpt = {
            castShadow: true,
            receiveShadow: true,
        };
        const coralsFolder = this.datgui.addFolder('Corals');
        coralsFolder.add(this.contents.coralMeshes, 'visible').name('Show Corals');
        coralsFolder.add(this.contents.coralsBVHHelper, 'visible').name('Show BVH');
        coralsFolder.add(coralOpt, 'castShadow').name('Cast Shadows').onChange((value) => {
            this.contents.coralMeshes?.traverse(child => {
                if (child.isMesh)
                    child.castShadow = value;
            })
        });
        coralsFolder.add(coralOpt, 'receiveShadow').name('Receive Shadows').onChange((value) => {
            this.contents.coralMeshes?.traverse(child => {
                if (child.isMesh)
                    child.receiveShadow = value;
            })
        });
        if (this.contents.bubble) {
            const coralBubblesFolder = coralsFolder.addFolder('Coral Bubbles');
            coralBubblesFolder.add(this.contents, 'coralBubblesEnabled').name('Spawn Bubbles');
            coralBubblesFolder.add(this.contents.bubble, 'lodEnabled').name('Enable LOD').onChange(value => {
                if (!value) {
                    const iEffectiveCount = this.contents.bubble.mesh.geometry.getAttribute("iEffectiveCount");
                    iEffectiveCount.array.forEach((_, i, arr) => arr[i] = this.contents.bubble.instanceParticleCount);
                    iEffectiveCount.needsUpdate = true;
                }
            });
            coralBubblesFolder.add(this.contents.bubble, 'lodDistance').name('LOD Threshold');
            coralBubblesFolder.add(this.contents.bubble, 'lodMultiplier').name('LOD Multiplier');
        }
        coralsFolder.close();

        // // Bubble LOD indicator
        // if (this.contents && typeof this.contents.bubbleLodEnabled !== 'undefined') {
        //     const bubbleLodObj = { Bubble_LOD: this.contents.bubbleLodEnabled ? 'ON' : 'OFF' };
        //     const lodController = this.datgui.add(bubbleLodObj, 'Bubble_LOD').name('Bubble LOD').listen();
        //     // Keep it in sync by polling the contents flag each second
        //     setInterval(() => {
        //         lodController.object.Bubble_LOD = this.contents.bubbleLodEnabled ? 'ON' : 'OFF';
        //         lodController.updateDisplay();
        //     }, 800);
        // }

        const fishesFolder = this.datgui.addFolder('Fishes');
        fishesFolder.add(this.contents.allFishMesh, 'visible').name('Show Fishes');
        fishesFolder.add(this.contents.fishBVHHelper, 'visible').name('Show BVH');
        const fishParams = {scale: this.contents.fishScale};
        fishesFolder.add(fishParams, 'scale', 0.05, 0.5, 0.01).name('Scale').onChange((value) => {
            this.contents.setFishesScale(value);
        });
        fishesFolder.close();

        const templeFolder = this.datgui.addFolder('Temple');
        templeFolder.add(this.contents.templeBVHHelper, 'visible').name('Show BVH');
        templeFolder.add(this.contents.templeBVHHelper, 'depth', 1, 20, 1).name('BVH Helper Depth').onChange(() => {
            this.contents.templeBVHHelper.update();
        });
        templeFolder.close();

        if (this.contents.flocks && this.contents.flocks[0]?.opt) {
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

            this.datgui.add(SgiUtils, 'debug').name('Debug');
        }

        // Exclusion Zones Controls
        if (this.contents && this.contents.seafloorGroup) {
            const exclusionZonesFolder = this.datgui.addFolder('Exclusion Zones');
            
            // Find the debug group
            const debugGroup = this.contents.seafloorGroup.getObjectByName('exclusionZoneDebug');
            
            if (debugGroup) {
                // Set to hidden by default
                debugGroup.visible = false;
                
                // Toggle visibility
                exclusionZonesFolder.add(debugGroup, 'visible').name('Show Zones');
                
                // Control opacity
                const opacityControl = {
                    opacity: 0.3
                };
                
                exclusionZonesFolder.add(opacityControl, 'opacity', 0, 1, 0.1).name('Opacity').onChange(value => {
                    debugGroup.traverse(child => {
                        if (child.isMesh && child.material) {
                            child.material.opacity = value;
                        }
                    });
                });
                
                // Control color
                const colorControl = {
                    color: 0xff0000
                };
                
                exclusionZonesFolder.addColor(colorControl, 'color').name('Color').onChange(value => {
                    debugGroup.traverse(child => {
                        if (child.isMesh && child.material) {
                            child.material.color.setHex(value);
                            child.material.emissive.setHex(value);
                        }
                    });
                });
            }
            
            exclusionZonesFolder.close();
        }
    }
}

export { MyGuiInterface };