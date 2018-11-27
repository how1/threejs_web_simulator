// Options to be added to the GUI
import * as dat from 'dat.gui';
import { createSingleSphere, init } from './Initialize.js';
import { GameLoop } from '../app.js';

export let config = {
	whichBroad: 3,
	hasBounds: true,
	activeHasBounds: true,
	bounds: 100,
	activeBounds: 100,
	numObjects: 70,
	gravity: 9.8,
	radius: 1,
	initialVelocity: 0,
	drag: .01,
	cof: .95,
	mass: 100,
	sphereVerts: 3
};

const options = {
  update: function() {
    init();
  }
};

// DAT.GUI Related Stuff
const gui = new dat.GUI();

const physics = gui.addFolder('Config');

physics.add(config, 'whichBroad', { Simple: 1, SAP: 2, SpatialMask: 3} ).name('Algorithm');
physics.add(config, 'activeHasBounds').name('Walls');
physics.add(config, 'bounds').name('Bounds').min(4).max(10000).step(1);
physics.add(config, 'numObjects').name('# Objects').min(0).max(100000).step(1);
physics.add(config, 'gravity').name('Gravity').min(-20).max(20).step(.1);
physics.add(config, 'radius').name('Radius').min(.0001).max(10).step(.0001);
physics.add(config, 'initialVelocity', 0, 3).name('Initial Velocity').min(0).max(100000).step(1);
physics.add(config, 'drag').name('Drag').min(0).max(1).step(0.01);
physics.add(config, 'mass').name('Mass').min(1).max(1000000).step(1);
physics.add(config, 'cof').name('Elasticity').min(0).max(1).step(0.01);
physics.add(config, 'sphereVerts').name('Sphere Vertices').min(3).max(32).step(1);

gui.add(options, 'update');


const newObject = {
	radius: 1,
	mass: 10,
	initialVelocity: 0
}

const createButton = {
	create: function() {
		createSingleSphere(newObject);
	}
}

const createObject = gui.addFolder('Create Object');

createObject.add(newObject, 'radius').name('Radius').min(.0001).max(20).step(.0001);
createObject.add(newObject, 'mass').name('Mass').min(1).max(1000000).step(.1);
createObject.add(config, 'initialVelocity', 0, 3).name('Initial Velocity').min(0).max(100000).step(1);
createObject.add(createButton, 'create').name('Add Object');



