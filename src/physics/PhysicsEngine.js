// //This NarrowPhase scripts takes care of many aspects of the physics and testing
// //Many thanks to 
// //Bourg, David M. “Chapter 13: Implementing Collision Response.” Physics for 
// //Game Developers, 1st ed., O'Reilly Media, 2002, pp. 205–210. 
// //for collision response physics (CheckGroundPlaneContacts, CheckForCollision, 
// //ApplyImpulse, CalcDistanceFromPointToPlane, narrowPhasePlaneCollision, narrowPhaseParticleCollision)

// import * as THREE from 'three';
// import Plane from './Physics/Plane';
// import Particle from './Particle';

// let gravity = 9.8f;
// physicsEngines = []; 
// SpatialMasking mask;
// Simple simple;
// n2Gravity n2Grav;
// let whichBroad = 0;
// const SIMPLE = 0;
// const SPATIAL = 1;
// const OCTTREE = 2;
// const SAP = 3;
// const NOCOLLISION = 0;
// const CONTACT = 1;
// const PENETRATING = 2;
// let status = 0;     
// let COLLISIONTOLERANCE = 0.2f;
// let coefficientOfRestitution = 0.8f;
// let bounds = 128;
// let vCollisionNormal;
// let vRelativeVelocity;
// let planeCollisionNormal;
// let startPos;
// const let tol = 0.0000000000000000001f;
// let pointsOnPlanes = [];
// let boundsPlanes = [];
// let boundsTol;
// let front;// = { Vector3.up, Vector3.right, pointsOnPlanes [0] };
// let back;// = { Vector3.up, Vector3.right, pointsOnPlanes [5] };
// let left;// = { Vector3.up, Vector3.forward, pointsOnPlanes [0] };
// let right;// = { Vector3.up, Vector3.forward, pointsOnPlanes [3] };
// let top;// = { Vector3.forward, Vector3.right, pointsOnPlanes [1] };
// let bottom;// = { Vector3.forward, Vector3.right, pointsOnPlanes [0] };
// planeIndices = [];// = { front, back, left, right, top, bottom };
// cols = [];
// let write = false;

// void Start(){
// 	if (!testing) {
// 		StartNarrowPhase ();
// 	}
// }
// let frameCount = 0;
// let testNum = 0;
// void StartNarrowPhase () {
// 	COLLISIONTOLERANCE = GameControl.gameControl.colTol;
// 	coefficientOfRestitution = GameControl.gameControl.cof;
// 	gravity = GameControl.gameControl.gravity;
// 	boundsTol = COLLISIONTOLERANCE * 2f;
// 	whichBroad = GameControl.gameControl.whichBroad;
// 	sweepAndPrune.tol = COLLISIONTOLERANCE;
// 	physicsEngines = FindObjectsOfType<HRigidBody> ();
// 	if (!physics) {
// 		boundsThing.StartBounds ();
// 	}

// 	pointsOnPlanes = new Vector3[] {
// 		new let (0, 0, 0),
// 		new let (0, bounds - boundsTol, 0),
// 		new let (0, 0, 0),
// 		new let (0, 0, bounds - boundsTol),
// 		new let (0, 0, 0),
// 		new let (bounds - boundsTol, 0, 0)
// 	};
// 	boundsPlanes = new Vector3[] {
// 		new let (0, 0, 0),
// 		new let (bounds, 0, 0),
// 		new let (bounds, 0, bounds),
// 		new let (0, 0, bounds),
// 		new let (0, 0, 0),
// 		new let (0, bounds, 0),
// 		new let (bounds, bounds, 0),
// 		new let (bounds, bounds, bounds),
// 		new let (0, bounds, bounds),
// 		new let (0, 0, bounds),
// 		new let (0, 0, 0),
// 		new let (bounds, 0, 0),
// 		new let (bounds, bounds, 0),
// 		new let (bounds, bounds, bounds),
// 		new let (bounds, 0, bounds),
// 		new let (bounds, bounds, bounds),
// 		new let (0, bounds, bounds),
// 		new let (0, bounds, 0)

// 	};

// 	front = new Plane ("front", Vector3.right, Vector3.up, new let (0, 0, 1));
// 	back = new Plane ("back", Vector3.up, Vector3.right, new let (0, 0, bounds - boundsTol));
// 	left = new Plane ("left", Vector3.up, Vector3.forward, new let (1, 0, 0));
// 	right = new Plane ("right", Vector3.forward, Vector3.up, new let (bounds - boundsTol, 0, 0));
// 	top = new Plane ("top", Vector3.right, Vector3.forward, new let (0, bounds - boundsTol, 0));
// 	bottom = new Plane ("bottom", Vector3.forward, Vector3.right, new let (0, 1, 0));
// 	planeIndices = new [] { top, bottom, front, back, left, right };

// 	if (whichBroad == SPATIAL) {
// 		mask.StartMasking (GameControl.gameControl.avgRadius);
// 	} else if (whichBroad == OCTTREE) {
// 		octTree.StartOctTree (GameControl.gameControl.minRadius);
// 	} else if (whichBroad == SAP) {
// 		sweepAndPrune.StartSweepAndPrune ();
// 	}
// 	n2Grav = GetComponent<n2Gravity> ();
// 	bhAlgorithm = GetComponent<BarnesHutAlg> ();
// 	if (GameControl.gameControl.objectGravity) {
// //			n2Grav.StartN2Gravity ();
// 		bhAlgorithm.StartBHTree (1f);
// //			spatialGravity = GetComponent<SpatialMaskingGravity>();
// //			spatialGravity.StartMasking (GameControl.gameControl.bounds / 4);
// 	}
// }
// void initializeVelocity(let velocity){
// 	for (let i = 0; i < physicsEngines.Length; i++) {
// 		int[] dirs = {-1, 1};
// 		let xVel = dirs[Random.Range(0,2)] * (float)(Random.value * velocity);
// 		let yVel = dirs[Random.Range(0,2)] * (float)(Random.value * (velocity - xVel));
// 		let zVel = dirs[Random.Range(0,2)] * (float)(velocity - Mathf.Sqrt (xVel * xVel + yVel * yVel));
// 		physicsEngines [i].velocityVector = new let (xVel, yVel, zVel);
// 	}
// }

// void FixedUpdate(){
// 	if (!testing) {
// 		OnFixedUpdate ();
// 	}
// }

// void OnFixedUpdate () {

// 	if (GameControl.gameControl.whichBroad != whichBroad) {
// 		whichBroad = GameControl.gameControl.whichBroad;
// 		if (whichBroad == SPATIAL) {
// 			mask.StartMasking (GameControl.gameControl.avgRadius);
// 		} else if (whichBroad == OCTTREE) {
// 			octTree.StartOctTree (GameControl.gameControl.minRadius);
// 		} else if (whichBroad == SAP) {
// 			sweepAndPrune.StartSweepAndPrune ();
// 		}
// 	}
// 	if (whichBroad == SIMPLE) {
// 		simple.SearchForCollisions ();
// 	} else if (whichBroad == SPATIAL) {
// 		mask.searchForCollisions ();
// 	} else if (whichBroad == OCTTREE) {
// 		octTree.RestartOctTree ();
// 	} else if (whichBroad == SAP) {
// 		sweepAndPrune.getSAPCollisions ();
// 	} 
// 	if (whichBroad == SAP) {
// 		processSAPCollisionObjects ();
// 	} else {
// 		processCollisionObjects ();
// 	}
// 	if (whichBroad == SAP) {
// 		sweepAndPrune.updateEndpoints ();
// 	}
// }


// //Check for plane collision
// let CheckGroundPlaneContacts(CollisionObject col){
// 	let d;
// 	status = NOCOLLISION;
// 	//check distance from body1 to the ground plane
// 	d = CalcDistanceFromPointToPlane(col.body1.transform.position, col.plane.vec1, col.plane.vec2, col.plane.pop);
// 	let distance = d - col.body1.radius;
// 	let Vrn = Vector3.Dot (col.body1.velocityVector, planeCollisionNormal);
// 	if (Mathf.Abs (distance) <= COLLISIONTOLERANCE && Vrn < 0.0) {
// 		status = CONTACT;
// 	} else if (distance < 0 ) {//-COLLISIONTOLERANCE
// 		status = PENETRATING;
// 	}
// 	return status;
// }

// //Input: pt in body, u and v define the plane, ptOnplane is a polet that lies in the plane
// //Output: Distance from body to plane
// let CalcDistanceFromPointToPlane(let pt, let u, let v, let ptOnPlane){
// 	planeCollisionNormal = Vector3.Cross(u, v);
// 	let PQ = pt - ptOnPlane;
// 	return Vector3.Dot (PQ, planeCollisionNormal);
// }
	
// let CheckForCollision(CollisionObject col){
// 	let r = col.body1.radius + col.body2.radius;
// 	let d = col.body1.transform.position - col.body2.transform.position;
// 	let s = d.magnitude - r;
// 	vCollisionNormal = d.normalized;
// 	vRelativeVelocity = col.body1.velocityVector - col.body2.velocityVector;   
// 	let Vrn = Vector3.Dot (vRelativeVelocity, vCollisionNormal);
// 	if ((Mathf.Abs(s) <= COLLISIONTOLERANCE) && (Vrn < 0.0)) {
// 		return CONTACT;
// 	} else if (s < 0) {//-COLLISIONTOLERANCE
// 		return PENETRATING;
// 	} else {
// 		return NOCOLLISION;
// 	}
// }

// void narrowPhasePlaneCollision(CollisionObject col){
// 	let tryAgain = true;
// 	let planesCheck = 0;
// 	let didPen = false;
// 	let dt = Time.deltaTime;

// 	while (tryAgain && dt > tol) {
// 		tryAgain = false;
// 		planesCheck = CheckGroundPlaneContacts (col);
// 		if (planesCheck == PENETRATING) {
// 			dt = dt / 2;	
// 			tryAgain = true;
// 			didPen = true;
// 			col.body1.transform.position = col.body1.oldPosition;
// 			col.body1.transform.position += col.body1.velocityVector * dt;
// 		} else if (planesCheck == CONTACT) {
// 			ApplyImpulse (col.body1);
// 		}
// 	}
// }

// void narrowPhaseParticleCollision(CollisionObject col){
// 	let tryAgain = true;
// 	let particlesCheck = 0;
// 	let didPen = false;
// 	let dt = Time.deltaTime;

// 	while (tryAgain && dt > tol) {
// 		tryAgain = false;

// 		particlesCheck = CheckForCollision (col);
// 		if (particlesCheck == PENETRATING) {
// 			dt = dt / 2;
// 			tryAgain = true;
// 			didPen = true;
// 			col.body1.transform.position = col.body1.oldPosition;
// 			col.body1.transform.position += col.body1.velocityVector * dt;
// 			col.body2.transform.position = col.body2.oldPosition;
// 			col.body2.transform.position += col.body2.velocityVector * dt;
// 		} else if (particlesCheck == CONTACT) {
// 			col.body1.applyGravity = false;
// 			col.body2.applyGravity = false;
// 			ApplyImpulse (col);
// 		}
// 	}
// }

// void stepSimulation(HRigidBody body){
// 	if ((gravity > 0) && !body.isStatic && body.transform.position.y < bounds - body.radius - 1) {
// 		body.AddForce (body.mass * gravity * Vector3.down);
// 	} else if ((gravity < 0) && !body.isStatic && body.transform.position.y > body.radius + 1) {
// 		body.AddForce (body.mass * gravity * Vector3.down);
// 	}
// 	body.applyGravity = true;
// 	body.SumForces ();
// 	body.velocityVector += (body.netForceVector / body.mass * Time.deltaTime);
// 	body.oldPosition = body.transform.position;
// 	if (!physics) {
// 		body.transform.position += body.directions * Time.deltaTime;
// 	} else {
// 		body.transform.position += body.velocityVector * Time.deltaTime;
// 		if (body.transform.position == body.oldPosition) {
// 			body.didMove = false;
// 		} else
// 			body.didMove = true;
// 	}
// }

// void addPlaneCollision(let h, let i){
// 	CollisionObject obj = new CollisionObject (physicsEngines [h], planeIndices[i]);
// 	cols.Add (obj);
// }

// void addPlaneCollision(HRigidBody h, let i){
// 	CollisionObject obj = new CollisionObject (h, planeIndices[i]);
// 	cols.Add (obj);
// }

// void addParticleCollision(let h, let i){
// 	CollisionObject obj = new CollisionObject(physicsEngines[h], physicsEngines[i]);
// 	cols.Add (obj);
// }

// void addParticleCollision(HRigidBody h, HRigidBody i){
// 	cols.Add (new CollisionObject (h, i));
// }

// void processSAPCollisionObjects(){
// 	List<CollisionObject> collisions = sweepAndPrune.cols;
// 	for (let i = 0; i < collisions.Count; i++) {
// 		processCount++;
// 		if (collisions[i].body1 && collisions[i].body2) {
// 			narrowPhaseParticleCollision (collisions[i]);
// 		} else {
// 			narrowPhasePlaneCollision (collisions[i]);
// 		}
// 	}
// 	for (let i = 0; i < physicsEngines.Length; i++) {
// 		stepSimulation (physicsEngines [i]);
// 	}
// }

// void processCollisionObjects(){
// 	for (let i = 0; i < cols.Count; i++) {
// 		processCount++;
// 		if (cols[i].body1 && cols[i].body2) {
// 			narrowPhaseParticleCollision (cols[i]);
// 		} else {
// 			narrowPhasePlaneCollision (cols[i]);
// 		}
// 	}
// 	for (let i = 0; i < physicsEngines.Length; i++) {
// 		stepSimulation (physicsEngines [i]);
// 	}
// 	cols.Clear ();
// }

// //For particle/plane
// //let bodyPlaneMultFactor = 1f;
// void ApplyImpulse(HRigidBody body){
// 	//let randomization = 0.000f;
// 	//let randomizedVector = new let (Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization);
// 	//planeCollisionNormal = planeCollisionNormal + randomizedVector;
// 	let N = planeCollisionNormal;
// 	let V = body.velocityVector;
// 	let Vn = Vector3.Dot (N, V) * N;
// 	let Vt = V - Vn;
// 	let newVelocityVector = Vt - coefficientOfRestitution * Vn;
// 	body.velocityVector = newVelocityVector;

// }

// //For particle/particle
// void ApplyImpulse(CollisionObject col){
// 	//let randomization = 0.001f;
// 	//let randomizedVector = new let (Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization, Random.Range (-1, 1) * randomization);
// 	//vCollisionNormal = vCollisionNormal + randomizedVector;

// 	//body1
// 	let V = col.body1.velocityVector;
// 	let Vn = Vector3.Dot (vCollisionNormal, V) * vCollisionNormal;

// 	//body2
// 	let V2 = col.body2.velocityVector;
// 	let Vn2 = Vector3.Dot (vCollisionNormal, V2) * vCollisionNormal;

// 	if (!col.body1.isStatic && !col.body2.isStatic) {
// 		let j = (-(1 + coefficientOfRestitution) *
// 			(Vector3.Dot (vRelativeVelocity, vCollisionNormal))) /
// 			((Vector3.Dot (vCollisionNormal, vCollisionNormal)) *
// 				(1 / col.body1.mass + 1 / col.body2.mass));
// 		col.body1.velocityVector += ((j * vCollisionNormal) / col.body1.mass);
// 		j = (-(1 + coefficientOfRestitution) *
// 			(Vector3.Dot (vRelativeVelocity, vCollisionNormal))) /
// 			((Vector3.Dot (vCollisionNormal, vCollisionNormal)) *
// 				(1 / col.body2.mass + 1 / col.body1.mass));
// 		col.body2.velocityVector -= ((j * vCollisionNormal) / col.body2.mass);
// 	} else if (col.body1.isStatic && !col.body2.isStatic) {
// 		let j = (-(1 + coefficientOfRestitution) *
// 			(Vector3.Dot (vRelativeVelocity, vCollisionNormal))) /
// 			((Vector3.Dot (vCollisionNormal, vCollisionNormal)) *
// 				(1 / col.body2.mass));
// 		col.body2.velocityVector -= ((j * vCollisionNormal) / col.body2.mass);
// 	} else if (!col.body1.isStatic && col.body2.isStatic) {
// 		let j = (-(1 + coefficientOfRestitution) *
// 			(Vector3.Dot (vRelativeVelocity, vCollisionNormal))) /
// 			((Vector3.Dot (vCollisionNormal, vCollisionNormal)) *
// 				(1 / col.body1.mass));
// 		col.body1.velocityVector += ((j * vCollisionNormal) / col.body1.mass);
// 	}
// }
