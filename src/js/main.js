import * as THREE from "../../lib/three.module.js";
import { FBXLoader } from "../FBXLoader.js";
import { GLTFLoader } from "../GLTFLoader.js";
import { OrbitControls } from "../OrbitControls.js";

window.addEventListener("load", init, false);

var camera,
	scene,
	renderer,
	mixer,
	rollingGround,
	sceneHeight,
	sceneWidth,
	rollingSpeed = 0.008,
	sun,
	currentLane,
	midLane = 0,
	leftLane = -1,
	rightLane = 1,
	clock;

clock = new THREE.Clock();

function init() {
	// set up the scene
	createScene();
	// call game loop
	update();
}

function createScene() {
	sceneWidth = window.innerWidth;
	sceneHeight = window.innerHeight;
	// create 3D scene
	scene = new THREE.Scene();
	// add sky
	var loader = new THREE.TextureLoader();
	scene.background = loader.load("assets/textures/cityrobot2.jpg");
	// add fog
	scene.fog = new THREE.FogExp2(0x00011, 0.08);
	// set camera
	camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.2, 1000);
	// render
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(sceneWidth, sceneHeight);
	document.body.appendChild(renderer.domElement);
	// add game object
	addWorld();
	addRobo();
	addLight();
	// set camera to 3rd person camera
	camera.position.z = 14;
	camera.position.y = 4;

	// debugging
	const controls = new OrbitControls(camera, renderer.domElement);
	controls.enablePan = false;
	controls.enableZoom = false;
	controls.target.set(0, 2, 0);
	controls.update();
}

function addWorld() {
	var cylinderGeo = new THREE.CylinderGeometry(19, 19, 45, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/brokenroad.jpg");
	// texture.rotation = Math.PI / 2;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(3, 2);
	var cylinderMat = new THREE.MeshPhongMaterial({
		// color: 0x4f5150,
		side: THREE.DoubleSide,
		map: texture,
	});
	rollingGround = new THREE.Mesh(cylinderGeo, cylinderMat);
	rollingGround.receiveShadow = true;
	rollingGround.rotation.z = Math.PI / 2;
	rollingGround.position.y = -20;
	rollingGround.position.z = 3;
	scene.add(rollingGround);
}

function addRobo() {
	var loader = new FBXLoader();
	loader.load("assets/model/Running.fbx", function (robo) {
		mixer = new THREE.AnimationMixer(robo);
		var action = mixer.clipAction(robo.animations[0]);
		action.play();
		robo.traverse(function (child) {
			if (child.isMesh) {
				child.castShadow = true;
				child.receiveShadow = true;
			}
		});
		robo.position.set(0, -1.5, 5);
		robo.rotation.set(0, Math.PI, 0);
		scene.add(robo);
	});
}

function addLight() {
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.9);
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight(0xcdc1c5, 0.9);
	sun.position.set(12, 6, -7);
	sun.castShadow = true;
	scene.add(sun);

	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50;
}

function update() {
	// animate
	const delta = clock.getDelta();

	if (mixer) mixer.update(delta);

	rollingGround.rotation.x += rollingSpeed;

	render();
	// request next update
	requestAnimationFrame(update);
}

function render() {
	renderer.render(scene, camera);
}

function onWindowResize() {
	//resize & align
	sceneHeight = window.innerHeight;
	sceneWidth = window.innerWidth;
	renderer.setSize(sceneWidth, sceneHeight);
	camera.aspect = sceneWidth / sceneHeight;
	camera.updateProjectionMatrix();
}
