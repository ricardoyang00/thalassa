
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { FlyControls } from 'three/addons/controls/FlyControls.js';
import { MyContents } from './MyContents.js';
import { MyGuiInterface } from './MyGuiInterface.js';
import Stats from 'three/addons/libs/stats.module.js'
// DOF Post-Processing
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { BokehPass } from 'three/addons/postprocessing/BokehPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
// Periscope HUD shader
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { createPeriscopeShader, createScratchesTexture, createCrosshairTexture } from './shaders/PeriscopeShader.js';
import { createFPVShader } from './shaders/FPVShader.js';

/**
 * This class contains the application object
 */
class MyApp  {
    /**
     * the constructor
     */
    constructor() {
        this.scene = null
        this.stats = null

        // camera related attributes
        this.activeCamera = null
        this.activeCameraName = null
        this.lastCameraName = null
        this.cameras = []
        this.frustumSize = 20

        // other attributes
        this.renderer = null
        this.controls = null
        this.flyControls = null
        this.clock = new THREE.Clock()
        this.gui = null
        this.axis = null
        this.contents == null
        
        // Initial fly camera position for reset
        this.flyCameraInitialPosition = new THREE.Vector3(5, 5, 5)
        this.flyCameraInitialTarget = new THREE.Vector3(0, 0, 0)

        this.wireframeMode = false

        // DOF Post-Processing
        this.composer = null;
        this.bokehPass = null;
        this.postProcessingParams = {
            focus: 1.0,
            aperture: 0.005,
            maxblur: 0.005
        };

        // Periscope HUD
        this.periscopeComposer = null;
        this.periscopePass = null;

        // FPV Control Panel Overlay
        this.fpvOverlay = null;
        this.fpvVideoElement = null;

        // Time freeze/pause feature
        this.timeFrozen = false;
    }

    /**
     * initializes the application
     */
    init() {
                
        // Create an empty scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color( 0x101010 );

        this.stats = new Stats()
        this.stats.showPanel(1) // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom)

        this.initCameras();
        this.setActiveCamera('Perspective')

        // Create a renderer with Antialiasing
        this.renderer = new THREE.WebGLRenderer({antialias:true});
        this.renderer.setPixelRatio( window.devicePixelRatio );
        this.renderer.setClearColor("#000000");

        // Configure renderer size
        this.renderer.setSize( window.innerWidth, window.innerHeight );

        // Append Renderer to DOM
        document.getElementById("canvas").appendChild( this.renderer.domElement );

        // manage window resizes
        window.addEventListener('resize', this.onResize.bind(this), false );

        // INIT POST PROCESSING
        this.initPostProcessing();
    }

    /**
     * initializes all the cameras
     */
    initCameras() {
        const aspect = window.innerWidth / window.innerHeight;

        // Create a basic perspective camera
        const perspective1 = new THREE.PerspectiveCamera( 75, aspect, 0.1, 85 )
        perspective1.position.set(23.5, 12, 9.6)
        perspective1.lookAt(new THREE.Vector3(0,0,0))
        this.cameras['Perspective'] = perspective1

        // Create a free fly camera (another perspective camera)
        const flyCamera = new THREE.PerspectiveCamera( 75, aspect, 0.1, 1000 )
        flyCamera.position.set(23.5, 12, 9.6)
        flyCamera.lookAt(0, 0, 0)
        this.cameras['Fly'] = flyCamera

        // defines the frustum size for the orthographic cameras
        const left = -this.frustumSize / 2 * aspect
        const right = this.frustumSize /2 * aspect 
        const top = this.frustumSize / 2 
        const bottom = -this.frustumSize / 2
        const near = -this.frustumSize /2
        const far =  this.frustumSize

        // create a left view orthographic camera
        const orthoLeft = new THREE.OrthographicCamera( left, right, top, bottom, near, far);
        orthoLeft.up = new THREE.Vector3(0,1,0);
        orthoLeft.position.set(-this.frustumSize /4,0,0) 
        orthoLeft.lookAt( new THREE.Vector3(0,0,0) );
        this.cameras['Left'] = orthoLeft

        // create a top view orthographic camera
        const orthoTop = new THREE.OrthographicCamera( left, right, top, bottom, near, far);
        orthoTop.up = new THREE.Vector3(0,0,1);
        orthoTop.position.set(0, this.frustumSize /4, 0) 
        orthoTop.lookAt( new THREE.Vector3(0,0,0) );
        this.cameras['Top'] = orthoTop

        // create a front view orthographic camera
        const orthoFront = new THREE.OrthographicCamera( left, right, top, bottom, near, far);
        orthoFront.up = new THREE.Vector3(0,1,0);
        orthoFront.position.set(0,0, this.frustumSize /4) 
        orthoFront.lookAt( new THREE.Vector3(0,0,0) );
        this.cameras['Front'] = orthoFront
    }

    /**
     * Initializes the EffectComposer and BokehPass for the Fly Camera
     */
    initPostProcessing() {
        // We use the 'Fly' camera specifically for the Bokeh pass
        const flyCamera = this.cameras['Fly'];

        this.composer = new EffectComposer(this.renderer);
        
        // Render Pass (Basic Scene Render)
        const renderPass = new RenderPass(this.scene, flyCamera);
        this.composer.addPass(renderPass);
        // Bokeh Pass (Depth of Field)
        this.bokehPass = new BokehPass(this.scene, flyCamera, {
            focus: this.postProcessingParams.focus,
            aperture: this.postProcessingParams.aperture,
            maxblur: this.postProcessingParams.maxblur,
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.composer.addPass(this.bokehPass);

        // Output Pass (Fixes the darkness/color space)
        const outputPass = new OutputPass();
        this.composer.addPass(outputPass);
    }

    /**
     * Initializes the EffectComposer for Periscope HUD
     */
    initPeriscopePostProcessing() {
        if (!this.cameras['SubmarinePeriscope']) {
            console.warn('Periscope camera not found');
            return;
        }

        this.periscopeComposer = new EffectComposer(this.renderer);
        this.periscopeComposer.addPass(new RenderPass(this.scene, this.cameras['SubmarinePeriscope']));

        // Add Bokeh Pass (Depth of Field) for periscope
        const bokehPass = new BokehPass(this.scene, this.cameras['SubmarinePeriscope'], {
            focus: 10.0,
            aperture: 0.0005,
            maxblur: 0.001,
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.periscopeComposer.addPass(bokehPass);

        const periscopeShader = createPeriscopeShader();
        
        const scratchesTexture = createScratchesTexture();
        const crosshairTexture = createCrosshairTexture();
        
        // Load coordinates spritesheet
        const textureLoader = new THREE.TextureLoader();
        const coordinatesTexture = textureLoader.load('images/coordinates.png');
        coordinatesTexture.magFilter = THREE.NearestFilter;
        coordinatesTexture.minFilter = THREE.NearestFilter;

        // Set up shader uniforms
        periscopeShader.uniforms.tScratchesNoise = { value: scratchesTexture };
        periscopeShader.uniforms.tCrosshair = { value: crosshairTexture };
        periscopeShader.uniforms.tCoordinates = { value: coordinatesTexture };
        periscopeShader.uniforms.uTint = { value: new THREE.Vector3(0.7, 0.9, 0.4) };
        periscopeShader.uniforms.uVignetteStrength = { value: 0.6 };
        periscopeShader.uniforms.uCircleRadius = { value: 0.45 };
        periscopeShader.uniforms.uAspect = { value: window.innerWidth / window.innerHeight };

        this.periscopePass = new ShaderPass(periscopeShader);
        this.periscopePass.renderToScreen = false;
        this.periscopeComposer.addPass(this.periscopePass);

        // Output pass
        const outputPass = new OutputPass();
        this.periscopeComposer.addPass(outputPass);
    }

    /**
     * Initializes the EffectComposer for FPV with dark tone filter and DOF
     */
    initFPVPostProcessing() {
        if (!this.cameras['SubmarineFPV']) {
            console.warn('FPV camera not found');
            return;
        }

        this.fpvComposer = new EffectComposer(this.renderer);
        this.fpvComposer.addPass(new RenderPass(this.scene, this.cameras['SubmarineFPV']));

        const bokehPass = new BokehPass(this.scene, this.cameras['SubmarineFPV'], {
            focus: 10.0,
            aperture: 0.0005,
            maxblur: 0.001,
            width: window.innerWidth,
            height: window.innerHeight
        });
        this.fpvComposer.addPass(bokehPass);

        // Add FPV shader for dark tone filter
        const fpvShader = createFPVShader();
        fpvShader.uniforms.uAspect.value = window.innerWidth / window.innerHeight;

        this.fpvPass = new ShaderPass(fpvShader);
        this.fpvPass.renderToScreen = false;
        this.fpvComposer.addPass(this.fpvPass);

        const outputPass = new OutputPass();
        this.fpvComposer.addPass(outputPass);
    }

    /**
     * Creates the FPV control panel overlay using Three.js
     */
    initFPVOverlay() {
        if (!this.cameras['SubmarineFPV']) {
            console.warn('FPV camera not found');
            return;
        }

        const geometry = new THREE.PlaneGeometry(8, 2);

        const textureLoader = new THREE.TextureLoader();
        const controlPanelTexture = textureLoader.load('textures/control_panel.png', (texture) => {
            const aspectRatio = texture.image.width / texture.image.height;
            const newWidth = geometry.parameters.height * aspectRatio;
            const newGeometry = new THREE.PlaneGeometry(newWidth, geometry.parameters.height);
            
            this.fpvOverlay.geometry.dispose();
            this.fpvOverlay.geometry = newGeometry;
        });
        controlPanelTexture.colorSpace = THREE.SRGBColorSpace;
        controlPanelTexture.magFilter = THREE.LinearFilter;
        controlPanelTexture.minFilter = THREE.LinearFilter;

        const material = new THREE.MeshBasicMaterial({
            map: controlPanelTexture,
            transparent: true,
            opacity: 1.0,
            depthTest: false,
            depthWrite: false
        });

        this.fpvOverlay = new THREE.Mesh(geometry, material);
        this.fpvOverlay.position.set(0, -0.5, -1.9);
        this.fpvOverlay.visible = false;

        let videoTexture;
        let video = null;
        try {
            video = document.createElement('video');
            video.src = 'textures/sonar.mp4';
            video.crossOrigin = 'anonymous';
            video.loop = true;
            video.muted = true;
            video.preload = 'auto';
            
            videoTexture = new THREE.VideoTexture(video);
            videoTexture.colorSpace = THREE.SRGBColorSpace;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.minFilter = THREE.LinearFilter;
            
            video.play().catch(e => {
                console.warn('Video autoplay failed:', e);
                // Fallback to GIF if video fails
                videoTexture = textureLoader.load('textures/sonar.gif');
                videoTexture.colorSpace = THREE.SRGBColorSpace;
                videoTexture.magFilter = THREE.LinearFilter;
                videoTexture.minFilter = THREE.LinearFilter;
                videoTexture.generateMipmaps = false;
            });
        } catch (e) {
            console.warn('Video texture creation failed, using GIF:', e);
            // Fallback to GIF
            videoTexture = textureLoader.load('textures/sonar.gif');
            videoTexture.colorSpace = THREE.SRGBColorSpace;
            videoTexture.magFilter = THREE.LinearFilter;
            videoTexture.minFilter = THREE.LinearFilter;
            videoTexture.generateMipmaps = false;
            video = null;
        }

        // Save reference to the underlying HTMLVideoElement (may be null if fallback GIF used)
        this.fpvVideoElement = video;

        const videoGeometry = new THREE.CircleGeometry(0.3, 32);

        const videoMaterial = new THREE.MeshBasicMaterial({
            map: videoTexture,
            transparent: true,
            depthTest: false,
            depthWrite: false
        });

        this.fpvVideoDisplay = new THREE.Mesh(videoGeometry, videoMaterial);
        this.fpvVideoDisplay.position.set(0, -0.5, -0.03);
        this.fpvVideoDisplay.visible = true; // Will be controlled by parent visibility

        // Add video display as child of the control panel so they move together
        this.fpvOverlay.add(this.fpvVideoDisplay);

        // Don't add to scene - will be added as child of camera when needed
    }

    /**
     * Update the Bokeh Pass parameters (for GUI)
     * @param {Number} aperture 
     * @param {Number} focus 
     * @param {Number} maxblur 
     */
    updateBokehParams(aperture, focus, maxblur) {
        if (this.bokehPass) {
            this.bokehPass.uniforms['aperture'].value = aperture;
            if (focus !== undefined) this.bokehPass.uniforms['focus'].value = focus;
            if (maxblur !== undefined) this.bokehPass.uniforms['maxblur'].value = maxblur;
        }
    }

    /**
     * sets the active camera by name
     * @param {String} cameraName 
     */
    setActiveCamera(cameraName) {   
        this.activeCameraName = cameraName
        this.activeCamera = this.cameras[this.activeCameraName]
        
        // Notify contents about camera change for dynamic effects
        if (this.contents && typeof this.contents.onCameraChange === 'function') {
            this.contents.onCameraChange(cameraName);
        }
    }

    /**
     * updates the active camera if required
     * this function is called in the render loop
     * when the active camera name changes
     * it updates the active camera and the controls
     */
    updateCameraIfRequired() {

        // camera changed?
        if (this.lastCameraName !== this.activeCameraName) {
            this.lastCameraName = this.activeCameraName;
            this.activeCamera = this.cameras[this.activeCameraName]
            document.getElementById("camera").innerHTML = this.activeCameraName
            
            // call on resize to update the camera aspect ratio
            // among other things
            this.onResize()

            // Handle fly camera controls
            if (this.activeCameraName === 'Fly') {
                // Reset fly camera to initial position
                this.activeCamera.position.copy(this.flyCameraInitialPosition);
                this.activeCamera.lookAt(this.flyCameraInitialTarget);
                
                // Disable orbit controls for fly camera
                if (this.controls !== null) {
                    this.controls.enabled = false;
                }
                
                // Initialize fly controls if not yet created
                if (this.flyControls === null) {
                    this.flyControls = new FlyControls(this.activeCamera, this.renderer.domElement);
                    this.flyControls.movementSpeed = 5.0;
                    this.flyControls.rollSpeed = 1.0;
                    this.flyControls.dragToLook = true;
                } else {
                    this.flyControls.object = this.activeCamera;
                }

                // Disable submarine keyboard controls when using the fly camera
                if (this.contents && this.contents.submarine && typeof this.contents.submarine.setControlsEnabled === 'function') {
                    this.contents.submarine.setControlsEnabled(false);
                }

                // Disable coral bubbles for fly camera
                if (this.contents) {
                    this.contents.coralBubblesEnabled = false;
                    if (this.contents.bubble && typeof this.contents.bubble.clearCoralBubbles === 'function') {
                        this.contents.bubble.clearCoralBubbles();
                    }
                }

                // Disable volumetric light cone for fly camera
                if (this.contents && typeof this.contents.setVolumetricLightEnabled === 'function') {
                    this.contents.setVolumetricLightEnabled(false);
                }

                if (this.bokehPass) {
                    this.bokehPass.camera = this.activeCamera;
                    // Bokeh pass internal material needs the camera projection matrix
                    this.bokehPass.uniforms['aspect'].value = this.activeCamera.aspect;
                }
            } else if (this.activeCameraName === 'SubmarineFPV' || this.activeCameraName === 'SubmarinePeriscope') {
                if (this.contents && this.contents.submarine && typeof this.contents.submarine.setControlsEnabled === 'function') {
                    this.contents.submarine.setControlsEnabled(true);
                }

                // Disable coral bubbles for both FPV and Periscope cameras
                if (this.contents) {
                    this.contents.coralBubblesEnabled = false;
                    if (this.contents.bubble && typeof this.contents.bubble.clearCoralBubbles === 'function') {
                        this.contents.bubble.clearCoralBubbles();
                    }
                }
            } else {
                // Disable fly controls for other cameras (handled by Three.js FlyControls)
                
                // Enable/setup orbit controls
                if (this.controls === null) {
                    // Orbit controls allow the camera to orbit around a target.
                    this.controls = new OrbitControls( this.activeCamera, this.renderer.domElement );
                    this.controls.enableZoom = true;
                    this.controls.target.set(0, 7, -4);
                    this.controls.update();
                } else {
                    this.controls.object = this.activeCamera;
                    this.controls.enabled = true;
                }
                
                // Re-enable submarine keyboard controls for non-fly cameras
                if (this.contents && this.contents.submarine && typeof this.contents.submarine.setControlsEnabled === 'function') {
                    this.contents.submarine.setControlsEnabled(true);
                }

                // Re-enable coral bubbles for other cameras
                if (this.contents) {
                    this.contents.coralBubblesEnabled = false;
                }

                // Re-enable volumetric light cone for non-fly cameras
                if (this.contents && typeof this.contents.setVolumetricLightEnabled === 'function') {
                    this.contents.setVolumetricLightEnabled(true);
                }
            }
        }
    }

    /**
     * the window resize handler
     */
    onResize() {
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.activeCamera.aspect = window.innerWidth / window.innerHeight;
            this.activeCamera.updateProjectionMatrix();
            this.renderer.setSize( window.innerWidth, window.innerHeight );
            if (this.composer) {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            }
            if (this.periscopeComposer) {
                this.periscopeComposer.setSize(window.innerWidth, window.innerHeight);
                if (this.periscopePass && this.periscopePass.uniforms && this.periscopePass.uniforms.uAspect) {
                    this.periscopePass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
                }
            }
            if (this.fpvComposer) {
                this.fpvComposer.setSize(window.innerWidth, window.innerHeight);
                if (this.fpvPass && this.fpvPass.uniforms && this.fpvPass.uniforms.uAspect) {
                    this.fpvPass.uniforms.uAspect.value = window.innerWidth / window.innerHeight;
                }
            }
        }
    }
    /**
     * 
     * @param {MyContents} contents the contents object 
     */
    setContents(contents) {
        this.contents = contents;
        if (this.contents && this.contents.submarine && this.contents.submarine.fpvCamera) {
            this.cameras['SubmarineFPV'] = this.contents.submarine.fpvCamera;
            this.initFPVOverlay();
            this.initFPVPostProcessing();
        }
        if (this.contents && this.contents.submarine && this.contents.submarine.periscopeCamera) {
            this.cameras['SubmarinePeriscope'] = this.contents.submarine.periscopeCamera;
            this.initPeriscopePostProcessing();
        }
    }

    /**
     * @param {MyGuiInterface} contents the gui interface object
     */
    setGui(gui) {   
        this.gui = gui
    }

    setWireframeMode(enabled) {
        this.wireframeMode = enabled
        this.scene.traverse((object) => {
            if (object.isMesh) {
                if (Array.isArray(object.material)) {
                    object.material.forEach(mat => {
                        material.wireframe = enabled;
                    });
                } else {
                    object.material.wireframe = enabled;
                }
            }
        })
    }

    /**
    * the main render function. Called in a requestAnimationFrame loop
    */
    render () {
        this.stats.begin()
        this.updateCameraIfRequired()

        let delta = this.clock.getDelta();
        const elapsed = this.clock.getElapsedTime();

        // If time is frozen, pass delta = 0 to stop all animations
        if (this.timeFrozen) {
            delta = 0;
        }

        // update the animation if contents were provided
        if (this.activeCamera !== undefined && this.activeCamera !== null) {
            this.contents.update(this.timeFrozen)
        }

        // Update fly camera if active
        if (this.activeCameraName === 'Fly' && this.flyControls !== null) {
            this.flyControls.update(delta);
        }

        // required if controls.enableDamping or controls.autoRotate are set to true
        if (this.controls !== null && this.controls.enabled) {
            this.controls.update();
        }

        // If we are in Fly mode, use the Post-Processing Composer
        if (this.activeCameraName === 'Fly' && this.composer) {
            // Update BokehPass uniforms with current postProcessingParams
            if (this.bokehPass) {
                this.bokehPass.uniforms['focus'].value = this.postProcessingParams.focus;
                this.bokehPass.uniforms['aperture'].value = this.postProcessingParams.aperture;
                this.bokehPass.uniforms['maxblur'].value = this.postProcessingParams.maxblur;
            }
            // Check if delta is valid (prevent NaN issues on first frame)
            const d = delta > 0 ? delta : 0.01; 
            this.composer.render(d); 
        } else if (this.activeCameraName === 'SubmarinePeriscope' && this.periscopeComposer) {
            // Update submarine coordinates for HUD display
            if (this.contents && this.contents.submarine) {
                const subPos = this.contents.submarine.position;
                this.periscopePass.uniforms.uSubmarineX.value = subPos.x;
                this.periscopePass.uniforms.uSubmarineY.value = subPos.y;
                this.periscopePass.uniforms.uSubmarineZ.value = subPos.z;
            }
            
            const d = delta > 0 ? delta : 0.01;
            this.periscopeComposer.render(d);
        } else if (this.activeCameraName === 'SubmarineFPV') {
            // Attach FPV control panel to camera
            if (this.fpvOverlay && this.activeCamera) {
                // Attach overlay to camera so it moves with it
                if (this.fpvOverlay.parent !== this.activeCamera) {
                    this.activeCamera.add(this.fpvOverlay);
                }
                this.fpvOverlay.visible = true;
                // Ensure video playback starts when overlay becomes visible
                if (this.fpvVideoElement) {
                    // Attempt to play; browsers may block autoplay without user gesture
                    this.fpvVideoElement.play().catch(() => {});
                }
            }
            // Use FPV composer with dark tone filter and DOF
            if (this.fpvComposer) {
                const d = delta > 0 ? delta : 0.01;
                this.fpvComposer.render(d);
            } else {
                // Fallback to standard renderer
                this.renderer.render(this.scene, this.activeCamera);
            }
        } else {
            // Detach FPV overlay from camera for other cameras
            if (this.fpvOverlay && this.fpvOverlay.parent) {
                this.fpvOverlay.parent.remove(this.fpvOverlay);
            }
            if (this.fpvOverlay) {
                this.fpvOverlay.visible = false;
            }
            // Pause FPV video if present to avoid rendering/updating when not visible
            if (this.fpvVideoElement) {
                try {
                    this.fpvVideoElement.pause();
                } catch (e) {
                    // ignore
                }
            }

            // Otherwise use the standard renderer
            this.renderer.render(this.scene, this.activeCamera);
        }
        
        // subsequent async calls to the render loop
        requestAnimationFrame( this.render.bind(this) );

        this.lastCameraName = this.activeCameraName
        this.stats.end()
    }
}


export { MyApp };