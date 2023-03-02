import * as THREE from 'three';
import  {OrbitControls} from "./OrbitControls.js";
import { CheckForCollision, addParticleCollision, PENETRATING, NOCOLLISION, CONTACT } from "./PhysicsEngine.js";
import { config } from "./Config.js";
import { Particle } from "./Particle.js";
import	"./Plane.js";
import	"./Simple.js";
import { CollisionObject } from "./CollisionObject.js";
import	{ makePlanes } from "./RenderPlanes.js";
import { startSweepAndPrune } from "./SAP.js";
import { startSpatialMasking } from "./SpatialMasking.js";
import "../styles/components/loader.scss";


(function(){var script=document.createElement('script');script.onload=function(){var stats=new Stats();document.body.appendChild(stats.dom);requestAnimationFrame(function loop(){stats.update();requestAnimationFrame(loop)});};script.src='//rawgit.com/mrdoob/stats.js/master/build/stats.min.js';document.head.appendChild(script);})()

export let scene = new THREE.Scene();
export let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10001);
export let renderer = new THREE.WebGLRenderer();

let width = window.innerWidth;
let height = window.innerHeight;
renderer.setSize( width, height );
document.body.appendChild( renderer.domElement );

window.addEventListener('resize', () => {
	width = window.innerWidth;
	height = window.innerHeight;
	renderer.setSize(width, height);
	camera.aspect = width/height;
	camera.updateProjectionMatrix();
});

camera.position.z = 120;

export let bodies = [];
let spheres = [];

export const init = () => {
 	
 	spheres.forEach((sphere) => {
		// sphere.geometry.deallocate();
		sphere.geometry.dispose();
		sphere.geometry = undefined;
		// sphere.material.deallocate();
		sphere.material.dispose();
		sphere.material = undefined;
		scene.remove(sphere);
	});
	renderer.dispose();
	scene = undefined;
	
	scene = new THREE.Scene();
	bodies = [];

	config.hasBounds = config.activeHasBounds;

	let controls = new OrbitControls(camera, renderer.domElement);

	const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 1, 1, 0 );
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
	scene.add(ambientLight);

	// config.activeBounds = config.bounds;
	makePlanes(scene, config.activeBounds);

	spheres = [];

	// const NOCOLLISION = 0;
	// const CONTACT = 1;
	// const PENETRATING = 2;
	let tooManyObjects = false;
	const createSphere = (radius, mass, pos) => {

		const blue = 0x0000ff;
		let colors = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
		let r1 = Math.floor(Math.random() * colors.length);
		let r2 = Math.floor(Math.random() * colors.length);
		let g1 = Math.floor(Math.random() * colors.length);
		let g2 = Math.floor(Math.random() * colors.length);
		let b1 = Math.floor(Math.random() * colors.length);
		let b2 = Math.floor(Math.random() * colors.length);
		let color = '0x' + colors[r1] + colors[r2] + colors[g1] + colors[g2] + colors[b1] + colors[b2];
		color = parseInt(color);

		const sphereGeometry = new THREE.SphereGeometry( radius, config.sphereVerts, config.sphereVerts );
		const sphereMaterial = new THREE.MeshPhongMaterial( {color: color} );
		const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
		const body = Particle(sphere, radius, mass);
		spheres.push(sphere);
		let fail = true;
		sphere.position.copy(pos);
		if (bodies.length > 0){
			let loop = 0;
			while(fail && loop < 100){
				loop++;
				fail = false;

				const xPos = getRandomPosition();
				const yPos = getRandomPosition();
				const zPos = getRandomPosition();

				// const xPos = 30; //x coll test
				// const yPos = -30;
				// const zPos = 0;

				pos = new THREE.Vector3(xPos, yPos, zPos);
				sphere.position.copy(pos);
				bodies.forEach((otherBody) => {
					if (body != otherBody){
						let result = CheckForCollision(addParticleCollision(body, otherBody));
						if (result == PENETRATING || result == CONTACT){
							fail = true;
						}
					}
				});
			}
			if (loop >= 100){
				tooManyObjects = true;
			}
		}
		
		bodies.push(body);
		scene.add(sphere);
	};

	let radius = config.radius;

	for (let x = 0; x < config.numObjects; x++){
		// createSphere(radius, 1, new THREE.Vector3(-1,-config.bounds/2+radius+4,0));	
		// createSphere(radius, 1, new THREE.Vector3(0,-config.bounds/2+radius+3,-20));	
		// createSphere(radius, 1, new THREE.Vector3(1,-config.bounds/2+radius+2, 15));	
		// createSphere(radius, config.mass, new THREE.Vector3(-30,-30,0)); //x coll test
		// createSphere(radius, config.mass, new THREE.Vector3(0,-30, 30)); //y coll test
		createSphere(radius, config.mass, new THREE.Vector3()); 
	}

	bodies.forEach((body) => {
		applyInitialVelocity(body, config.initialVelocity);
	});

	// bodies[0].AddForce(new THREE.Vector3(-config.initialVelocity, 0 ,0));//x coll test
	// bodies[1].AddForce(new THREE.Vector3(config.initialVelocity, 0 ,0));

	startSweepAndPrune(bodies);
	startSpatialMasking(radius, bodies);

}

export const createSingleSphere = (newObject) => {
	const blue = 0x0000ff;
	let colors = [0,1,2,3,4,5,6,7,8,9,'a','b','c','d','e','f'];
	let r1 = Math.floor(Math.random() * colors.length);
	let r2 = Math.floor(Math.random() * colors.length);
	let g1 = Math.floor(Math.random() * colors.length);
	let g2 = Math.floor(Math.random() * colors.length);
	let b1 = Math.floor(Math.random() * colors.length);
	let b2 = Math.floor(Math.random() * colors.length);
	let color = '0x' + colors[r1] + colors[r2] + colors[g1] + colors[g2] + colors[b1] + colors[b2];
	color = parseInt(color);

	const sphereGeometry = new THREE.SphereGeometry( newObject.radius, config.sphereVerts, config.sphereVerts );
	const sphereMaterial = new THREE.MeshPhongMaterial( {color: color} );
	const sphereMesh = new THREE.Mesh( sphereGeometry, sphereMaterial );
	const body = Particle(sphereMesh, newObject.radius, newObject.mass);
	spheres.push(sphereMesh);
	let fail = true;
	let pos = new THREE.Vector3();
	const xPos = getRandomPosition();
	const yPos = getRandomPosition();
	const zPos = getRandomPosition();
	pos = new THREE.Vector3(xPos, yPos, zPos);
	sphereMesh.position.copy(pos);
	if (bodies.length > 0){

		let removeThese = [];
		let removeTheseMeshes = [];
		bodies.forEach((otherBody) => {
			if (body != otherBody){
				let result = CheckForCollision(addParticleCollision(body, otherBody));
				if (result == PENETRATING || result == CONTACT){
					scene.remove(otherBody.mesh);
					removeThese.push(otherBody);
					removeTheseMeshes.push(otherBody.mesh);
				}
			}
		});
		let keepBodies = bodies.filter((body) => 
			!removeThese.includes(body)
		);
		bodies = keepBodies;
		spheres = spheres.filter((sphere) => 
			!removeTheseMeshes.includes(sphere)
		);
		removeTheseMeshes.forEach((sphere) => {
			sphere.geometry.dispose();
			sphere.geometry = undefined;
			sphere.material.dispose();
			sphere.material = undefined;
		});
	}
	
	bodies.push(body);
	scene.add(sphereMesh);
	applyInitialVelocity(body, newObject.initialVelocity);

	startSweepAndPrune(bodies);
	startSpatialMasking(config.radius, bodies);
}

const getRandomPosition = () => {
	const indices = [-1,1];
	return Math.random() * (config.activeBounds/2-config.radius) * indices[Math.floor(Math.random() * 2)];
}


const applyInitialVelocity = (body, initialVelocity) => {
	let index = [-1, 1];
	let posNeg = Math.floor(Math.random() * 2);
	let directionX = index[posNeg];
	posNeg = Math.floor(Math.random() * 2);
	let directionY = index[posNeg];
	posNeg = Math.floor(Math.random() * 2);
	let directionZ = index[posNeg];
	let initVel = new THREE.Vector3(Math.random() * directionX, Math.random(0) * directionY, Math.random() * directionZ);
	body.AddForce(initVel.multiplyScalar(initialVelocity * body.mass));
}

