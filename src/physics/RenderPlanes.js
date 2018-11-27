import * as THREE from "three";
import { config } from "./Config.js";
import { Plane } from './Plane.js';
import { scene } from './Initialize.js';


export let bottomBody;
export let up;
export let topBody;
export let down;
export let leftBody;
export let vRight;
export let rightBody;
export let vLeft;
export let frontBody;
export let vBackward;
export let backBody;
export let vForward;

export const makePlanes = (scene, bounds) => {
	const planeMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.BackSide});
	const planeGeometry = new THREE.PlaneGeometry(bounds, bounds);

	if (config.hasBounds){

	//floor
		const bottom = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(bottom);
		bottomBody = Plane(bottom, 'bottom', new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,0), new THREE.Vector3(0,-bounds/2,0));
		up = new THREE.Vector3(0,1,0);
		bottom.position.y = -bounds/2;
		bottom.rotation.x = Math.PI / 2;

	//top
		const top = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(top);
		topBody = Plane(top, 'top', new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,0), new THREE.Vector3(0,bounds/2,0));
		down = new THREE.Vector3(0,-1,0);
		top.position.y = bounds/2;
		top.rotation.x = -Math.PI / 2;

	//left
		const left = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(left);
		leftBody = Plane(left, 'left', new THREE.Vector3(0,0,1), new THREE.Vector3(0,1,0), new THREE.Vector3(-bounds/2,0,0));
		vRight = new THREE.Vector3(1,0,0);
		left.position.x = -bounds/2;
		left.rotation.y = -(Math.PI / 2);

	//right
		const right = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(right);
		rightBody = Plane(right, 'right', new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,-1), new THREE.Vector3(bounds/2,0,0));
		vLeft = new THREE.Vector3(-1,0,0);
		right.position.x = bounds/2;
		right.rotation.y = Math.PI / 2;

	//back
		const back = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(back);
		backBody = Plane(back, 'back', new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,-bounds/2));
		vForward = new THREE.Vector3(0,0,1);
		back.position.z = bounds/2;

	//front
		const front = new THREE.Mesh(planeGeometry, planeMaterial);
		scene.add(front);
		frontBody = Plane(front, 'front', new THREE.Vector3(1,0,0), new THREE.Vector3(0,1,0), new THREE.Vector3(0,0,bounds/2));
		vBackward = new THREE.Vector3(0,0,-1);
		front.position.z = -bounds/2;
		front.rotation.y = Math.PI;
	}

	else {
		//floor
		const invisiblePlaneMaterial = new THREE.MeshPhongMaterial( {color: 0xffffff, side: THREE.FrontSide});
		const bottom = new THREE.Mesh(planeGeometry, invisiblePlaneMaterial);
		scene.add(bottom);
		bottomBody = Plane(bottom, 'bottom', new THREE.Vector3(0,0,1), new THREE.Vector3(1,0,0), new THREE.Vector3(0,-config.activeBounds/2,0));
		up = new THREE.Vector3(0,1,0);
		bottom.position.y = -config.activeBounds/2;
		bottom.rotation.x = Math.PI / 2;
	}

}