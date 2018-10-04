// import * as THREE from 'three';
import * as THREE from "three";

export const Particle = (mesh, radius = 0.5, mass = 1, isStatic = false) => {
	return {
		mesh,
		oldPosition: new THREE.Vector3(),
		radius,
		mass,				// [kg]
		velocityVector: new THREE.Vector3(),	// [m s^-1]
		netForceVector: new THREE.Vector3(),	// N [kg m s^-2]
		isStatic,
		mins: [], //endpoints
		maxs: [],
		minIndex: [],
		maxIndex: [],
		index: -1,
		didMove: false,
		projectedArea: Math.PI * (radius * radius),
		status: 0,
		planeStatus: 0,
		forceVectorList: [],

		AddForce: function(forceVector) {
			this.forceVectorList.push(forceVector);
		},

		SumForces: function() {
			if (this.forceVectorList.length > 0){
				this.netForceVector = new THREE.Vector3();
				this.forceVectorList.forEach((vec) => {
					this.netForceVector.add(vec);
				});
				this.forceVectorList = [];
			}
		},

		updateDrag: function(drag) {
			if (!isStatic){
				const speed = this.velocityVector.length();
				const dragSize = this.CalculateDrag (speed);
				let tmp = new THREE.Vector3();
				tmp.copy(this.velocityVector);
				tmp.negate();
				tmp.normalize();
				const dragVector = new THREE.Vector3();
				dragVector.copy(tmp.multiplyScalar(drag * dragSize));
				this.AddForce (dragVector);
			}
		},

		CalculateDrag: function(speed) {
			//F_D =0.5 rho * v^2 * C_d * A
			const rho = 1.225;
			return 0.5 * rho * Math.pow(speed, 2) * this.projectedArea;
		}
	};
};

