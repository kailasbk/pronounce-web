import React, { useState, useEffect } from 'react';
import { Paper, Typography, Divider, ButtonGroup, IconButton, makeStyles, Avatar } from '@material-ui/core';
import { Check, Clear } from '@material-ui/icons';
import token from '../js/token.js';

const useStyles = makeStyles(theme => ({
	check: {
		'&:hover': {
			backgroundColor: theme.palette.success.main
		}
	},
	cross: {
		'&:hover': {
			backgroundColor: theme.palette.error.light
		}
	}
}))

function Invite(props) {
	const styles = useStyles();
	const [info, setInfo] = useState({
		name: '',
		username: '',
		group: ''
	});
	const [src, setSrc] = useState('');

	function handleAccept(e) {
		fetch(`http://localhost:3001/invite/${props.id}/accept`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => props.refresh())
	}

	function handleReject(e) {
		fetch(`http://localhost:3001/invite/${props.id}/reject`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => props.refresh())
	}

	useEffect(() => {
		fetch(`http://localhost:3001/invite/${props.id}`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => res.json())
			.then(json => setInfo(json))
	}, [props.id]);

	useEffect(() => {
		const controller = new AbortController();

		if (info.username) {
			fetch(`http://localhost:3001/user/${info.username}/picture`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token.get()}`
					},
					signal: controller.signal
				})
				.then(res => res.blob())
				.then(blob => setSrc(URL.createObjectURL(blob)))
				.catch(err => console.log(err))
		}

		return function cleanup() { controller.abort() }
	}, [info])

	return (
		<div style={{ height: '50px', display: 'flex', alignItems: 'center' }}>
			<Avatar style={{ marginRight: '10px' }} src={src} />
			<Typography style={{ fontSize: '20px' }}>{info.name} has invited you to join <i>{info.group}</i></Typography>
			<span style={{ flexGrow: 1 }} />
			<ButtonGroup>
				<IconButton className={styles.check} onClick={handleAccept}> <Check /> </IconButton>
				<IconButton className={styles.cross} onClick={handleReject}> <Clear /> </IconButton>
			</ButtonGroup>
		</div >
	)
}

export default function Invites() {
	const [invites, setInvites] = useState([]);
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		fetch('http://localhost:3001/user/0/invites',
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => res.json())
			.then(json => setInvites(json))
	}, [refresh]);

	return (
		<Paper style={{ padding: '10px' }}>
			<Typography variant="h5"> Invites </Typography>
			<Divider />
			{invites.length > 0 ?
				invites.map((invite, index) => {
					if (index < invites.length - 1) {
						return (
							<>
								<Invite key={invite} id={invite} refresh={() => setRefresh(refresh + 1)} />
								<Divider />
							</>
						)
					}
					return <Invite key={invite} id={invite} refresh={() => setRefresh(refresh + 1)} />
				})
				:
				<Typography> No Invites :(</Typography>
			}

		</Paper>
	)
}