import * as THREE from 'three';

import { config } from './physics/Config.js';
import { bodies, camera, renderer, scene, init } from "./physics/Initialize.js";
import { processCollisionObjects, setDt, stepSimulation } from "./physics/PhysicsEngine.js";
import { makePlanes, removePlanes } from './physics/RenderPlanes.js';
import { getSAPCollisions } from './physics/SAP.js';
import { simple } from './physics/Simple.js';
import { getSpatialMaskCollisions } from './physics/SpatialMasking.js';
import 'normalize.css/normalize.css';
import './styles/styles.scss';

init();

const update = () => {
	if (config.whichBroad == 1){
		processCollisionObjects(simple(bodies, stepSimulation));
	} else if (config.whichBroad == 2) {
		processCollisionObjects(getSAPCollisions());
	} else if (config.whichBroad == 3) {
		processCollisionObjects(getSpatialMaskCollisions());
	}
	bodies.forEach((body) => {		
		stepSimulation(body);
	});
};

const render = () => {
	renderer.render( scene, camera );
};

const GameLoop = () => {	
	requestAnimationFrame( GameLoop );
	update();
	render();
};

GameLoop();