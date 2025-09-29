import * as THREE from 'three';
import { MyAxis } from './MyAxis.js';
import { MyTable } from './MyTable.js';
import { MyWalls } from './MyWalls.js';
import { MyCompoundObj } from './MyCompoundObj.js';

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
        this.obj = null
        this.objEnabled = true
        this.lastObjEnabled = null

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
        

        const floor_texture = new THREE.TextureLoader().load('textures/floor.png');
        floor_texture.wrapS = THREE.RepeatWrapping;
        floor_texture.wrapT = THREE.RepeatWrapping;
        floor_texture.repeat.set(10, 10);

        this.planeMaterial = new THREE.MeshPhongMaterial({ color: this.diffusePlaneColor, 
            specular: this.specularPlaneColor, emissive: "#000000", shininess: this.planeShininess, map: floor_texture })
    
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
            this.app.scene.add(this.axis)
        }

        if (this.table === null) { 
            //const tableMaterial = new THREE.MeshBasicMaterial( {color: 0x563232} );

            const uvTexture = new THREE.TextureLoader().load('textures/uv_grid.jpg');
            uvTexture.wrapS = THREE.MirroredRepeatWrapping;
            uvTexture.wrapT = THREE.MirroredRepeatWrapping;
            uvTexture.repeat.set(3, 4);
            const uvMaterial = new THREE.MeshPhongMaterial({ color: "#00ff00", 
                specular: "#00ff00", emissive: "#000000", shininess: this.planeShininess, map: uvTexture })

            this.table = new MyTable(this, uvMaterial)
            this.app.scene.add(this.table)
        }

        if (this.walls === null) {
            this.walls = new MyWalls(this)
            this.app.scene.add(this.walls)
        }

        if (this.obj === null) {
            this.obj = new MyCompoundObj(this)
            
            this.obj.position.set(-0.5, 1.03, 0)
            this.obj.scale.set(0.2, 0.2, 0.2)
            this.obj.rotation.y = Math.PI / 4
            
            this.app.scene.add(this.obj)
        }

        // add a point light on top of the model
        // const pointLight = new THREE.PointLight( 0xffffff, 500, 0 );
        // pointLight.position.set( 0, -20, 0 );
        // this.app.scene.add( pointLight );

        // add a point light helper for the previous point light
        const sphereSize = 0.5;
        // const pointLightHelper = new THREE.PointLightHelper( pointLight, sphereSize );
        // this.app.scene.add( pointLightHelper );

        // add an ambient light
        const ambientLight = new THREE.AmbientLight( 0x444444 );
        this.app.scene.add( ambientLight );
        
        // add a directional light
        // const directionalLight = new THREE.DirectionalLight( 0xffffff, 15 );
        // directionalLight.position.set(5, 10, 2);
        // directionalLight.target.position.set(1, 0, 1);
        // this.app.scene.add( directionalLight );
        // this.app.scene.add( directionalLight.target );

        // const directionalLightHelper = new THREE.DirectionalLightHelper( directionalLight, sphereSize );
        // this.app.scene.add( directionalLightHelper );

        // add a spot light
        this.spotLight = new THREE.SpotLight( 
            this.spotLightColor, 
            this.spotLightIntensity, 
            this.spotLightDistance,
            THREE.MathUtils.degToRad(this.spotLightAngle),
            this.spotLightPenumbra,
            this.spotLightDecay
        );
        this.spotLight.position.set(5, this.spotLightPositionY, 2);
        this.spotLight.target.position.set(1, this.spotLightTargetY, 1);
        this.app.scene.add( this.spotLight );
        this.app.scene.add( this.spotLight.target );
        
        this.spotLightHelper = new THREE.SpotLightHelper( this.spotLight, sphereSize );
        this.app.scene.add( this.spotLightHelper );

        this.buildBox()
        
        // Create a Plane Mesh with basic material
        
        let plane = new THREE.PlaneGeometry( 10, 10 );
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

        // sets the box mesh position based on the displacement vector
        this.boxMesh.position.x = this.boxDisplacement.x
        this.boxMesh.position.y = this.boxDisplacement.y
        this.boxMesh.position.z = this.boxDisplacement.z
        
    }

}

export { MyContents };