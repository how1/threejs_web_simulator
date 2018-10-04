//Stores information about a collision between two objects
import * as THREE from 'three';


export const CollisionObject = (body1, body2, plane, collisionNormal = new THREE.Vector3(), relativeVelocity = new THREE.Vector3(), radiusSum = 1) => {
	if (body2 != null){
		radiusSum = body1.radius + body2.radius;
		let tmp = new THREE.Vector3();
		tmp.copy(body1.mesh.position);
		let distance = tmp.sub(body2.mesh.position);
		let actualDistance = distance.length() - radiusSum;
		collisionNormal.copy(distance.normalize());
		tmp.copy(body1.velocityVector);
		relativeVelocity = tmp.sub(body2.velocityVector);   
	}
	return {
		body1,
		body2,
		plane,
		relativeVelocity,
		collisionNormal,
		radiusSum
	};
};
