import token from './token.js';

async function fetchUser(id, controller) {
	const jsonFetch = fetch(`http://localhost:3001/user/${id}`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.json());

	const pictureFetch = fetch(`http://localhost:3001/user/${id}/picture`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.blob());

	const audioFetch = fetch(`http://localhost:3001/user/${id}/audio`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.blob());

	const [json, picture, audio] = await Promise.all([jsonFetch, pictureFetch, audioFetch]);

	let audiosrc;
	if (audio.size === 0) {
		audiosrc = '';
	}
	else {
		audiosrc = URL.createObjectURL(audio)
	}

	return {
		username: json.username,
		firstname: json.firstname,
		lastname: json.lastname,
		pronouns: json.pronouns,
		email: json.email,
		picturesrc: URL.createObjectURL(picture),
		audiosrc: audiosrc
	}
}

export default fetchUser;