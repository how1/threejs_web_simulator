import * as THREE from 'three';
import  "./OrbitControls.js";
import { CheckForCollision, addParticleCollision, PENETRATING, NOCOLLISION, CONTACT } from "./Test.js";
import { config } from "./Config.js";
import { Particle } from "./Particle.js";
import	"./Plane.js";
import	"./Simple.js";
import { CollisionObject } from "./CollisionObject.js";
import	{ makePlanes } from "./RenderPlanes.js";
import { startSweepAndPrune } from "./SAP.js";


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

camera.position.z = 100;

export let bodies = [];
let spheres = [];

// document.createElement('img')
export const init = () => {

	// var node = document.createElement("LI");
 //    var textnode = document.createTextNode("Water");
 //    node.appendChild(textnode);
 //    document.getElementById("myList").appendChild(node);
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

	let controls = new THREE.OrbitControls(camera, renderer.domElement);

	const directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
	directionalLight.position.set( 1, 1, 0 );
	scene.add(directionalLight);

	const ambientLight = new THREE.AmbientLight( 0xcccccc, 1 );
	scene.add(ambientLight);


	makePlanes(scene, config.bounds);


	spheres = [];

	// const NOCOLLISION = 0;
	// const CONTACT = 1;
	// const PENETRATING = 2;

	const createSphere = (radius, mass, pos) => {
		const blue = 0x0000ff;
		const sphereGeometry = new THREE.SphereGeometry( radius, config.sphereVerts, config.sphereVerts );
		const sphereMaterial = new THREE.MeshPhongMaterial( {color: blue} );
		const sphere = new THREE.Mesh( sphereGeometry, sphereMaterial );
		const body = Particle(sphere, radius, mass);
		spheres.push(sphere);
		const indices = [-1,1];
		let fail = true;
		if (bodies.length > 0){
			while(fail){
				fail = false;
				const xPos = Math.random() * (config.bounds/2-radius) * indices[Math.floor(Math.random() * 2)];
				const yPos = Math.random() * (config.bounds/2-radius) * indices[Math.floor(Math.random() * 2)];
				const zPos = Math.random() * (config.bounds/2-radius) * indices[Math.floor(Math.random() * 2)];
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
		}
		bodies.push(body);
		scene.add(sphere);
	};
	let radius = config.radius;
	// createSphere(radius, 1, new THREE.Vector3(0,45,0));

	for (let x = 0; x < config.numObjects; x++){
		// createSphere(radius, 1, new THREE.Vector3(-1,-config.bounds/2+radius+4,0));	
		// createSphere(radius, 1, new THREE.Vector3(0,-config.bounds/2+radius+3,-20));	
		// createSphere(radius, 1, new THREE.Vector3(1,-config.bounds/2+radius+2, 15));	
		createSphere(radius, config.mass, new THREE.Vector3(0,0,0));	
	}


	let index = [-1, 1];
	bodies.forEach((body) => {
		const speed = config.initialVelocity;
		let posNeg = Math.floor(Math.random() * 2);
		let directionX = index[posNeg];
		posNeg = Math.floor(Math.random() * 2);
		let directionY = index[posNeg];
		posNeg = Math.floor(Math.random() * 2);
		let directionZ = index[posNeg];
		let initVel = new THREE.Vector3(Math.random() * directionX, Math.random(0) * directionY, Math.random() * directionZ);
		body.AddForce(initVel.multiplyScalar(speed * body.mass));
	});

	// document.getElementById('loader').style = "display:none";	

	if (config.whichBroad == 2){
		startSweepAndPrune(bodies);
	}

}