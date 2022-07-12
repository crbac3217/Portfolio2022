import './style.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as dat from 'dat.gui'
import { Color, Group, Mesh, MeshStandardMaterial, Path, Quaternion, RectAreaLight, ShaderMaterial, TextureEncoding, UVMapping, Vector2, Vector3 } from 'three'

//global variables for scene
var front = true;
var interactable = true;
var mode = "none";
let stats, composer;
// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

//parameters for bloom
const params = {
    exposure: 1.1,
	bloomStrength: 0.5,
	bloomThreshold: 0.1,
	bloomRadius: 0,
}

// Sizes
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

//camera
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
gui.add(camera.position, 'x').min(-9).max(9);
gui.add(camera.position, 'y').min(-9).max(9);
gui.add(camera.position, 'z').min(-9).max(9);
gui.add(camera.rotation, 'x').min(-9).max(9);
gui.add(camera.rotation, 'y').min(-9).max(9);
gui.add(camera.rotation, 'z').min(-9).max(9);
scene.add(camera)

//renderer
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(window.devicePixelRatio)
renderer.toneMapping = THREE.ReinhardToneMapping;



// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true


// load
const loader = new GLTFLoader();

//draco loader
//const dracoLoader = new DRACOLoader();
//dracoLoader.setDecoderPath('/examples/js/libs/draco/');
//loader.setDRACOLoader(dracoLoader);
var gltfscene = new Group;
var faceobj = new Mesh;
var shaderobj1 = new Mesh;
var phonescreen = new MeshStandardMaterial;
var tabscreen = new MeshStandardMaterial;
//actually load now
loader.load(
    // resource URL
    'Assets/3D/face.gltf',
    // called when the resource is loaded
    function (gltf) {


        gltfscene = gltf.scene;
        scene.add(gltf.scene);
        gltf.scene.translateZ(-1.4);
        gltf.scene.translateY(-0.2);
        gui.add(gltf.scene.rotation, 'x').min(0).max(9);
        gui.add(gltf.scene.rotation, 'y').min(0).max(9);
        gui.add(gltf.scene.rotation, 'z').min(0).max(9);
        gui.add(gltf.scene.position, 'x').min(-9).max(9);
        gui.add(gltf.scene.position, 'y').min(-9).max(9);
        gui.add(gltf.scene.position, 'z').min(-9).max(9);
        gltf.scene.traverse(function (child) {
            if (child.material && child.material.name === 'wireframe') {
                child.material.wireframe = true;
                child.material.emissiveIntensity = 3;
            }
            if (child.material && child.material.name === 'phonescreen') {
                child.material.emissiveIntensity = 3;
                phonescreen = child.material;
            }
            if (child.material && child.material.name === 'tabscreen') {
                child.material.emissiveIntensity = 3;
                tabscreen = child.material;
            }
            if (child.material && child.material.name === 'htmlin') {
                child.material.emissiveIntensity = 2;
            }
            if (child.material && child.material.name === 'psLight') {
                child.material.emissiveIntensity = 5;
            }
            if (child.material && child.material.name === 'aiLight') {
                child.material.emissiveIntensity = 5;
            }
            if (child.material && child.material.name === 'aeLight') {
                child.material.emissiveIntensity = 5;
            }
            if (child.material && child.material.name === 'TYPOIN') {
                child.material.emissiveIntensity = 50;
            }
            if (child.material && child.material.name === 'facebackmatrev') {
                faceobj = child;
            }
            if (child.material && child.material.name === 'testmat') {
                shaderobj1 = child
            }
        });
    },
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
);

//add light
const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 0
pointLight.position.y = 3
pointLight.position.z = 5
scene.add(pointLight)

gui.add(pointLight.position, 'x').min(0).max(9);
gui.add(pointLight.position, 'y').min(0).max(9);
gui.add(pointLight.position, 'z').min(-9).max(9);

//animation

//interaction

//bloom test
const renderScene = new RenderPass( scene, camera );

const bloomPass = new UnrealBloomPass( new THREE.Vector2( window.innerWidth, window.innerHeight ), 1.5, 0.4, 0.85 );
bloomPass.threshold = params.bloomThreshold;
bloomPass.strength = params.bloomStrength;
bloomPass.radius = params.bloomRadius;

				composer = new EffectComposer( renderer );
				composer.addPass( renderScene );
				composer.addPass( bloomPass );
stats = new Stats();
canvas.appendChild( stats.dom );
gui.add( params, 'exposure', 0.1, 2 ).onChange( function ( value ) {

    renderer.toneMappingExposure = Math.pow( value, 4.0 );

} );

gui.add( params, 'bloomThreshold', 0.0, 1.0 ).onChange( function ( value ) {

    bloomPass.threshold = Number( value );

} );

gui.add( params, 'bloomStrength', 0.0, 3.0 ).onChange( function ( value ) {

    bloomPass.strength = Number( value );

} );

gui.add( params, 'bloomRadius', 0.0, 1.0 ).step( 0.01 ).onChange( function ( value ) {

    bloomPass.radius = Number( value );

} );

//animate
const clock = new THREE.Clock();
gltfscene.rotation.set(0, 0, 0);
const currentRotVec = gltfscene.rotation;

document.getElementById("3D").onmousemove = function(event) {myFunction(event)};

function myFunction(e) {
  if(front && interactable){
  var rect = e.target.getBoundingClientRect();
  var x = (e.clientX - rect.right/2)/(rect.right/2);
  var y = (e.clientY - rect.bottom/2)/(rect.bottom/2);
  currentRotVec.set(0, 0, 0);
  gltfscene.rotation.set(currentRotVec.x + y/5, currentRotVec.y + x/5, currentRotVec.z);
  }
  
}
const mouse = new THREE.Vector2();
const raycaster = new THREE.Raycaster();
document.getElementById("3D").onmousedown = function(event) {onPointerDown( event ) };
function onPointerDown( event ) {
    //var rect = event.target.getBoundingClientRect();
   // mouse.x = (event.clientX - rect.right/2)/(rect.right/2);
    //mouse.y = (event.clientY - rect.bottom/2)/(rect.bottom/2);
    //raycaster.setFromCamera( mouse, camera );
    //const intersects = raycaster.intersectObjects( gltfscene.children, false );
    if(interactable){
        front = !front;
        interactable = false;
        console.log(front)
        turn();
    }
        
    //}

}
var turncount = 0;
function turn(){
    if(front){
        gltfscene.rotateY(-0.1);
        turncount += 0.1;
        composer.render();
        if(turncount >= 3){
            turncount = 0;
            interactable = true;
            gltfscene.rotation.set(0,0,0);
        }else{
            window.requestAnimationFrame(turn)
        }
    }else{
        gltfscene.rotateY(-0.1);
        turncount += 0.1;
        composer.render();
        if(turncount >= 3){
            turncount = 0;
            interactable = true;
            gltfscene.rotation.set(0,3,0);
        }else{
            window.requestAnimationFrame(turn)
        }
    }
}

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()
    stats.update();
    composer.render();
    window.requestAnimationFrame(tick)
}

tick()