import React, { useState, useEffect } from 'react';
import { Redirect, Link } from 'react-router-dom'
import { makeStyles, Typography, Paper, Button, TextField, Divider } from '@material-ui/core';
import { Alert } from '@material-ui/lab'

const useStyles = makeStyles({
	pane: {
		margin: 'auto',
		padding: '10px',
		maxWidth: '600px'
	},
	input: {
		marginTop: '10px',
		width: '100%'
	},
	name: {
		marginTop: '10px',
		width: '49.3%'
	}
});

export default function Register() {
	const styles = useStyles();
	const [email, setEmail] = useState('');
	const [first, setFirst] = useState('');
	const [last, setLast] = useState('')
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [error, setError] = useState('');
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		let url = new URL(document.location.href);
		if (url.searchParams.get('email') !== null) {
			setEmail(url.searchParams.get('email'));
		}
	}, []);

	function isValid(password) {
		return (password.length >= 8);
	}

	function handleSubmit(e) {
		if (!document.getElementById('email').checkValidity()) {
			setError('The email address is not valid');
			return;
		}
		else if (first === "" || last === "") {
			setError('The first or last name is empty');
			return;
		}
		else if (username === "") {
			setError('The username is empty');
			return;
		}
		else if (!isValid(password)) {
			setError('The password is not valid');
			return;
		}
		else if (password !== confirm) {
			setError('The passwords do not match');
			return;
		}
		else {
			let data = {
				username: username,
				password: password,
				firstname: first,
				lastname: last,
				email: email
			}
			fetch('http://localhost:3001/user/register',
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify(data)
				})
				.then(res => {
					if (res.ok) {
						setSubmitted(true);
					}
					else if (res.status === 400) {
						setError(`The username: ${username} is already taken`);
					}
				});
		}
	}

	if (submitted) {
		return <Redirect to="/login" />;
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Register </Typography>
			<Divider />
			<Alert severity="error" style={error !== '' ? { marginTop: '10px' } : { display: 'none' }}> {error} </Alert>
			<TextField className={styles.input} id="email" value={email} onChange={(e) => setEmail(e.target.value)} label="Email" type="email" variant="outlined" size="small" />
			<TextField className={styles.name} value={first} onChange={(e) => setFirst(e.target.value)} style={{ marginRight: '.7%' }} label="Firstname" variant="outlined" size="small" />
			<TextField className={styles.name} value={last} onChange={(e) => setLast(e.target.value)} style={{ marginLeft: '.7%' }} label="Lastname" variant="outlined" size="small" />
			<TextField className={styles.input} value={username} onChange={(e) => setUsername(e.target.value)} label="Username" variant="outlined" />
			<TextField className={styles.input} value={password} onChange={(e) => setPassword(e.target.value)} label="Password" type="password" variant="outlined" />
			<TextField className={styles.input} value={confirm} onChange={(e) => setConfirm(e.target.value)} label="Confirm Password" type="password" variant="outlined" />
			<Button style={{ width: '100%', marginTop: '5px' }} variant="contained" color="primary" onClick={handleSubmit}> Register </Button>
			<Link to="/login" style={{ textDecoration: 'none' }}>
				<Button style={{ width: '100%', marginTop: '10px' }} variant="contained" color="secondary">
					Already have an account? Login here.
				</Button>
			</Link>
		</Paper>
	);
}