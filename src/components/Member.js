import React, { useState, useEffect } from 'react';
import { Card, Divider, Typography, Grid, Avatar, Badge, IconButton } from '@material-ui/core';
import { PlayArrow, Stop, Star } from '@material-ui/icons';
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

	function handlePlaying(e) {
		if (info.audiosrc) {
			const audio = document.getElementById(`audio-${props.username}`);
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
			<Card style={{ padding: '10px', paddingTop: '0', position: 'relative' }}>
				{props.owner &&
					<Star style={{ position: 'absolute', top: '10px', right: '10px' }} />
				}
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Badge
						style={{ margin: '10px', marginLeft: '0px' }}
						overlap="circle"
						anchorOrigin={{
							vertical: 'bottom',
							horizontal: 'right',
						}}
						badgeContent={
							<div>
								{info.audiosrc &&
									<audio src={info.audiosrc} id={'audio-' + props.username} onEnded={() => setPlaying(false)}></audio>
								}
								<IconButton onClick={handlePlaying} style={{ padding: '3px' }}>
									{isPlaying ? <Stop /> : <PlayArrow />}
								</IconButton>
							</div>
						}
					>
						<Avatar src={info.picturesrc} style={{ width: '60px', height: '60px' }} />
					</Badge>
					<Typography variant="h6"> {info.firstname} {info.nickname ? `"${info.nickname}"` : ''} {info.lastname} </Typography>
				</div >
				<Divider style={{ marginBottom: '10px' }} />
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