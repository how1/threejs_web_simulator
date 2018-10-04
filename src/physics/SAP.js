//Sweep and Prune broad-phase algorithm
//Thanks to http://www.codercorner.com/SAP.pdf <-- for general explanation
//and https://github.com/mattleibow/jitterphysics/wiki/Sweep-and-Prune <--for SortAxis function
import * as THREE from "three";
import { config } from './Config.js';
import { Endpoint } from './EndPoint.js';
import { addPlaneCollision, addParticleCollision } from './Test.js';
import {
	bottomBody,
	up,
	topBody,
	down,
	leftBody,
	vRight,
	rightBody,
	vLeft,
	frontBody,
	vBackward,
	backBody,
	vForward
} from "./RenderPlanes.js";

let SAPtol = 0.2;
let boundsTol = 0.4;
let bodies = [];
let pm;

let xEndPoints = [];
let yEndPoints = [];
let zEndPoints = [];

const pairManager = () => {
	return {
		pairs: [],

		addPair: function(i, j){ //integer indices of two bodies
			this.pairs [i, j] = 1;
		},
		
		removePair: function(i, j){ //indicies
			this.pairs [i, j] = 0;
		},

		getCollisionPairs: function(){
			let cols = [];
			for (let i = 0; i < bodies.length; i++) {
				for (let j = 0; j < bodies.length; j++) {
					if (this.pairs [i, j] == 1) {
						cols.push (addParticleCollision(bodies[i], bodies[j]));
					}
				}
			}
			return cols;
		}
	}
}

export const startSweepAndPrune = (b) => {
	bodies = b;
	pm = pairManager (bodies);
	let i = 0;
	bodies.forEach((b, i) => {
		b.index = i;
	});
	xEndPoints = [];
	yEndPoints = [];
	zEndPoints = [];
	bodies.forEach((body) => {
		body.mins = [];
		body.maxs = [];
	});
	setEndPoints ();
}

export const getSAPCollisions = () => {
	updateEndpoints();
	let cols = [];
	cols = wallCollisions ();
	cols.concat(pm.getCollisionPairs ());
	return cols;
}

const setEndPoints = () => {
	xEndPoints = [];
	yEndPoints = [];
	zEndPoints = [];

	for (let i = 0; i < bodies.length; i++) {
		let rad = bodies [i].radius;
		let pos = new THREE.Vector3();
		pos.copy(bodies[i].mesh.position);
		let xMin = Endpoint (bodies [i], pos.x - rad - SAPtol, true);
		let yMin = Endpoint (bodies [i], pos.y - rad - SAPtol, true);
		let zMin = Endpoint (bodies [i], pos.z - rad - SAPtol, true);

		let xMax = Endpoint (bodies [i], pos.x + rad + SAPtol, false);
		let yMax = Endpoint (bodies [i], pos.y + rad + SAPtol, false);
		let zMax = Endpoint (bodies [i], pos.z + rad + SAPtol, false);

		bodies [i].mins.push(xMin);
		bodies [i].mins.push(yMin);
		bodies [i].mins.push(zMin);

		bodies [i].maxs.push(xMax);
		bodies [i].maxs.push(yMax);
		bodies [i].maxs.push(zMax);

		xEndPoints.push (xMin);
		yEndPoints.push (yMin);
		zEndPoints.push (zMin);

		xEndPoints.push (xMax);
		yEndPoints.push (yMax);
		zEndPoints.push (zMax);

	}
	sortEndpoints ();
}

const Compare = (a,b) => {
	if (a.value > b.value){
		return 1;
	} else if (a.value < b.value){
		return -1;
	} else {
		return 0;
	}
}
				
const sortEndpoints = () => {
	xEndPoints.sort ((a,b) => Compare(a,b));
	yEndPoints.sort ((a,b) => Compare(a,b));
	zEndPoints.sort ((a,b) => Compare(a,b));
}

const overlapTest = (i, k) => {
	let a = bodies [i];
	let b = bodies [k];
	if (a.mins [0].value < b.mins [0].value && a.maxs [0].value > b.mins [0].value 
		|| b.mins [0].value < a.mins [0].value && b.maxs [0].value > a.mins [0].value
		|| a.mins[0].value > b.mins[0].value && a.maxs[0].value < b.maxs[0].value
		|| b.mins[0].value > a.mins[0].value && b.maxs[0].value < a.maxs[0].value) {
		if (a.mins [1].value < b.mins [1].value && a.maxs [1].value > b.mins [1].value 
			|| b.mins [1].value < a.mins [1].value && b.maxs [1].value > a.mins [1].value
			|| a.mins[1].value > b.mins[1].value && a.maxs[1].value < b.maxs[1].value
			|| b.mins[1].value > a.mins[1].value && b.maxs[1].value < a.maxs[1].value) {
			if (a.mins [2].value < b.mins [2].value && a.maxs [2].value > b.mins [2].value 
				|| b.mins [2].value < a.mins [2].value && b.maxs [2].value > a.mins [2].value
				|| a.mins[2].value > b.mins[2].value && a.maxs[2].value < b.maxs[2].value
				|| b.mins[2].value > a.mins[2].value && b.maxs[2].value < a.maxs[2].value) {
				pm.addPair (i, k);
				return true;
			}
		}
	}
	return false;
}

const wallCollisions = () => {
	let wallCols = [];
	//top, bottom, front, back, left, right
	bodies.forEach((body) => {
		//bottom
		if (body.mins [1].value < -config.bounds/2 + boundsTol + SAPtol) {
			wallCols.push (addPlaneCollision(body, bottomBody, up, body.velocityVector));
		}
		//top
		else if (body.maxs [1].value > config.bounds/2 - boundsTol - SAPtol) {
			wallCols.push (addPlaneCollision(body, topBody, down, body.velocityVector));
		}
		//front
		if (body.mins [2].value < -config.bounds/2 + boundsTol + SAPtol) {
			wallCols.push (addPlaneCollision(body, backBody, vForward, body.velocityVector));
		}
		//back
		else if (body.maxs [2].value > config.bounds/2 - boundsTol - SAPtol) {
			wallCols.push (addPlaneCollision(body, frontBody, vBackward, body.velocityVector));
		}
		//left
		if (body.mins [0].value < -config.bounds/2 + boundsTol + SAPtol) {
			wallCols.push (addPlaneCollision(body, leftBody, vRight, body.velocityVector));
		}
		//right
		else if (body.maxs [0].value > config.bounds/2 - boundsTol - SAPtol) {
			wallCols.push (addPlaneCollision(body, rightBody, vLeft, body.velocityVector));
		}
	});
	return wallCols;
}

const updateEndpoints = () => {
	bodies.forEach((body) => {
		let rad = body.radius;
		let pos = new THREE.Vector3();
		pos.copy( body.mesh.position );
		body.mins [0].value = pos.x - rad - SAPtol;
		body.mins [1].value = pos.y - rad - SAPtol;
		body.mins [2].value = pos.z - rad - SAPtol;

		body.maxs[0].value = pos.x + rad + SAPtol;
		body.maxs[1].value = pos.y + rad + SAPtol;
		body.maxs[2].value = pos.z + rad + SAPtol;
	});
	SortAxis (xEndPoints);
	SortAxis (yEndPoints);
	SortAxis (zEndPoints);
}

const InsertionSort = (list) => {
	let i = 1;
	while (i < list.length) {
		let j = i;
		while (j > 0 && list [j - 1].value > list [j].value) {
			Swap (list [j], list [j - 1]);
			j -= 1;
		}
		i++;
	}
}

const Swap = ( a, b ) => {
	let tmp = a;
	a = b;
	b = tmp;

	if (b.isMin && !a.isMin) {
		if (!overlapTest (a.body.index, b.body.index)) {
			pm.removePair (a.body.index, b.body.index);
		}
	} else if (!b.isMin && a.isMin) {
		if (overlapTest (a.body.index, b.body.index)) {
			pm.addPair (a.body.index, b.body.index);
		}
	}
}

const SortAxis = ( axis ) => { //https://github.com/mattleibow/jitterphysics/wiki/Sweep-and-Prune
	for (let j = 1; j < axis.length; j++)
	{
		let keyelement = axis[j];
		let key = keyelement.value;

		let i = j - 1;

		while (i >= 0 && axis[i].value > key)
		{
			let swapper = axis[i];

			if (keyelement.isMin && !swapper.isMin)
			{
				if (CheckBoundingBoxes(swapper.body, keyelement.body))
				{
					pm.addPair(swapper.body.index, keyelement.body.index);
				}
			}

			if (!keyelement.isMin && swapper.isMin)
			{
				pm.removePair(swapper.body.index, keyelement.body.index);
			}

			axis[i + 1] = swapper;
			i = i - 1;
		}
		axis[i + 1] = keyelement;
	}
}

const CheckBoundingBoxes = (a1, b1) => {
	let a = new THREE.Vector3();
	a.copy(a1.mesh.position);
	let aRad = a1.radius;
	let b = new THREE.Vector3();
	b.copy(b1.mesh.position);
	let bRad = b1.radius;
	if (a.x + aRad +SAPtol < b.x - bRad -SAPtol) return false; // a is left of b
	if (a.x - aRad -SAPtol > b.x + bRad +SAPtol) return false; // a is right of b
	if (a.y + aRad +SAPtol < b.y - bRad -SAPtol) return false; // a is left of b
	if (a.y - aRad -SAPtol > b.y + bRad +SAPtol) return false; // a is right of b
	if (a.z + aRad +SAPtol < b.z - bRad -SAPtol) return false; // a is left of b
	if (a.z - aRad -SAPtol > b.z + bRad +SAPtol) return false; // a is right of b
	return true; // boxes overlap
}
