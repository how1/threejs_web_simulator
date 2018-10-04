export const Plane = (m, n, v1, v2, p) => {
	return {
		mesh: m,
		name: n,
		vec1: v1,
		vec2: v2,
		pop: p //point on plane
	};
};