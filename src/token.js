const token = (function () {
	let innerToken = '';

	return {
		get: function () {
			return innerToken;
		},
		set: function (value) {
			innerToken = value;
		}
	}
})();

export default token;