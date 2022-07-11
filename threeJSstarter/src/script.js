import './style.css'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js'
import * as dat from 'dat.gui'
import { Path, Vector3 } from 'three'

// Debug
const gui = new dat.GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

// load
const loader = new GLTFLoader();

//draco loader
//const dracoLoader = new DRACOLoader();
//dracoLoader.setDecoderPath('/examples/js/libs/draco/');
//loader.setDRACOLoader(dracoLoader);

//actually load now
loader.load(
    // resource URL
    'Assets/3D/face.gltf',
    // called when the resource is loaded
    function (gltf) {

        scene.add(gltf.scene);
        gltf.scene.translateZ(-3);
        gui.add(gltf.scene.rotation, 'x').min(0).max(9);
        gui.add(gltf.scene.rotation, 'y').min(0).max(9);
        gui.add(gltf.scene.rotation, 'z').min(0).max(9);
        gui.add(gltf.scene.position, 'x').min(-9).max(9);
        gui.add(gltf.scene.position, 'y').min(-9).max(9);
        gui.add(gltf.scene.position, 'z').min(-9).max(9);
    },
    function (xhr) {

        console.log((xhr.loaded / xhr.total * 100) + '% loaded');

    },
    // called when loading has errors
    function (error) {

        console.log('An error happened');

    }
);


const pointLight = new THREE.PointLight(0xffffff, 1)
pointLight.position.x = 0
pointLight.position.y = 3
pointLight.position.z = 5
scene.add(pointLight)

gui.add(pointLight.position, 'x').min(0).max(9);
gui.add(pointLight.position, 'y').min(0).max(9);
gui.add(pointLight.position, 'z').min(-9).max(9);

/**
 * Sizes
 */
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

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 10)
camera.position.x = 0
camera.position.y = 0
camera.position.z = 2
scene.add(camera)

// Controls
// const controls = new OrbitControls(camera, canvas)
// controls.enableDamping = true

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    alpha: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */

const clock = new THREE.Clock()

const tick = () =>
{

    const elapsedTime = clock.getElapsedTime()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()