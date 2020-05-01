import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme, Paper, Divider, Typography, Button } from '@material-ui/core';
import ProfileUpload from '../components/ProfileUpload'
import Recorder from '../components/Recorder';
import token from '../js/token.js';
import fetchUser from '../js/fetchUser.js';

const useStyles = makeStyles(theme => ({
	pane: {
		padding: '10px'
	},
	bar: {
		minHeight: '40px',
		display: 'flex',
		alignItems: 'center',
		flexFlow: 'wrap'
	},
	spacer: {
		flexGrow: 1
	},
	skeletonUsername: {
		flexGrow: 1,
		height: '45px',
		borderRadius: '5px',
		backgroundColor: '#bdbdbd'
	},
	skeletonField: {
		width: '120px',
		height: '24px',
		borderRadius: '2px',
		backgroundColor: '#bdbdbd'
	}
}));

export default function Account() {
	const styles = useStyles();
	const theme = useTheme();
	const history = useHistory();
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

	function handleLogout(e) {
		token.clear();
		history.push('/login', { from: '/' });
	}

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

	function Bar(props) {
		return (
			<Typography className={styles.bar}>
				<span>{props.field + ': '}</span>
				<span className={styles.spacer} />
				<span className={!props.value ? styles.skeletonField : ''}>{props.value}</span>
			</Typography>
		);
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Account </Typography>
			<Divider />
			<div style={{ position: 'relative', display: 'flex', alignItems: 'center', margin: '20px' }}>
				<ProfileUpload picturesrc={info.picturesrc} update={updatePicture} />
				<span className={styles.spacer} />
				<Typography className={!info.username ? styles.skeletonUsername : ''} style={{ display: 'inline-block' }} variant="h4">{info.username}</Typography>
				<span className={styles.spacer} />
			</div>
			<Divider />
			<Bar field="Firstname" value={info.firstname} />
			<Divider />
			<Bar field="Lastname" value={info.lastname} />
			<Divider />
			<Bar field="Pronouns" value={info.pronouns} />
			<Divider />
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Typography style={{ flexGrow: 3, flexBasis: '50%' }}> Pronouncation: </Typography>
				<Recorder audiosrc={info.audiosrc} update={updateAudio} />
			</div>
			<Divider />
			<Bar field="Email" value={info.email} />
			<Divider />
			<Button style={{ width: '100%', marginTop: '10px', backgroundColor: theme.palette.info.main, color: '#ffffff' }} variant='contained'> Change Email </Button>
			<Button style={{ width: '100%', marginTop: '10px' }} color='secondary' variant='contained'> Reset Password </Button>
			<Button style={{ width: '100%', marginTop: '10px' }} color='secondary' variant='contained' onClick={handleLogout}> Logout </Button>
		</Paper >
	);
}