import * as THREE from 'three';

import { renderer, scene, camera, bodies, init } from "./physics/Initialize.js";
import { processCollisionObjects, stepSimulation } from "./physics/Test.js";
import { getSAPCollisions } from './physics/SAP.js';
import { config } from './physics/Config.js';
import { simple } from './physics/Simple.js';
import 'normalize.css/normalize.css';
import './styles/styles.scss';
import { makePlanes, removePlanes } from './physics/RenderPlanes.js';

init();

const update = () => {
	if (config.whichBroad == 1){
		processCollisionObjects(simple(bodies, stepSimulation));
	} else if (config.whichBroad == 2) {
		processCollisionObjects(getSAPCollisions());
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