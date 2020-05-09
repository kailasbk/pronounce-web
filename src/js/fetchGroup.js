import token from './token.js'

async function fetchGroup(id, controller) {
	return fetch(`http://localhost:3001/group/${id}`,
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