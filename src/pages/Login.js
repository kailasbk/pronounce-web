import React, { useState, useEffect } from 'react';
import { Redirect, Link, useLocation } from 'react-router-dom';
import { makeStyles, Typography, Paper, Button, TextField, Divider } from '@material-ui/core';
import { Alert } from '@material-ui/lab'
import token from '../js/token.js'
import fetchUser from '../js/fetchUser.js'

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
	const [submitted, setSubmitted] = useState(0);

	useEffect(() => {
		if (token.get() || token.getRefresh()) {
			// validate the refresh token
			console.log('Has a refresh key. Logging in...');
			token.set(sessionStorage.getItem('token'));
			// if valid (given a JWT) set submitted to true
			setSubmitted(1);
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
		fetch(`${process.env.REACT_APP_API_HOST}/account/login`, {
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
				else if (res.status === 404) {
					setError('wrong');
				}
				else if (res.status === 401) {
					setError('unverified');
				}
				throw new Error('failed login');
			})
			.then(text => {
				token.set(text);
				token.setRefresh(text); // change with refresh key in future
			})
			.then(() => fetchUser(0, new AbortController()))
			.then(user => {
				if (token.get()) {
					console.log('Token set successfully');
					if (!user.audiosrc || !user.picturesrc) {
						setSubmitted(2);
					}
					else {
						setSubmitted(1);
					}
				}
			})
			.catch(err => console.log(err));
	}

	function handleResend(e) {
		e.preventDefault();
		fetch(`${process.env.REACT_APP_API_HOST}/account/resend/${username}`, { method: 'POST' });
	}

	if (submitted) {
		if (submitted === 1) {
			if (location.state) {
				return <Redirect to={location.state.from} />
			}
			else {
				return <Redirect to="/" />
			}
		}
		else if (submitted === 2) {
			return <Redirect to='/start' />
		}
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Login </Typography>
			<Divider />
			<Alert severity="error" style={error === 'wrong' ? { marginTop: '10px' } : { display: 'none' }} > The username / password combination was invalid </Alert>
			<Alert severity="warning" style={error === 'unverified' ? { marginTop: '10px' } : { display: 'none' }} > The account has not been verified. <a onClick={handleResend} href='/'>Resend?</a> </Alert>
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