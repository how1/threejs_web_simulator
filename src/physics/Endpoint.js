
export const Endpoint = (body, value, isMin) => {
	return {

		body,
		value,
		isMin,

		Compare: function(a, b){
			if (a.value > b.value){
				return 1;
			} if (a.value < b.value){
				return -1;
			} else {
				return 0;
			}
		}

	};
};