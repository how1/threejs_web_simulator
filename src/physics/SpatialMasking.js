//Spatial Masking Broad-Phase algorithm
//Thanks to http://www.cs.cmu.edu/~jbruce/thesis/chapters/thesis-ch03.pdf
//for explanation of extent masks

import * as THREE from 'three';
import { addPlaneCollision, addParticleCollision } from './PhysicsEngine.js';
import { config } from './Config.js';
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

let bitmasks = [];
let bodies;
let totalRange;
let cellSize;
let boundsBitmasks = [];
let boundsBitmask;
let numberOfCells;

export const startSpatialMasking = (avgRadius, b) => {
	bodies = b;
	totalRange = config.bounds;
	bitmasks = [];
	if (totalRange / (config.radius * 2) < 64) {
		cellSize = config.radius * 2;
	} else
		cellSize = totalRange / 64;
	for (let x = 0; x < bodies.length; x++){
		let tmp = [0,0,0];
		bitmasks.push(tmp);
	}
	boundsBitmasks = [];
	let minMax = totalRange/2;

	boundsBitmasks.push(CalcBoundingBitmask (totalRange - cellSize * 3, totalRange - 1));// top
	boundsBitmasks.push(CalcBoundingBitmask (0, cellSize * 2));						 // bottom
	boundsBitmasks.push(CalcBoundingBitmask (0, cellSize * 2));						 // front
	boundsBitmasks.push(CalcBoundingBitmask (totalRange - cellSize * 3, totalRange - 1));// back
	boundsBitmasks.push(CalcBoundingBitmask (0, cellSize * 2));						 // left
	boundsBitmasks.push(CalcBoundingBitmask (totalRange - cellSize * 3, totalRange - 1));// right

	// console.log('top');
	// boundsBitmasks.push(CalcBoundingBitmask (minMax - cellSize * 3, minMax - 1));// top
	// console.log('bottom');
	// boundsBitmasks.push(CalcBoundingBitmask (-minMax, -minMax + cellSize * 2));						 // bottom
	// console.log('front');
	// boundsBitmasks.push(CalcBoundingBitmask (-minMax, -minMax + cellSize * 2));						 // front
	// console.log('back');
	// boundsBitmasks.push(CalcBoundingBitmask (minMax - cellSize * 3, minMax - 1));// back
	// console.log('left');
	// boundsBitmasks.push(CalcBoundingBitmask (-minMax, -minMax + cellSize * 2));						 // left
	// console.log('right');
	// boundsBitmasks.push(CalcBoundingBitmask (minMax - cellSize * 3, minMax - 1));// right
	
	boundsBitmasks = boundsBitmasks;
}

const CreateMask = () => {
	for (let i = 0; i < bodies.length; i++) {
		let ar = GetBitmask (bodies [i].mesh.position, bodies [i].radius);
		bitmasks [i][0] = ar [0];
		bitmasks [i][1] = ar [1];
		bitmasks [i][2] = ar [2];
	}
}

export const getSpatialMaskCollisions = () => {
	CreateMask ();
	let cols = [];

	// bodies.forEach((body) => {
	// 	cols.push(addPlaneCollision(body, bottomBody, up, body.velocityVector));
	// 	cols.push(addPlaneCollision(body, topBody, down, body.velocityVector));
	// 	cols.push(addPlaneCollision(body, leftBody, vRight, body.velocityVector));
	// 	cols.push(addPlaneCollision(body, rightBody, vLeft, body.velocityVector));
	// 	cols.push(addPlaneCollision(body, frontBody, vBackward, body.velocityVector));
	// 	cols.push(addPlaneCollision(body, backBody, vForward, body.velocityVector));
	// });


	bodies.forEach((body, j) => {
		//top
		if ((bitmasks [j, 1] & boundsBitmasks[0]) > 0) {
			cols.push(addPlaneCollision(body, topBody, down, body.velocityVector));
		}
		//bottom
		if ((bitmasks [j, 1] & boundsBitmasks[1]) > 0 ) {
			cols.push (addPlaneCollision(body, bottomBody, up, body.velocityVector));
		}
		//front //switched
		if ((bitmasks [j, 2] & boundsBitmasks [2]) > 0) {
			cols.push (addPlaneCollision(body, backBody, vForward, body.velocityVector));
		}
		//back //switched
		if ((bitmasks [j, 2] & boundsBitmasks [3]) > 0) {
			cols.push (addPlaneCollision(body, frontBody, vBackward, body.velocityVector));
		}
		//left
		if ((bitmasks [j, 0] & boundsBitmasks [4]) > 0) {
			cols.push (addPlaneCollision(body, leftBody, vRight, body.velocityVector));
		}
		//right
		if ((bitmasks [j, 0] & boundsBitmasks [5]) > 0) {
			cols.push (addPlaneCollision(body, rightBody, vLeft, body.velocityVector));
		}
	});

	for (let j = bodies.length - 1; j >= 0; j--) {
		for (let i = 0; i < j; i++) {
			if (bodies [j] != bodies [i]) {
				if (!bodies [j].isStatic || !bodies [i].isStatic){
					if ((bitmasks [j][0] & bitmasks [i][0]) > 0
						&& (bitmasks [j][1] & bitmasks [i][1]) > 0 
						&& (bitmasks [j][2] & bitmasks [i][2]) > 0) {
						cols.push(addParticleCollision(bodies[i], bodies[j]));
					}
				}
			}
		}
	}

	return cols;
}

const GetBitmask = (position, radius) => {
	let three = [];
	three.push(CalcBitmask (position.x + config.activeBounds/2, radius)); //new world centered on origin has to be offset by bounds/2. unity's implementation was set in first octant
	three.push(CalcBitmask (position.y + config.activeBounds/2, radius));
	three.push(CalcBitmask (position.z + config.activeBounds/2, radius));
	// console.log(dec2bin(three[0]), dec2bin(three[1]), dec2bin(three[2]));
	return three;
}

function dec2bin(dec){
    let shortBinaryString = (dec >>> 0).toString(2);
    while (shortBinaryString.length < 64){
    	shortBinaryString = "0" + shortBinaryString;
    }
    return shortBinaryString;
}

const CalcBoundingBitmask = (a, b) => {
	let Bitmask = 0;
	let aa = GetBitPosition (a);
	let bb = GetBitPosition (b);
	let Begin = 1 << aa;
	let End = 1 << bb;
	for (let i = aa; i < bb; i++) {
		Begin |= 1 << i;
	}
	Bitmask = Begin | End;

	return Bitmask;
}

const CalcBitmask = (position, shipRadius) => {
	let Bitmask = 0;

	if (position > totalRange) {
		position = totalRange - shipRadius;
	}
	else if (position < 0) {
		position = 0 + shipRadius;
	}

	let a = GetBitPosition(position - shipRadius);
	let b = GetBitPosition (position + shipRadius);
	//ulong Begin = (ulong)Mathf.Pow (2, a);
	//ulong End = (ulong)Mathf.Pow (2, b);
	let Begin = 1 << a;
	let End = 1 << b;
	for (let i = a; i < b; i++) {
		//Begin |= (ulong)Mathf.Pow (2, i);
		Begin |= 1 << i;
	}
	Bitmask = Begin | End;
	return Bitmask;
}

const GetBitPosition = (position) => {
	let bitPosition = 0;
	if (cellSize >= 1) {
		bitPosition = Math.floor(Math.round (position / cellSize));
	} else {
		bitPosition = Math.floor(Math.round (position * cellSize));
	}
	return bitPosition;
}
