import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Typography, Paper, Button, Divider, useTheme } from '@material-ui/core';
import ProfileUpload from '../components/ProfileUpload';
import Recorder from '../components/Recorder';
import fetchUser from '../js/fetchUser.js';

const useStyles = makeStyles({
	pane: {
		margin: 'auto',
		padding: '10px',
		maxWidth: '500px'
	}
});

function Start() {
	const styles = useStyles();
	const theme = useTheme();
	const [info, setInfo] = useState({
		username: '',
		firstname: '',
		lastname: '',
		pronouns: '',
		email: '',
		picturesrc: '',
		audiosrc: ''
	});

	useEffect(() => {
		const controller = new AbortController();
		(async function () {
			try {
				const newInfo = await fetchUser(0, controller);
				setInfo(newInfo);
			} catch (err) {
				if (err.name === "AbortError") {
					console.log('Aborted fetch request.');
				}
			}
		})();

		return function cleanup() { controller.abort() }
	}, []);

	function updatePicture(picture) {
		setInfo(old => {
			URL.revokeObjectURL(old.picturesrc);
			return { ...old, picturesrc: picture };
		});
	}

	function updateAudio(audio) {
		setInfo(old => {
			URL.revokeObjectURL(old.audiosrc);
			return { ...old, audiosrc: audio };
		});
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Finish account </Typography>
			<Divider style={{ marginBottom: '5px' }} />
			<Typography style={{ marginBottom: '20px' }}>
				Your account is almost ready. Please upload of profile picture and record the pronounciation of your name.
			</Typography>
			<div style={{ display: 'flex', justifyContent: 'center', width: '100%', marginBottom: '20px' }}>
				<ProfileUpload picturesrc={info.picturesrc} update={updatePicture} />
			</div>
			<div style={{ display: 'flex', justifyContent: 'center', width: '100%' }}>
				<Recorder audiosrc={info.audiosrc} update={updateAudio} />
			</div>
			<Link to="/" style={{ display: 'flex', textDecoration: 'none', width: '100%', justifyContent: 'center' }}>
				<Button
					style={{ maxWidth: '300px', flexBasis: '300px', color: '#ffffff', backgroundColor: info.picturesrc && info.audiosrc ? theme.palette.success.main : theme.palette.error.main }}
					variant="contained">
					{info.picturesrc && info.audiosrc ?
						'All set! Continue.'
						:
						`I'll do this later. Continue.`
					}
				</Button>
			</Link>
		</Paper>
	);
}

export default Start;