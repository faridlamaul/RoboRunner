window.addEventListener("load", init, false);

var camera,
	scene,
	renderer,
	dom,
	rollingGround,
	sceneHeight,
	sceneWidth,
	rollingSpeed = 0.005;

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
	loader.load("assets/textures/street.jpg");
	scene.background = loader.load("assets/textures/redsky.jpg");
	// add fog
	scene.fog = new THREE.FogExp2(0x9d3f0b, 0.15);
	// set camera
	camera = new THREE.PerspectiveCamera(75, sceneWidth / sceneHeight, 0.2, 1000);
	// render
	renderer = new THREE.WebGLRenderer();
	renderer.setSize(sceneWidth, sceneHeight);
	document.body.appendChild(renderer.domElement);
	// add game object
	addWorld();
	// set camera to 3rd person camera
	camera.position.z = 25;
	camera.position.y = 5;
}

function addWorld() {
	var cylinderGeo = new THREE.CylinderGeometry(35, 35, 10, 200, 1, true);
	var texture = THREE.ImageUtils.loadTexture("assets/textures/desert.jpg");
	texture.wrapS = THREE.RepeatWrapping;
	texture.wrapT = THREE.RepeatWrapping;
	texture.repeat.set(1, 3);
	var cylinderMat = [];
	cylinderMat.push(
		new THREE.MeshBasicMaterial({
			color: 0xd24e06,
			side: THREE.DoubleSide,
			map: texture,
		})
	);
	rollingGround = new THREE.Mesh(cylinderGeo, cylinderMat);
	rollingGround.rotation.z = -Math.PI / 2;
	rollingGround.position.y = -24;
	rollingGround.position.z = 2;
	scene.add(rollingGround);
}

function addRobo() {}

function addTree() {}

function update() {
	// animate
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
