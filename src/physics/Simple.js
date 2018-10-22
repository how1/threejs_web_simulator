// //Simple brute force algorithm for collision detection
// const SearchForCollisions = () => {
// 	for (int i = 0; i < narrowPhase.physicsEngines.Length; i++) {
// 		for (int k = 0; k < narrowPhase.planeIndices.Length; k++) {
// 			narrowPhase.addPlaneCollision (i, k);
// 		}
// 	}
// 	for (int i = narrowPhase.physicsEngines.Length - 1; i >= 0; i--) {
// 		for (int j = 0; j < i; j++) {
// 			if (narrowPhase.physicsEngines [i] != narrowPhase.physicsEngines [j] && (!narrowPhase.physicsEngines[i].isStatic && !narrowPhase.physicsEngines[j].isStatic)) {
// 				narrowPhase.addParticleCollision (j, i);
// 			}
// 		}
// 	}
// }
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

export const simple = (bodies, stepSimulation) => {
	let cols = [];
	bodies.forEach((body) => {
		cols.push(addPlaneCollision(body, bottomBody, up, body.velocityVector));
		cols.push(addPlaneCollision(body, topBody, down, body.velocityVector));
		cols.push(addPlaneCollision(body, leftBody, vRight, body.velocityVector));
		cols.push(addPlaneCollision(body, rightBody, vLeft, body.velocityVector));
		cols.push(addPlaneCollision(body, frontBody, vBackward, body.velocityVector));
		cols.push(addPlaneCollision(body, backBody, vForward, body.velocityVector));
	});
	for (let index = 0; index < bodies.length; index++){
		for (let x = bodies.length-1; x > index; x--){
			cols.push(addParticleCollision(bodies[index], bodies[x]))
		}
	}
	return cols;
}
