//Henry Owen

//Sweep and Prune broad-phase algorithm
//Thanks to http://www.codercorner.com/SAP.pdf <-- for general explanation
//and https://github.com/mattleibow/jitterphysics/wiki/Sweep-and-Prune <--for SortAxis function
import * as THREE from "three";
import { config } from './Config.js';
import { Endpoint } from './Endpoint.js';
import { addPlaneCollision, addParticleCollision } from './PhysicsEngine.js';
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
			this.pairs [i][j] = 1;
		},
		
		removePair: function(i, j){ //indicies
			this.pairs [i][j] = 0;
		},

		getCollisionPairs: function(){
			let cols = [];
			for (let i = 0; i < bodies.length; i++){
				for (let j = bodies.length-1; j > i; j--){
					if (this.pairs [i][j] == 1 || this.pairs[j][i] == 1) {
						cols.push(addParticleCollision(bodies[i], bodies[j]));
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
	for (let i = 0; i < bodies.length; i++) {
		let tmp = [];
		for (let j = 0; j < bodies.length; j++) {
			tmp.push(0);
		}
		pm.pairs.push(tmp);
	}
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
	return cols.concat(pm.getCollisionPairs());
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

const wallCollisions = () => {
	let wallCols = [];
	//top, bottom, front, back, left, right
	bodies.forEach((body) => {
		//bottom
		if (body.mins [1].value < -config.activeBounds/2 + boundsTol + SAPtol) {
			wallCols.push (addPlaneCollision(body, bottomBody, up, body.velocityVector));
		}
		if( config.hasBounds){
			//top
			if (body.maxs [1].value > config.activeBounds/2 - boundsTol - SAPtol) {
				wallCols.push (addPlaneCollision(body, topBody, down, body.velocityVector));
			}
			//front // front and back switched in Unity >>> threejs
			if (body.mins [2].value < -config.activeBounds/2 + boundsTol + SAPtol) {
				wallCols.push (addPlaneCollision(body, backBody, vForward, body.velocityVector));
			}
			//back
			else if (body.maxs [2].value > config.activeBounds/2 - boundsTol - SAPtol) {
				wallCols.push (addPlaneCollision(body, frontBody, vBackward, body.velocityVector));
			}
			//left
			if (body.mins [0].value < -config.activeBounds/2 + boundsTol + SAPtol) {
				wallCols.push (addPlaneCollision(body, leftBody, vRight, body.velocityVector));
			}
			//right
			else if (body.maxs [0].value > config.activeBounds/2 - boundsTol - SAPtol) {
				wallCols.push (addPlaneCollision(body, rightBody, vLeft, body.velocityVector));
			}
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

		body.maxs [0].value = pos.x + rad + SAPtol;
		body.maxs [1].value = pos.y + rad + SAPtol;
		body.maxs [2].value = pos.z + rad + SAPtol;
	});
	SortAxis (xEndPoints);
	SortAxis (yEndPoints);
	SortAxis (zEndPoints);
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

			else if (!keyelement.isMin && swapper.isMin)
			{
				pm.removePair(swapper.body.index, keyelement.body.index);
			}

			axis[i + 1] = swapper;
			i = i - 1;
		}
		axis[i + 1] = keyelement;
	}
}

const CheckBoundingBoxes = (a, b) => {
	if (a.mins[0] < b.maxs[0]) return false; // a is left of b
	if (a.maxs[0] < b.mins[0]) return false; // 
	if (a.mins[1] < b.maxs[1]) return false; // 
	if (a.maxs[1] < b.mins[1]) return false; //
	if (a.mins[2] < b.maxs[2]) return false; //
	if (a.maxs[2] < b.mins[2]) return false; //
	return true; // boxes overlap
}
