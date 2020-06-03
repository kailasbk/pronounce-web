import React, { useState, useEffect } from 'react';
import { Card, Divider, Typography, Grid, Avatar, Badge, IconButton } from '@material-ui/core';
import { Star, PlayArrowRounded, Stop } from '@material-ui/icons';
import fetchUser from '../js/fetchUser.js'

function Member(props) {
	const [info, setInfo] = useState({
		username: '',
		firstname: '',
		nickname: '',
		lastname: '',
		pronouns: '',
		email: '',
		picturesrc: '',
		audiosrc: ''
	});
	const [isPlaying, setPlaying] = useState(false);
	const [audio, setAudio] = useState(null);

	useEffect(() => {
		const controller = new AbortController();
		(async function () {
			if (props.username) {
				try {
					const newInfo = await fetchUser(props.username, controller);
					setInfo(newInfo);
				} catch (err) {
					if (err.name === "AbortError") {
						console.log('Aborted fetch request.');
					}
				}
			}
		})();

		return function cleanup() { controller.abort() };
	}, [props.username]);

	useEffect(() => {
		if (info.audiosrc) {
			const el = new Audio(info.audiosrc);
			el.onended = () => {
				setPlaying(false);
			}
			setAudio(el);
		}
	}, [info.audiosrc]);

	function handlePlaying(e) {
		if (audio) {
			if (isPlaying) {
				audio.pause();
				audio.currentTime = 0;
			}
			else {
				audio.play();
			}
			setPlaying(!isPlaying);
		}
	}

	return (
		<Grid item xs={12} sm={6} md={4}>
			<Card style={{ padding: '10px', position: 'relative' }}>
				{props.owner &&
					<Star style={{ position: 'absolute', top: '10px', right: '10px' }} />
				}
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Badge
						style={{ marginRight: '10px', position: 'relative' }}
					>
						<Avatar src={info.picturesrc} style={{ width: '80px', height: '80px' }} />

					</Badge>
					<IconButton onClick={handlePlaying} style={{ position: 'absolute', fontSize: '4rem', color: 'rgba(255, 255, 255, .7)', width: '80px', height: '80px' }}>
						{isPlaying ? <Stop fontSize="inherit" color="inherit" /> : <PlayArrowRounded fontSize="inherit" color="inherit" />}
					</IconButton>
					<Typography variant="h6"> {info.firstname} {info.nickname ? `"${info.nickname}"` : ''} {info.lastname} </Typography>
				</div >
				<Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
				{info.pronouns &&
					<Typography> {info.pronouns} </Typography>
				}
				<Typography> {info.username} </Typography>
				<Typography> <a href={'mailto:' + info.email}>{info.email}</a> </Typography>
			</Card >
		</Grid >
	)
}

export default Member;