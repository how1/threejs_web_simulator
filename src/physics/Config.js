// Options to be added to the GUI
import * as dat from 'dat.gui';
import { init } from './Initialize.js';
import { GameLoop } from '../app.js';

export let config = {
	whichBroad: 2,
	bounds: 100,
	numObjects: 5,
	gravity: 9.8,
	radius: 1,
	initialVelocity: 3000,
	drag: 0,
	cof: 1,
	mass: 1,
	sphereVerts: 32
};

var options = {
  reset: function() {
    init();
  }
};

// DAT.GUI Related Stuff
var gui = new dat.GUI();


var physics = gui.addFolder('Config');

physics.add(config, 'whichBroad').name('Algorithm').min(1).max(2).step(1);
physics.add(config, 'bounds').name('Bounds').min(4).max(10000).step(1);
physics.add(config, 'numObjects').name('# Objects').min(0).max(2500).step(1);
physics.add(config, 'gravity').name('Gravity').min(-20).max(20).step(.1);
physics.add(config, 'radius').name('Radius').min(.0001).max(10).step(.0001);
physics.add(config, 'initialVelocity', 0, 3).name('Initial Velocity').min(0).max(100000).step(100);
physics.add(config, 'drag').name('Drag').min(0).max(1).step(0.01);
physics.add(config, 'cof').name('Elasticity').min(0).max(1).step(0.01);
physics.add(config, 'mass').name('Mass').min(1).max(10000).step(1);
physics.add(config, 'cof').name('Elasticity').min(0).max(1).step(0.01);
physics.add(config, 'sphereVerts').name('Sphere Vertices').min(3).max(32).step(1);

gui.add(options, 'reset');



