import token from './token.js'

async function fetchGroup(id, controller) {
	return fetch(`${process.env.REACT_APP_API_HOST}/group/${id}`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.json());
}

export default fetchGroup;