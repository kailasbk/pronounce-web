import React, { useState, useEffect } from 'react';
import { Redirect, Link, useLocation } from 'react-router-dom';
import { makeStyles, Typography, Paper, Button, TextField, Divider } from '@material-ui/core';
import { Alert } from '@material-ui/lab'
import token from '../token.js'

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
});

export default function Login() {
	const styles = useStyles();
	const location = useLocation();
	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [error, setError] = useState('');
	const [submitted, setSubmitted] = useState();

	useEffect(() => {
		if (sessionStorage.getItem('token') !== '') {
			// validate the refresh token
			console.log('Has a refresh key. Logging in...');
			token.set(sessionStorage.getItem('token'));
			// if valid (given a JWT) set submitted to true
			setSubmitted(true);
		}
	}, []);

	function handleSubmit(e) {
		if (username === "") {
			setError('eUser');
			return;
		}
		else if (password === "") {
			setError('ePass');
			return;
		}
		let data = {
			username: username,
			password: password
		}
		fetch('http://localhost:3001/user/login', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		})
			.then(res => {
				if (res.ok) {
					setError('');
					return res.text();
				}
				else if (res.status !== 500) {
					setError('wrong');
					return '';
				}
				return '';
			})
			.then(text => {
				token.set(text);
				token.setRefresh(text); // change with refresh key in future
				if (token.get() !== '') {
					console.log('Token set successfully');
					setSubmitted(true);
				}
			});
	}

	if (submitted) {
		if (location.state) {
			return <Redirect to={location.state.from} />
		}
		else {
			return <Redirect to="/" />
		}
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Login </Typography>
			<Divider />
			<Alert severity="error" style={error === 'wrong' ? { marginTop: '10px' } : { display: 'none' }} >The username / password combination was invalid</Alert>
			<TextField className={styles.input} value={username} error={error === 'eUser' ? true : false} onChange={(e) => setUsername(e.target.value)} label="Username" variant="outlined"
				onKeyPress={(e) => { if (e.key === 'Enter') { document.getElementById('password').focus() } }} />
			<TextField className={styles.input} id="password" value={password} error={error === 'ePass' ? true : false} onChange={(e) => setPassword(e.target.value)} label="Password" type="password" variant="outlined"
				onKeyPress={(e) => { if (e.key === 'Enter') { handleSubmit() } }} />
			<Button style={{ width: '100%', marginTop: '10px' }} variant="contained" color="primary" onClick={handleSubmit}> Login </Button>
			<Link to="/register" style={{ textDecoration: 'none' }}>
				<Button style={{ width: '100%', marginTop: '10px' }} variant="contained" color="secondary">
					Don't have an account? Sign-up here.
				</Button>
			</Link>
		</Paper >
	)
}