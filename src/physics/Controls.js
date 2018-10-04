// // Options to be added to the GUI
// import { config, setConfig } from './Config.js';
// import * as dat from 'dat.gui';
// import { init } from './Initialize.js';
// import { GameLoop } from '../app.js';

// let localConfig = {
//   whichBroad: 3,
//   bounds: 100,
//   numObjects: 500,
//   gravity: 9.8,
//   radius: 0.5,
//   initialVelocity: 3000,
//   drag: 0,
//   cof: 1
// };

// var options = {
//   reset: function() {
//     setConfig(localConfig);
//     init();
//   }
// };

// // DAT.GUI Related Stuff
// var gui = new dat.GUI();


// var physics = gui.addFolder('Config');
// physics.add(localConfig, 'whichBroad').name('Algorithm').min(1).max(2).step(1);
// physics.add(localConfig, 'bounds').name('Bounds').min(4).max(10000).step(1);
// physics.add(localConfig, 'numObjects').name('# Objects');
// physics.add(localConfig, 'gravity').name('Gravity').min(-100).max(100).step(1);
// physics.add(localConfig, 'radius').name('Radius').min(1).max(10).step(.5);
// physics.add(localConfig, 'initialVelocity', 0, 3).name('Initial Velocity').min(0).max(10000).step(1);
// physics.add(localConfig, 'drag').name('Drag').min(0).max(.1).step(0.0001);
// physics.add(localConfig, 'cof').name('Elasticity').min(0).max(1).step(0.01);

// gui.add(options, 'reset');



