// import * as THREE from 'three';
import * as THREE from "three";
import { config } from "./Config.js";
import { CollisionObject } from "./CollisionObject.js";

export const NOCOLLISION = 0;
export const CONTACT = 1;
export const PENETRATING = 2;
export const RESTING = 3;
// let cols = [];

const COLLISIONTOLERANCE = 0.2;
const tol = 0.000001;
export const dt = 0.016;

export const narrowPhaseParticleCollision = (col) => {
	let tryAgain = true;
	let planesCheck = 0;
	// let tempDT = 0;
	let tempDT = dt;
	// let divisor = 4;
	let didPen = false;

	while (tryAgain && tempDT > tol) {

		tryAgain = false;

		col.body1.status = col.body2.status = CheckForCollision (col);
		if (col.body1.status == PENETRATING) {

			tempDT /= 2;
			// divisor *= 2;
			// tempDT *= .9;
			// if (tempDT < tol){
			// 	//col.body1.velocityVector.negate();
			// 	//col.body2.velocityVector.negate();
			// }

			tryAgain = true;
			didPen = true;

			let tempVel = new THREE.Vector3();

			// // col.body1.mesh.position.copy(col.body1.oldPosition);
			// tempVel.copy(col.body1.velocityVector);
			// col.body1.mesh.position.sub(tempVel.multiplyScalar(tempDT));

			// // col.body2.mesh.position.copy(col.body2.oldPosition);
			// tempVel.copy(col.body2.velocityVector);
			// col.body2.mesh.position.sub(tempVel.multiplyScalar(tempDT));

			col.body1.mesh.position.copy(col.body1.oldPosition);
			tempVel.copy(col.body1.velocityVector);
			col.body1.mesh.position.add(tempVel.multiplyScalar(tempDT));

			col.body2.mesh.position.copy(col.body2.oldPosition);
			tempVel.copy(col.body2.velocityVector);
			col.body2.mesh.position.add(tempVel.multiplyScalar(tempDT));

		} else if (col.body1.status == CONTACT) {
			// col.body1.applyGravity = false;
			// col.body2.applyGravity = false;
			ApplyImpulse (col);
		}
	}
}

export const CheckForCollision = (col) => {
	let tmp = new THREE.Vector3();
	tmp.copy(col.body1.mesh.position);
	let d = new THREE.Vector3();
	d.copy(tmp.sub(col.body2.mesh.position));
	let s = d.length() - (col.body1.radius + col.body2.radius);
	let Vrn = col.relativeVelocity.dot(col.collisionNormal);
	if ((Math.abs(s) <= COLLISIONTOLERANCE) && (Vrn < 0.0)) {
		return CONTACT;
	} else if (s < 0) {//-COLLISIONTOLERANCE
		return PENETRATING;
	} else {
		return NOCOLLISION;
	}
}

export const narrowPhasePlaneCollision = (col) => {
	let tryAgain = true;
	let dtTmp = dt;
	let didPen = false;
	let temp = new THREE.Vector3();

	while (tryAgain && dtTmp > tol) {

		tryAgain = false;
		col.body1.planeStatus = CheckGroundPlaneContacts (col);
		if (col.body1.planeStatus == PENETRATING) {
			didPen = true;
			tryAgain = true;
			dtTmp /= 2;	
			col.body1.mesh.position.copy(col.body1.oldPosition);
			temp.copy(col.body1.velocityVector);
			col.body1.mesh.position.add(temp.multiplyScalar(dtTmp));
		} else if (col.body1.planeStatus == CONTACT) {
			BounceOffPlane (col.body1, col.collisionNormal);
			col.body1.AddForce(new THREE.Vector3(0,1,0).multiplyScalar(9.8 * col.body1.mass));
			// temp.copy(col.body1.velocityVector);
			// col.body1.mesh.position.add(temp.multiplyScalar(tmp/2));
			return;
		}

		// if (didPen && col.body1.planeStatus != RESTING) {
		// 	tryAgain = true;
		// 	dtTmp += dtTmp / 2;	
		// 	col.body1.mesh.position.copy(col.body1.oldPosition);
		// 	temp.copy(col.body1.velocityVector);
		// 	col.body1.mesh.position.add(temp.multiplyScalar(dtTmp));
		// }
	}
}

//Input: pt position on body, u and v define the plane, ptOnplane is a point that lies in the plane
//Output: Distance from body to plane
const CalcDistanceFromPointToPlane = (pt, plane, normal) => {
	let tmp = new THREE.Vector3();
	tmp.copy(pt);
	let PQ = tmp.sub(plane.pop); //position - point on plane
	return PQ.dot(normal);
}

//Check for plane collision
const CheckGroundPlaneContacts = ( col, count ) => {
	let status = NOCOLLISION;
	//check distance from body1 to the ground plane
	const d = CalcDistanceFromPointToPlane(col.body1.mesh.position, col.plane, col.collisionNormal);
	// let planeCollisionNormal = d[0];
	let distance = d - col.body1.radius;
	let Vrn = col.body1.velocityVector.dot(col.collisionNormal);
	if (Math.abs (distance) <= COLLISIONTOLERANCE && Vrn < 0.0) {
		status = CONTACT;
	} else if (distance < 0 ) {//-COLLISIONTOLERANCE
		if (count > 1){
			status = RESTING;
		} else {
			status = PENETRATING;
		}
	}
	return status;
}

export const addPlaneCollision = ( h, p, normal, relV ) => {
	return CollisionObject ( h, null, p, normal, relV );
	// cols.push (obj);
}

export const addParticleCollision = (a, b, normal, relV) => {
	return CollisionObject( a, b );
}

//For particle/plane
//let bodyPlaneMultFactor = 1f;
const BounceOffPlane = (body, planeCollisionNormal = new THREE.Vector3(0,1,0)) => {

	//let randomization = 0.000f;
	//let randomizedVector = new let (Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization);
	//planeCollisionNormal = planeCollisionNormal + randomizedVector;
	
	// body.velocityVector.negate();
	let tmp = new THREE.Vector3();
	tmp.copy(planeCollisionNormal);
	let Vn = tmp.multiplyScalar(planeCollisionNormal.dot(body.velocityVector));
	let temp = new THREE.Vector3();
	temp.copy(body.velocityVector);
	let Vt = temp.sub(Vn);
	let newVelocityVector = Vt.sub(Vn.multiplyScalar(config.cof));
	body.velocityVector.copy(newVelocityVector);

	// body.AddForce (new THREE.Vector3(0,-1,0).multiplyScalar(gravity * body.mass));

}

//For particle/particle
const ApplyImpulse = (col) => {
	//let randomization = 0.001f;
	//let randomizedVector = new let (Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization);
	//col.collisionNormal = col.collisionNormal + randomizedVector;
	//body1

	let relDotColNorm = col.relativeVelocity.dot(col.collisionNormal);
	let negativeOneCOF = -(1 + config.cof);
	let collisionNormalDotColNorm = col.collisionNormal.dot(col.collisionNormal);
	let MassRelationA = 1 / col.body1.mass + 1 / col.body2.mass;
	let MassRelationB = 1 / col.body2.mass + 1 / col.body1.mass;

	let tmp = new THREE.Vector3();
	let j = (negativeOneCOF * relDotColNorm) / (collisionNormalDotColNorm * MassRelationA);
	tmp.copy(col.collisionNormal);
	col.body1.velocityVector.add(tmp.multiplyScalar(j).divideScalar(col.body1.mass));
	
	j = negativeOneCOF * relDotColNorm / (collisionNormalDotColNorm * MassRelationB);
	tmp.copy(col.collisionNormal);
	col.body2.velocityVector.sub(tmp.multiplyScalar(j).divideScalar(col.body2.mass));
}

export const stepSimulation = (body) => {

	const gravityNormalVector = new THREE.Vector3(0,-1,0);
	if (body.mesh.position.y - body.radius > -config.activeBounds/2) {
		if (body.status != RESTING) {
			body.AddForce (gravityNormalVector.multiplyScalar(body.mass * config.gravity));
		}
	}
	body.updateDrag(config.drag);
	body.SumForces ();
	body.velocityVector.add(body.netForceVector.divideScalar(body.mass).multiplyScalar(dt));
	body.oldPosition.copy(body.mesh.position);
	let tmp = new THREE.Vector3();
	tmp.copy(body.velocityVector);
	body.mesh.position.add(tmp.multiplyScalar(dt));

	// if (body.mesh.position == body.oldPosition) {
	// 	body.didMove = false;
	// } else
	// 	body.didMove = true;
}

export const processCollisionObjects = (cols) => {
	cols.forEach((col) => {
		if (col.plane){
			narrowPhasePlaneCollision(col);
		} else {
			narrowPhaseParticleCollision(col);
		}
	});
}