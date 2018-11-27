import * as THREE from 'three';

// import 'webm-writer'
// import CCapture from './components/ccapture.js/build/CCapture.js'
// import download from './components/ccapture.js/build/download.js' // eslint-disable-line
// import './components/ccapture.js/build/gif.js'
// import './components/ccapture.js/build/gif.worker.js'
// import './components/ccapture.js/build/tar.js'
// import './components/ccapture.js/build/Whammy.js'

import { config } from './physics/Config.js';
import { bodies, camera, renderer, scene, init } from "./physics/Initialize.js";
import { processCollisionObjects, setDt, stepSimulation } from "./physics/PhysicsEngine.js";
import { makePlanes, removePlanes } from './physics/RenderPlanes.js';
import { getSAPCollisions } from './physics/SAP.js';
import { simple } from './physics/Simple.js';
import { getSpatialMaskCollisions } from './physics/SpatialMasking.js';
import 'normalize.css';
import './styles/styles.scss';

init();

// const capturer = new CCapture( { format: 'png' } );
// console.log(capturer);

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
	// capturer.capture(canvas);
	// loop++;
	// if (loop > recordFor && !exit){
	// 	exit = true;
	// 	capturer.save();
	// }
};
// let exit = false;
// const canvas = document.body.childNodes[2];
// console.log(canvas);
// const recordFor = 60*20;
// let loop = 0;
// capturer.start();
GameLoop();