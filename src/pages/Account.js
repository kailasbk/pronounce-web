import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { makeStyles, useTheme, Paper, Divider, Typography, Button, IconButton, TextField } from '@material-ui/core';
import { Edit, Save } from '@material-ui/icons';
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
		nickname: '',
		lastname: '',
		pronouns: '',
		email: '',
		picturesrc: '',
		audiosrc: ''
	});
	const [edit, setEdit] = useState(0); // 0 is not editing

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

	useEffect(() => {
		const controller = new AbortController();
		if (edit === 2) {
			fetch(`${process.env.REACT_APP_API_HOST}/user/0/update`,
				{
					method: 'PUT',
					headers: {
						'Authorization': `Bearer ${token.get()}`,
						'Content-Type': 'application/json'
					},
					signal: controller.signal,
					body: JSON.stringify({
						firstname: info.firstname,
						nickname: info.nickname,
						lastname: info.lastname,
						pronouns: info.pronouns,
					})
				})
				.then(res => setEdit(0))
				.catch(err => {
					if (err.name === "AbortError") {
						console.log('Aborted fetch request.');
					}
				});
			// update the info later on for error catching
		}
		return function cleanup() { controller.abort() }
	}, [edit, info]);
  
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

	function handleEdit(e) {
		if (edit === 0) {
			setEdit(1);
		}
		else if (edit === 1) {
			setEdit(2);
		}
		else {
			setEdit(0);
		}
	}

	function Bar(props) {
		return (
			<Typography className={styles.bar}>
				<span>{props.field + ': '}</span>
				<span className={styles.spacer} />
				<span className={!info.username ? styles.skeletonField : ''}>{props.value}</span>
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
				<IconButton onClick={handleEdit}> {edit ? <Save /> : <Edit />} </IconButton>
				<span className={styles.spacer} />
			</div>
			{edit ?
				<>
					<Divider />
					<Typography className={styles.bar}>
						<span>Firstname: </span>
						<span className={styles.spacer} />
						<TextField value={info.firstname} onChange={(e) => { const value = e.target.value; setInfo(old => ({ ...old, firstname: value })) }} />
					</Typography >
					<Divider />
					<Typography className={styles.bar}>
						<span>Nickname: </span>
						<span className={styles.spacer} />
						<TextField value={info.nickname} onChange={(e) => { const value = e.target.value; setInfo(old => ({ ...old, nickname: value })) }} />
					</Typography >
					<Divider />
					<Typography className={styles.bar}>
						<span>Lastname: </span>
						<span className={styles.spacer} />
						<TextField value={info.lastname} onChange={(e) => { const value = e.target.value; setInfo(old => ({ ...old, lastname: value })) }} />
					</Typography >
					<Divider />
					<Typography className={styles.bar}>
						<span>Pronouns: </span>
						<span className={styles.spacer} />
						<TextField value={info.pronouns} onChange={(e) => { const value = e.target.value; setInfo(old => ({ ...old, pronouns: value })) }} />
					</Typography >
					<Divider />
				</>
				:
				<>
					<Divider />
					<Bar field="Firstname" value={info.firstname} />
					<Divider />
					<Bar field="Nickname" value={info.nickname} />
					<Divider />
					<Bar field="Lastname" value={info.lastname} />
					<Divider />
					<Bar field="Pronouns" value={info.pronouns} />
					<Divider />
				</>
			}
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