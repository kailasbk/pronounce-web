import React, { useState, useEffect } from 'react';
import { makeStyles, useTheme, Paper, Divider, Typography, Avatar, Button, ButtonGroup, Badge, IconButton } from '@material-ui/core';
import { AddCircleTwoTone, PlayArrow, Stop, RecordVoiceOver, Publish, DeleteForever } from '@material-ui/icons'
import token from '../token.js';

const useStyles = makeStyles(theme => ({
	pane: {
		padding: '10px'
	},
	profilePic: {
		display: 'inline-flex',
		minWidth: '60px',
		minHeight: '60px',
		[theme.breakpoints.up('sm')]: {
			width: '120px',
			height: '120px'
		}
	},
	bar: {
		minHeight: '40px',
		display: 'flex',
		alignItems: 'center',
		flexFlow: 'wrap'
	},
	username: {
		display: 'inline-block',
	},
	spacer: {
		flexGrow: 1
	},
	emptyUsername: {
		flexGrow: 1,
		height: '45px',
		borderRadius: '5px',
		backgroundColor: '#bdbdbd'
	},
	emptyName: {
		width: '100px',
		height: '24px',
		borderRadius: '2px',
		backgroundColor: '#bdbdbd'
	},
	emptyEmail: {
		width: '160px',
		height: '24px',
		borderRadius: '2px',
		backgroundColor: '#bdbdbd'
	}
}));

export default function Account() {
	const styles = useStyles();
	const theme = useTheme();
	const [info, setInfo] = useState({
		username: '',
		firstname: '',
		lastname: '',
		email: '',
		picturesrc: '',
		audiosrc: ''
	});
	const [isPlaying, setPlaying] = useState(false);
	const [isRecording, setRecording] = useState(false);
	const [preview, setPreview] = useState('');
	const [recorder, setRecorder] = useState(null);

	// get data from API with fetch
	useEffect(() => {
		(async function () {
			const json = await fetch('http://localhost:3001/user/me',
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token.get()}`
					}
				})
				.then(res => res.json());

			const newInfo = {
				username: json.username,
				firstname: json.firstname,
				lastname: json.lastname,
				email: json.email,
				picturesrc: '',
				audiosrc: ''
			}

			if (json.picture !== null) {
				const picture = new Blob([new Uint8Array(json.picture.data)], { type: 'image/jpeg' });
				newInfo.picturesrc = URL.createObjectURL(picture);
			}

			if (json.audio !== null) {
				const audio = new Blob([new Uint8Array(json.audio.data)], { type: 'audio/m4a' });
				newInfo.audiosrc = URL.createObjectURL(audio);
			}

			setInfo(newInfo);
		})();
		return function cleanup() { }
	}, []);

	async function handleUploadProfile(e) {
		const data = new FormData();
		data.append('image', e.target.files[0]);

		const picture = await fetch(`http://localhost:3001/picture`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				body: data
			})
			.then(() => {
				return fetch(`http://localhost:3001/picture/me`,
					{
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token.get()}`
						}
					});
			})
			.then(res => res.blob());

		setInfo(old => {
			URL.revokeObjectURL(old.picturesrc);
			return { ...old, picturesrc: URL.createObjectURL(picture) };
		});
	}

	async function handleUploadAudio(e) {
		const data = new FormData();
		await fetch(preview)
			.then(res => res.blob())
			.then(blob => data.append('file', blob));

		const audio = await fetch(`http://localhost:3001/audio`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				body: data
			})
			.then((res) => {
				if (res.ok) {
					handleDeleteAudio();
					return fetch(`http://localhost:3001/audio/me`,
						{
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${token.get()}`
							}
						});
				}
				return null;
			})
			.then(res => {
				if (res !== null) {
					return res.blob();
				}
				return new Blob();
			});

		setInfo(old => {
			URL.revokeObjectURL(old.audiosrc);
			return { ...old, audiosrc: URL.createObjectURL(audio) };
		});
	}

	function handleDeleteAudio(e) {
		URL.revokeObjectURL(preview);
		setPreview('');
	}

	function handleAudio(e) {
		if (info.audiosrc !== '' || preview !== '') {
			const audio = document.getElementById('pronounciation');
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

	function handleRecord(e) {
		if (recorder === null) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(stream => setRecorder(new MediaRecorder(stream)))
				.catch(error => console.log(error));
			setRecording(true);
		}
		else if (isRecording) {
			recorder.stop();
			recorder.stream.getAudioTracks()[0].stop();
			setRecorder(null);
			setRecording(false);
		}
	}

	useEffect(() => {
		if (recorder !== null) {
			recorder.ondataavailable = (e) => {
				URL.revokeObjectURL(preview);
				let url = URL.createObjectURL(e.data);
				setPreview(url);
				console.log('Recording Finished');
			};

			if (isRecording) {
				recorder.start();
			}
		}
	}, [recorder, isRecording, preview]);

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Account </Typography>
			<Divider />
			<div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '20px' }}>
				<Badge
					overlap="circle"
					anchorOrigin={{
						vertical: 'bottom',
						horizontal: 'right',
					}}
					badgeContent={
						<div>
							<input id="upload-profile-pic" accept="image/*" type="file" style={{ display: 'none' }} onChange={handleUploadProfile} />
							<IconButton component="label" htmlFor="upload-profile-pic">
								<AddCircleTwoTone fontSize="large"></AddCircleTwoTone>
							</IconButton>
						</div>
					}
					style={{ marginRight: '10px' }}
				>
					<Avatar className={styles.profilePic} src={info.picturesrc} />
				</Badge>
				<span className={styles.spacer} />
				<Typography className={(info.username === '') ? styles.emptyUsername : styles.username} variant="h4">{info.username}</Typography>
				<span className={styles.spacer} />
			</div>
			<Divider />
			<Typography className={styles.bar}>
				<span>Firstname: </span>
				<span className={styles.spacer} />
				<span className={(info.first === '') ? styles.emptyName : ''}>{info.firstname}</span>
			</Typography>
			<Divider />
			<Typography className={styles.bar}>
				<span>Lastname: </span>
				<span className={styles.spacer} />
				<span className={(info.last === '') ? styles.emptyName : ''}>{info.lastname}</span>
			</Typography>
			<Divider />
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Typography style={{ flexGrow: 3, flexBasis: '60%' }}> Pronouncation: </Typography>
				{info.audiosrc !== '' ?
					<audio id="pronounciation" style={{ display: 'none' }} onEnded={() => setPlaying(false)} src={(preview === '') ? info.audiosrc : preview} />
					:
					<> </>
				}
				<ButtonGroup style={{ maxWidth: '300px', minWidth: '166px', marginTop: '5px', marginBottom: '5px', flexBasis: '40%', flexGrow: 2 }}>
					<Button style={{ width: '50%' }} color={info.audiosrc !== '' || preview !== '' ? 'primary' : 'secondary'} variant='contained' onClick={handleAudio}>
						{isPlaying ? <Stop /> : <PlayArrow />}
					</Button>
					{(preview === '') ?
						<Button style={{ width: '50%' }} color='primary' variant='contained' onClick={handleRecord}>
							<RecordVoiceOver />
						</Button>
						:
						[
							<Button key={0} style={{ width: '25%', color: '#ffffff', backgroundColor: theme.palette.success.main }} variant='contained' onClick={handleUploadAudio}>
								<Publish />
							</Button>
							,
							<Button key={1} style={{ width: '25%', color: '#ffffff', backgroundColor: theme.palette.error.main }} variant='contained' onClick={handleDeleteAudio}>
								<DeleteForever />
							</Button>
						]
					}
				</ButtonGroup>
			</div>
			<Divider />
			<Typography className={styles.bar}>
				<span>Email: </span>
				<span className={styles.spacer} />
				<span className={(info.email === '') ? styles.emptyEmail : ''}>{info.email}</span>
			</Typography>
			<Divider />
			<Button style={{ width: '100%', marginTop: '10px', backgroundColor: theme.palette.info.main, color: '#ffffff' }} variant='contained'> Change Email </Button>
			<Button style={{ width: '100%', marginTop: '10px' }} color='secondary' variant='contained'> Reset Password </Button>
		</Paper >
	);
}