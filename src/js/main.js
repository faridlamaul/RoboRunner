import * as THREE from "../../lib/three.module.js";
import { FBXLoader } from "../FBXLoader.js";
import { OrbitControls } from "../OrbitControls.js";

document.getElementById("myForm").addEventListener("submit", init);
var camera,
	scene,
	renderer,
	mixer,
	streetRadius = 19,
	rollingStreet,
	rollingSideWalkRight,
	rollingSideWalkLeft,
	rollingWallRight,
	rollingWallLeft,
	sceneHeight,
	sceneWidth,
	rollingSpeed = 0.015,
	sun,
	robo = new THREE.Object3D(),
	currentLane,
	midLane = 0,
	leftLane = -5,
	rightLane = 5,
	sphericalHelper,
	pathAngleValues,
	clock,
	ObstacleReleaseInterval = 1.1,
	lastObstacleReleaseTime = 0,
	ObstaclesInPath,
	ObstaclesPool,
	hasCollided,
	particleGeometry,
	particleCount = 20,
	scoreText,
	score;

function init() {
	// set up the scene
	createScene();
	// call game loop
	update();
}

function createScene() {
	hasCollided = false;
	score = 0;
	ObstaclesInPath = [];
	ObstaclesPool = [];
	clock = new THREE.Clock();
	clock.start();

	sphericalHelper = new THREE.Spherical();
	pathAngleValues = [1.52, 1.57, 1.62];

	sceneWidth = window.innerWidth;
	sceneHeight = window.innerHeight;
	// create 3D scene
	scene = new THREE.Scene();
	// add sky
	var loader = new THREE.TextureLoader();
	scene.background = loader.load("assets/textures/cityrobot.jpg");
	// add fog
	scene.fog = new THREE.FogExp2(0x292828, 0.03);
	// set camera
	camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.2, 1000);
	// render
	renderer = new THREE.WebGLRenderer();
	renderer.shadowMap.enabled = true; //enable shadow
	renderer.shadowMap.type = THREE.PCFSoftShadowMap;
	renderer.setSize(sceneWidth, sceneHeight);
	document.body.appendChild(renderer.domElement);
	// add game object
	createObstaclesPool();
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

	// helper to rotate around in scene
	var orbitControl = new OrbitControls(camera, renderer.domElement);
	orbitControl.addEventListener("change", render);
	orbitControl.noKeys = true;
	orbitControl.noPan = true;
	orbitControl.enableZoom = false;
	orbitControl.minPolarAngle = 1.24;
	orbitControl.maxPolarAngle = 1.24;
	orbitControl.minAzimuthAngle = -0.2;
	orbitControl.maxAzimuthAngle = 0.2;

	window.addEventListener("resize", onWindowResize, false);
	document.onkeydown = handleKeyDown;

	scoreText = document.getElementById("currScore");

	// debugging
	// const controls = new OrbitControls(camera, renderer.domElement);
	// controls.enablePan = false;
	// controls.enableZoom = false;
	// controls.target.set(0, 2, 0);
	// controls.update();
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
	var cylinderGeo = new THREE.CylinderGeometry(streetRadius, streetRadius, 20, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/street.jpg");
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
	addWorldObstacles();
}

function addSideWalkRight() {
	var cylinderGeo = new THREE.CylinderGeometry(19.5, 19.5, 5, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/sidewalk.jpg");
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
}

function addSideWalkLeft() {
	var cylinderGeo = new THREE.CylinderGeometry(19.5, 19.5, 5, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/sidewalk.jpg");
	texture.rotation = Math.PI;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(15, 1);
	var cylinderMat = new THREE.MeshPhongMaterial({
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
}

function addWallRight() {
	var cylinderGeo = new THREE.CylinderGeometry(30, 30, 12, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/wall.jpg");
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
}

function addWallLeft() {
	var cylinderGeo = new THREE.CylinderGeometry(30, 30, 12, 200, 1);
	var texture = new THREE.TextureLoader().load("../assets/textures/wall.jpg");
	texture.rotation = Math.PI;
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(8, 8);
	var cylinderMat = new THREE.MeshPhongMaterial({
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
	var loader = new FBXLoader();
	loader.load("assets/model/Running.fbx", function (model) {
		mixer = new THREE.AnimationMixer(model);
		var action = mixer.clipAction(model.animations[0]);
		action.play();
		model.traverse(function (node) {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		model.position.set(currentLane, -1.5, 8);
		model.scale.set(0.005, 0.005, 0.005);
		model.rotation.set(0, Math.PI, 0);
		currentLane = midLane;
		model.position.x = currentLane;
		robo = model;
		scene.add(model);
	});
}

function addLight() {
	var hemisphereLight = new THREE.HemisphereLight(0xfffafa, 0x000000, 0.8);
	hemisphereLight.position.set(0, 37, -20);
	scene.add(hemisphereLight);
	sun = new THREE.DirectionalLight(0xf2d5a2);
	sun.position.set(37, 37, -20);
	sun.castShadow = true;
	scene.add(sun);

	//Set up shadow properties for the sun light
	sun.shadow.mapSize.width = 256;
	sun.shadow.mapSize.height = 256;
	sun.shadow.camera.near = 0.5;
	sun.shadow.camera.far = 50;
}

function createObstaclesPool() {
	var maxObstaclesInPool = 15;
	var newRock;
	for (var i = 0; i < maxObstaclesInPool; i++) {
		newRock = createObstacle();
		ObstaclesPool.push(newRock);
	}
}

function addPathObstacle() {
	var options = [0, 1, 2];
	var lane = Math.floor(Math.random() * 3);
	// addObstacle(true, lane);
	options.splice(lane, 1);
	if (Math.random() > 0.5) {
		lane = Math.floor(Math.random() * 2);
		addObstacle(true, options[lane]);
	}
}

function addWorldObstacles() {
	var numObstacles = 10;
	var gap = 25 / 10;
	for (var i = 0; i < numObstacles; i++) {
		addObstacle(false, i * gap - 0.5, true);
		addObstacle(false, i * gap, false);
	}
}

function addObstacle(inPath, row, isLeft) {
	var newRock;
	if (inPath) {
		if (ObstaclesPool.length == 0) return;
		newRock = ObstaclesPool.pop();
		newRock.visible = true;
		console.log("add tree");
		ObstaclesInPath.push(newRock);
		sphericalHelper.set(streetRadius - 0.3, pathAngleValues[row], -rollingStreet.rotation.x + 4);
	} else {
		newRock = createObstacle();
		var forestAreaAngle = 0;
		if (isLeft) {
			forestAreaAngle = 1.7 + Math.random() * 0.3;
		} else {
			forestAreaAngle = 1.4 - Math.random() * 0.3;
		}
		sphericalHelper.set(streetRadius, forestAreaAngle, row);
	}
	newRock.position.setFromSpherical(sphericalHelper);
	var rollingGroundVector = rollingStreet.position.clone().normalize();
	var ObstacleVector = newRock.position.clone().normalize();
	newRock.quaternion.setFromUnitVectors(ObstacleVector, rollingGroundVector);
	newRock.rotation.x += Math.random() * ((2 * Math.PI) / 10) + -Math.PI / 10;
	rollingStreet.add(newRock);
}

function createObstacle() {
	var rock = new THREE.Object3D();
	var loader = new FBXLoader();
	loader.load("assets/model/Rock.fbx", function (model) {
		model.traverse(function (node) {
			if (node.isMesh) {
				node.castShadow = true;
				node.receiveShadow = true;
			}
		});
		model.scale.set(0.15, 0.15, 0.15);
		model.rotation.set(0, Math.PI / 2, 0);
		rock.add(model);
	});
	return rock;
}

function update() {
	// animate
	const delta = clock.getDelta();

	if (mixer) mixer.update(delta);

	if (robo) robo.position.x = THREE.Math.lerp(robo.position.x, currentLane, 600 * clock.getDelta()); //clock.getElapsedTime());
	console.log(currentLane);

	rollingStreet.rotation.x += rollingSpeed;
	rollingSideWalkRight.rotation.x += rollingSpeed;
	rollingSideWalkLeft.rotation.x += rollingSpeed;
	rollingWallRight.rotation.x += rollingSpeed;
	rollingWallLeft.rotation.x += rollingSpeed;

	if (clock.getElapsedTime() > ObstacleReleaseInterval) {
		clock.start();
		addPathObstacle();
		if (!hasCollided) {
			score++;
			scoreText.innerHTML = score.toString();
		}
	}

	doObstacleLogic();
	render();
	// request next update
	requestAnimationFrame(update);
}

function doObstacleLogic() {
	var oneObstacle;
	var ObstaclePos = new THREE.Vector3();

	var ObstaclesToRemove = [];
	ObstaclesInPath.forEach(function (element, index) {
		oneObstacle = ObstaclesInPath[index];
		ObstaclePos.setFromMatrixPosition(oneObstacle.matrixWorld);
		if (ObstaclePos.z > 14 && oneObstacle.visible) {
			// gone out of our view zone
			ObstaclesToRemove.push(oneObstacle);
		} else {
			// check collision
			if (ObstaclePos.distanceTo(robo.position) <= 0.1) {
				console.log("hit");
				hasCollided = true;
			}
		}
	});

	var fromWhere;
	ObstaclesToRemove.forEach(function (element, index) {
		oneObstacle = ObstaclesToRemove[index];
		fromWhere = ObstaclesInPath.indexOf(oneObstacle);
		ObstaclesInPath.splice(fromWhere, 1);
		ObstaclesPool.push(oneObstacle);
		oneObstacle.visible = false;
		console.log("remove obstacle");
	});
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
