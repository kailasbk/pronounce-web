import token from './token.js';

async function fetchUser(id, controller) {
	const jsonFetch = fetch(`${process.env.REACT_APP_API_HOST}/user/${id}`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.json());

	const pictureFetch = fetch(`${process.env.REACT_APP_API_HOST}/user/${id}/picture`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.blob());

	const audioFetch = fetch(`${process.env.REACT_APP_API_HOST}/user/${id}/audio`,
		{
			method: 'GET',
			headers: {
				'Authorization': `Bearer ${token.get()}`
			},
			signal: controller.signal
		})
		.then(res => res.blob());

	const [json, picture, audio] = await Promise.all([jsonFetch, pictureFetch, audioFetch]);

	const audiosrc = audio.size === 0 ? '' : URL.createObjectURL(audio);
	const picturesrc = picture.size === 0 ? '' : URL.createObjectURL(picture);

	return {
		username: json.username,
		firstname: json.firstname,
		nickname: json.nickname,
		lastname: json.lastname,
		pronouns: json.pronouns,
		email: json.email,
		picturesrc: picturesrc,
		audiosrc: audiosrc
	}
}

export default fetchUser;