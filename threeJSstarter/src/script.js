import './style.css'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import * as dat from 'dat.gui'
import { AnimationClip, AnimationMixer, Color, Euler, Group, LoopOnce, Mesh, MeshStandardMaterial, Path, Quaternion, RectAreaLight, ShaderMaterial, TextureEncoding, UVMapping, Vector2, Vector3 } from 'three'
import { lerp } from 'three/src/math/mathutils';

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
const camera = new THREE.PerspectiveCamera(50, sizes.width / sizes.height, 0.1, 20)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 5
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
const facebacktex ={
    fbtexture: {type: "t", value: new THREE.TextureLoader().load('Assets/2D/spacetex1.jpg')}
}
const phonetex1 = new THREE.TextureLoader().load('Assets/2D/chainet.png');
const phonetex2 = new THREE.TextureLoader().load('Assets/2D/vanend.png');
const phonetex3 = new THREE.TextureLoader().load('Assets/2D/vanstart.png');
const phonetex4 = new THREE.TextureLoader().load('Assets/2D/tab.png');
const phonetexes = [phonetex1, phonetex2, phonetex3, phonetex4];
const tabtex1 = new THREE.TextureLoader().load('Assets/2D/acceloweb.jpg');
const tabtex2 = new THREE.TextureLoader().load('Assets/2D/acceloweb2.jpg');
const tabtex3 = new THREE.TextureLoader().load('Assets/2D/projection.jpg');
const tabtexes = [tabtex1, tabtex2, tabtex3];
var faceanims = new Array;
var mixer;
// const fly1 = new THREE.AnimationClip();
// const fly2 = new THREE.AnimationClip();
// const sleep = new THREE.AnimationClip();
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
        gui.add(gltf.scene.rotation, 'x').min(-9).max(9);
        gui.add(gltf.scene.rotation, 'y').min(-9).max(9);
        gui.add(gltf.scene.rotation, 'z').min(-9).max(9);
        gui.add(gltf.scene.position, 'x').min(-9).max(9);
        gui.add(gltf.scene.position, 'y').min(-9).max(9);
        gui.add(gltf.scene.position, 'z').min(-9).max(9);

        //revising the materials
        gltf.scene.traverse(function (child) {
            if (child.material && child.material.name === 'wireframe') {
                child.material.wireframe = true;
                child.material.emissiveIntensity = 3;
            }
            if (child.material && child.material.name === 'phonescreen') {
                child.material.emissiveIntensity = 0.5;
                phonescreen = child.material;
            }
            if (child.material && child.material.name === 'tabscreen') {
                child.material.emissiveIntensity = 0.5;
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
                child.material = new ShaderMaterial({
                    uniforms: facebacktex,
                    vertexShader: document.getElementById("facebackVertexShader").textContent,
                    fragmentShader: document.getElementById("facebackFragmentShader").textContent
                });
            }
            if (child.material && child.material.name === 'testmat') {
                shaderobj1 = child
                child.material = new ShaderMaterial({
                    vertexShader: document.getElementById("shadermat1VertexShader").textContent,
                    fragmentShader: document.getElementById("shadermat1FragmentShader").textContent
                })
            }
            
        });
        mixer = new AnimationMixer(gltf.scene);
        gltf.animations.forEach((clip) => {
            faceanims.push(clip);
            console.log(faceanims.length);
            console.log(clip.name);
        });
        faceIdleAnims();
        
    },
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
);
loader.load(
    // resource URL
    'Assets/3D/bg.gltf',
    // called when the resource is loaded
    function (gltf) {
        scene.add(gltf.scene);
        gltf.scene.translateZ(-1.4);
        gltf.scene.translateY(-0.2);
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

document.getElementById("3D").onmousemove = function(event) {onMouseMove(event)};

function onMouseMove(e) {
  if(front && interactable){
  var rect = e.target.getBoundingClientRect();
  var x = (e.clientX - rect.right/2)/(rect.right/2);
  var y = (e.clientY - rect.bottom/2)/(rect.bottom/2);
  currentRotVec.set(0, 0, 0);
  gltfscene.rotation.set(currentRotVec.x + y/5, currentRotVec.y + x/5, currentRotVec.z);
  }
  if(!front && interactable)
  {
    var rect = e.target.getBoundingClientRect();
    var x = e.clientX;
    var y = e.clientY;
    if(y > rect.bottom/2)
    {
        if(mode != 'Game'){
            mode = 'Game';
            counter = 0;
            movetoGame();
        }
    }else{
        if(x < rect.right/2){
            if(mode != '2D'){
                mode = '2D';
                counter = 0;
                moveto2D();
            }
        }else{
            if(mode != '3D'){
                mode = '3D';
                counter = 0;
                moveto3D();
            }
        }
    }
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
    if(interactable && front){      
        interactable = false;
        preTurn();
    }
        
    //}

}
var turncount = 0;
function preTurn(){
    var preTurnAnim = faceanims[2];
        const val = Math.floor(Math.random() * 4);
        if(val === 0){
            preTurnAnim = faceanims[6];
        }else if (val === 1)
        {
            preTurnAnim = faceanims[3];
        }else if (val === 2)
        {
            preTurnAnim = faceanims[4];
        }else if (val === 3)
        {
            preTurnAnim = faceanims[5];
        }
        mixer.stopAllAction();
        const action = mixer.clipAction(preTurnAnim);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.play();
        action.clampWhenFinished = true;
        console.log(preTurnAnim.name);
        setTimeout(turn, preTurnAnim.duration * 1000 + 500);
}
function turn(){
        gltfscene.rotateY(-0.1);
        turncount += 0.1;
        composer.render();
        if(turncount >= 3){
            turncount = 0;
            front = !front;
            interactable = true;
            gltfscene.rotation.set(0,3,0);
        }else{
            window.requestAnimationFrame(turn)
        }
}

const animate = () =>
{
    requestAnimationFrame(animate);
    stats.update();
    var delta = clock.getDelta();
    if ( mixer ) mixer.update( delta );
    composer.render();
}
animate();
function changePhoneScreen(){
    var textochangeto = phonetexes[Math.floor(Math.random() * phonetexes.length)];
    phonescreen.map = textochangeto;
    phonescreen.emissiveMap = textochangeto;
    setTimeout(changePhoneScreen, 1000);
}

changePhoneScreen();

function faceIdleAnims(){
    if(front && interactable){
        var idleAnim = faceanims[1];
        const val = Math.floor(Math.random() * 10);
        if(val === 1){
            idleAnim = faceanims[9];
        }else if (val === 2)
        {
            idleAnim = faceanims[7];
        }else if (val === 3)
        {
            idleAnim = faceanims[8];
        }else
        {
            idleAnim = faceanims[2];
        }
        const action = mixer.clipAction(idleAnim);
        action.reset();
        action.setLoop(THREE.LoopOnce);
        action.play();
        console.log(idleAnim.name);
        setTimeout(faceIdleAnims, idleAnim.duration * 1000 + 2000);
    }
}
function changeTabScreen(){
    // do whatever you like here
    var textochangeto = tabtexes[Math.floor(Math.random() * tabtexes.length)];
    tabscreen.map = textochangeto;
    tabscreen.emissiveMap = textochangeto;
    setTimeout(changeTabScreen, 1500);
}

changeTabScreen();

//setup basic variables for rotation
const increment = 30;
var counter = 0;
var startPos = new Vector3();
var startRot = new Quaternion();

const finalPos2D = new Vector3(0,-0.45,0.5);
const finalRot2D = new Quaternion();
finalRot2D.setFromEuler(new THREE.Euler(0.2,3,0.4));
const finalPos3D = new Vector3(-0.15,-0.45,0.5);
const finalRot3D = new Quaternion();
finalRot3D.setFromEuler(new THREE.Euler(0.2,2.8,-0.3));
const finalPosGame = new Vector3(0,0.45,0.5);
const finalRotGame = new Quaternion();
finalRotGame.setFromEuler(new THREE.Euler(0.5,3.3,0.1));

function moveto2D(){
if(counter < increment && mode === '2D'){
    if(counter === 0){
        startPos = gltfscene.position;
        startRot.setFromEuler(gltfscene.rotation);
    }
    // const posLerp = new THREE.Vector3.lerpVectors(startPos, finalPos2D, counter/increment);
    gltfscene.position.lerpVectors(startPos, finalPos2D, counter/increment);
    var targetQ = new Quaternion();
    targetQ.slerpQuaternions(startRot, finalRot2D, counter/increment);
    gltfscene.rotation.setFromQuaternion(targetQ);
    composer.render();
    window.requestAnimationFrame(moveto2D)
    counter++;
    console.log('2D');
}else{
    
}
}
function moveto3D(){
    if(counter < increment && mode === '3D'){
        if(counter === 0){
            startPos = gltfscene.position;
            startRot.setFromEuler(gltfscene.rotation);
        }
        gltfscene.position.lerpVectors(startPos, finalPos3D, counter/increment);
        var targetQ = new Quaternion();
        targetQ.slerpQuaternions(startRot, finalRot3D, counter/increment);
        gltfscene.rotation.setFromQuaternion(targetQ);
        composer.render();
        window.requestAnimationFrame(moveto3D)
        counter++;
        console.log('3D');
    }else{
        
    }
}
function movetoGame(){
    if(counter < increment && mode === 'Game'){
        if(counter === 0){
            startPos = gltfscene.position;
            startRot.setFromEuler(gltfscene.rotation);
        }
        gltfscene.position.lerpVectors(startPos, finalPosGame, counter/increment);
        var targetQ = new Quaternion();
        targetQ.slerpQuaternions(startRot, finalRotGame, counter/increment);
        gltfscene.rotation.setFromQuaternion(targetQ);
        composer.render();
        window.requestAnimationFrame(movetoGame)
        counter++;
        console.log('Game');
    }else{
        
    }
}

