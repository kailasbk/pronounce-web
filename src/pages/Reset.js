import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Paper, Typography, makeStyles, TextField, Divider, Button } from '@material-ui/core';
import { Alert } from '@material-ui/lab';

const useStyles = makeStyles({
	pane: {
		padding: '10px',
		maxWidth: '600px',
		margin: 'auto'
	},
	item: {
		display: 'flex',
		marginTop: '10px',
		width: '100%'
	}
});

export default function Reset() {
	const styles = useStyles();
	const { type, id } = useParams();
	const [done, setDone] = useState(0);
	const [value, setValue] = useState('');
	const [confirm, setConfirm] = useState('');
	const [same, setSame] = useState(true);
	const [valid, setValid] = useState(true);

	function checkValidity() {
		if (type === 'password') {
			const valid = (value.length >= 8);
			setValid(valid);
			return valid;
		}
		else if (type === 'email') {
			const valid = document.getElementById('value').checkValidity();
			setValid(valid);
			return valid;
		}
	}

	function handleSubmit(e) {
		if (checkValidity()) {
			if (value === confirm) {
				setSame(true);
				fetch(`${process.env.REACT_APP_API_HOST}/account/reset/${type}`,
					{
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							id,
							value
						})
					})
					.then(res => {
						if (res.ok) {
							setDone(1);
						}
						else {
							setDone(2);
						}
					});
			}
			else {
				setSame(false);
				setDone(0);
			}
		}
	}

	return (
		<Paper className={styles.pane}>
			<Typography> Enter your new {type}:</Typography>
			<Divider />
			<Alert severity="error" style={!same ? { marginTop: '10px' } : { display: 'none' }}> The {type}s must match </Alert>
			<Alert severity="warning" style={!valid ? { marginTop: '10px' } : { display: 'none' }}> The {type} is not valid </Alert>
			<Alert severity="success" style={done === 1 ? { marginTop: '10px' } : { display: 'none' }}> {type.charAt(0).toUpperCase() + type.slice(1)} reset successfully! </Alert>
			<Alert severity="error" style={done === 2 ? { marginTop: '10px' } : { display: 'none' }}> {type.charAt(0).toUpperCase() + type.slice(1)} reset failed! </Alert>
			<div>
				<TextField id="value" placeholder={`New ${type}`} type={type} variant="outlined" className={styles.item} value={value} onChange={(e) => setValue(e.target.value)}></TextField>
				<TextField placeholder={`Confirm ${type}`} type={type} variant="outlined" className={styles.item} value={confirm} onChange={(e) => setConfirm(e.target.value)}></TextField>
				<Button className={styles.item} onClick={handleSubmit}> Submit </Button>
			</div>
		</Paper>
	);
}