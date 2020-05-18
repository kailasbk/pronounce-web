const token = (function () {
	let innerToken = '';

	return {
		get: function () {
			return innerToken;
		},
		set: function (value) {
			innerToken = value;
		},
		getRefresh: function () {
			return sessionStorage.getItem('token');
		},
		setRefresh: function (value) {
			sessionStorage.setItem('token', value);
		},
		clear: function () {
			innerToken = '';
			sessionStorage.setItem('token', '');
		}
	}
})();

export default token;