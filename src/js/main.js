import * as THREE from "../../lib/three.module.js";
import { FBXLoader } from "../FBXLoader.js";
import { OrbitControls } from "../OrbitControls.js";

var loader = new FBXLoader();
loader.load("assets/model/Running.fbx", function (robo) {
	document.getElementById("myForm").addEventListener("submit", init);
	var camera,
		scene,
		renderer,
		mixer,
		rollingStreet,
		rollingSideWalkRight,
		rollingSideWalkLeft,
		rollingWallRight,
		rollingWallLeft,
		sceneHeight,
		sceneWidth,
		rollingSpeed = 0.008,
		sun,
		robo,
		currentLane,
		midLane = 0,
		leftLane = -5,
		rightLane = 5,
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
		scene.background = loader.load("assets/textures/cityrobot3.jpg");
		// add fog
		scene.fog = new THREE.FogExp2(0x292828, 0.03);
		// set camera
		camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.2, 1000);
		// render
		renderer = new THREE.WebGLRenderer();
		renderer.setSize(sceneWidth, sceneHeight);
		document.body.appendChild(renderer.domElement);
		// add game object
		addStreet();
		addSideWalkLeft();
		addSideWalkRight();
		addWallRight();
		addWallLeft();
		addLight();
		addRobo();
		// set camera to 3rd person camera
		camera.position.z = 14;
		camera.position.y = 5;

		window.addEventListener("resize", onWindowResize, false);
		document.onkeydown = handleKeyDown;

		// debugging
		const controls = new OrbitControls(camera, renderer.domElement);
		controls.enablePan = false;
		controls.enableZoom = false;
		controls.target.set(0, 2, 0);
		controls.update();
	}

	function handleKeyDown(keyEvent) {
		// if (jumping) return;
		var validMove = true;
		if (keyEvent.keyCode === 65) {
			//left
			if (currentLane == midLane) {
				currentLane = leftLane;
			} else if (currentLane == rightLane) {
				currentLane = midLane;
			} else {
				validMove = false;
			}
		} else if (keyEvent.keyCode === 68) {
			//right
			if (currentLane == midLane) {
				currentLane = rightLane;
			} else if (currentLane == leftLane) {
				currentLane = midLane;
			} else {
				validMove = false;
			}
		}
	}

	function addStreet() {
		var cylinderGeo = new THREE.CylinderGeometry(19, 19, 20, 200, 1);
		var texture = new THREE.TextureLoader().load("../assets/textures/street2.jpg");
		texture.rotation = Math.PI / 2;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(1, 3);
		var cylinderMat = new THREE.MeshPhongMaterial({
			// color: 0x4f5150,
			side: THREE.DoubleSide,
			map: texture,
		});
		rollingStreet = new THREE.Mesh(cylinderGeo, cylinderMat);
		rollingStreet.receiveShadow = true;
		rollingStreet.rotation.z = Math.PI / 2;
		rollingStreet.position.y = -20;
		rollingStreet.position.z = 3;
		scene.add(rollingStreet);
	}

	function addSideWalkRight() {
		var cylinderGeo = new THREE.CylinderGeometry(19.5, 19.5, 5, 200, 1);
		var texture = new THREE.TextureLoader().load("../assets/textures/sidewalk2.jpg");
		texture.rotation = Math.PI;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(15, 1);
		var cylinderMat = new THREE.MeshPhongMaterial({
			// color: 0x4f5150,
			side: THREE.DoubleSide,
			map: texture,
		});
		rollingSideWalkRight = new THREE.Mesh(cylinderGeo, cylinderMat);
		rollingSideWalkRight.receiveShadow = true;
		rollingSideWalkRight.rotation.z = Math.PI / 2;
		rollingSideWalkRight.position.x = 12;
		rollingSideWalkRight.position.y = -20;
		rollingSideWalkRight.position.z = 3;
		scene.add(rollingSideWalkRight);
		streetLampRight();
	}

	function addSideWalkLeft() {
		var cylinderGeo = new THREE.CylinderGeometry(19.5, 19.5, 5, 200, 1);
		var texture = new THREE.TextureLoader().load("../assets/textures/sidewalk2.jpg");
		texture.rotation = Math.PI;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(15, 1);
		var cylinderMat = new THREE.MeshPhongMaterial({
			// color: 0x4f5150,
			side: THREE.DoubleSide,
			map: texture,
		});
		rollingSideWalkLeft = new THREE.Mesh(cylinderGeo, cylinderMat);
		rollingSideWalkLeft.receiveShadow = true;
		rollingSideWalkLeft.rotation.z = Math.PI / 2;
		rollingSideWalkLeft.position.x = -12;
		rollingSideWalkLeft.position.y = -20;
		rollingSideWalkLeft.position.z = 3;
		scene.add(rollingSideWalkLeft);
		streetLampLeft();
	}

	function addWallRight() {
		var cylinderGeo = new THREE.CylinderGeometry(30, 30, 12, 200, 1);
		var texture = new THREE.TextureLoader().load("../assets/textures/wall3.jpg");
		texture.rotation = Math.PI / 2;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(8, 8);
		var cylinderMat = new THREE.MeshPhongMaterial({
			// color: 0x4f5150,
			side: THREE.DoubleSide,
			map: texture,
		});
		rollingWallRight = new THREE.Mesh(cylinderGeo, cylinderMat);
		rollingWallRight.receiveShadow = true;
		rollingWallRight.rotation.z = Math.PI / 2;
		rollingWallRight.position.x = 22;
		rollingWallRight.position.y = -20;
		rollingWallRight.position.z = 3;
		scene.add(rollingWallRight);
		streetLampRight();
	}

	function addWallLeft() {
		var cylinderGeo = new THREE.CylinderGeometry(30, 30, 12, 200, 1);
		var texture = new THREE.TextureLoader().load("../assets/textures/wall3.jpg");
		texture.rotation = Math.PI;
		texture.wrapS = THREE.RepeatWrapping;
		texture.wrapT = THREE.RepeatWrapping;
		texture.repeat.set(8, 8);
		var cylinderMat = new THREE.MeshPhongMaterial({
			// color: 0x4f5150,
			side: THREE.DoubleSide,
			map: texture,
		});
		rollingWallLeft = new THREE.Mesh(cylinderGeo, cylinderMat);
		rollingWallLeft.receiveShadow = true;
		rollingWallLeft.rotation.z = Math.PI / 2;
		rollingWallLeft.position.x = -22;
		rollingWallLeft.position.y = -20;
		rollingWallLeft.position.z = 3;
		scene.add(rollingWallLeft);
	}

	function addRobo() {
		mixer = new THREE.AnimationMixer(robo);
		var action = mixer.clipAction(robo.animations[0]);
		action.play();
		robo.traverse(function (node) {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		robo.position.set(currentLane, -1.5, 8);
		robo.scale.set(0.006, 0.006, 0.006);
		robo.rotation.set(0, Math.PI, 0);
		currentLane = midLane;
		robo.position.x = currentLane;
		scene.add(robo);
	}

	function streetLampLeft() {
		var loader = new FBXLoader();
		loader.load("assets/model/StreetLamp2.fbx", function (lamp) {
			lamp.traverse(function (node) {
				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
			lamp.position.set(-11, -1, 0);
			lamp.scale.set(0.017, 0.017, 0.017);
			lamp.rotation.set(0, Math.PI / 2, 0);
			scene.add(lamp);
		});
	}

	function streetLampRight() {
		var loader = new FBXLoader();
		loader.load("assets/model/StreetLamp2.fbx", function (lamp) {
			lamp.traverse(function (node) {
				if (node.isMesh) {
					node.castShadow = true;
					node.receiveShadow = true;
				}
			});
			lamp.position.set(11, -1, 0);
			lamp.scale.set(0.017, 0.017, 0.017);
			lamp.rotation.set(0, Math.PI / 2, 0);
			scene.add(lamp);
		});
	}

	function addLight() {
		var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.7);
		hemisphereLight.position.set(0, 37, 4);
		// hemisphereLight.castShadow = true;
		scene.add(hemisphereLight);
		sun = new THREE.DirectionalLight(0xcdc1c5, 0.7);
		sun.position.set(37, 37, 4);
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

		robo.position.x = THREE.Math.lerp(robo.position.x, currentLane, 600 * clock.getDelta()); //clock.getElapsedTime());
		console.log(currentLane);

		rollingStreet.rotation.x += rollingSpeed;
		rollingSideWalkRight.rotation.x += rollingSpeed;
		rollingSideWalkLeft.rotation.x += rollingSpeed;
		rollingWallRight.rotation.x += rollingSpeed;
		rollingWallLeft.rotation.x += rollingSpeed;

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
});
