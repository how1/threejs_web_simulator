// Options to be added to the GUI
import * as dat from 'dat.gui';
import { init } from './Initialize.js';
import { GameLoop } from '../app.js';

export let config = {
	whichBroad: 2,
	bounds: 100,
	activeBounds: 0,
	planes: [],
	numObjects: 2,
	gravity: 9.8,
	radius: 10,
	initialVelocity: 0,
	drag: 0,
	cof: 1,
	mass: 1,
	sphereVerts: 32
};


var options = {
  update: function() {
    init();
  }
};

// DAT.GUI Related Stuff
var gui = new dat.GUI();


var physics = gui.addFolder('Config');

physics.add(config, 'whichBroad', { Simple: 1, SAP: 2} );
physics.add(config, 'bounds').name('Bounds').min(4).max(10000).step(1);
physics.add(config, 'numObjects').name('# Objects').min(0).max(2500).step(1);
physics.add(config, 'gravity').name('Gravity').min(-20).max(20).step(.1);
physics.add(config, 'radius').name('Radius').min(.0001).max(10).step(.0001);
physics.add(config, 'initialVelocity', 0, 3).name('Initial Velocity').min(0).max(10000).step(100);
physics.add(config, 'drag').name('Drag').min(0).max(1).step(0.01);
physics.add(config, 'cof').name('Elasticity').min(0).max(1).step(0.01);
physics.add(config, 'mass').name('Mass').min(1).max(10000).step(1);
physics.add(config, 'cof').name('Elasticity').min(0).max(1).step(0.01);
physics.add(config, 'sphereVerts').name('Sphere Vertices').min(3).max(32).step(1);

gui.add(options, 'update');



