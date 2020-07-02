import React, { useState, useEffect } from 'react';
import { Paper, Typography, Divider, ButtonGroup, IconButton, makeStyles, Avatar, List, ListItem } from '@material-ui/core';
import { Check, Clear, Close } from '@material-ui/icons';
import Feedback from '../backdrops/Feedback';
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

function FeedbackNotification(props) {
	const [info, setInfo] = useState({});
	const [src, setSrc] = useState('');
	const [open, setOpen] = useState(false);
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/${props.feedback.id}`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				signal: controller.signal
			})
			.then(res => res.json())
			.then(json => setInfo(json))
			.catch(err => console.log(err))

		return function cleanup() { controller.abort() }
	}, [props.feedback.id, refresh]);

	useEffect(() => {
		const controller = new AbortController();

		if (info.asker) {
			fetch(`${process.env.REACT_APP_API_HOST}/user/${info.asker}/picture`,
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

	function handleDelete(e) {
		e.stopPropagation();
		fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/${props.feedback.id}`,
			{
				method: 'DELETE',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => props.refresh());
	}

	return (
		<>
			<ListItem button onClick={(e) => setOpen(true)}>
				<Avatar style={{ marginRight: '10px' }} src={src} />
				{props.type === 'given' ?
					<Typography style={{ fontSize: '20px' }}>{info.givername} has given feedback on your pronounciation of their name</Typography>
					:
					<Typography style={{ fontSize: '20px' }}>{info.askername} has requested feedback on their pronounciation of your name</Typography>
				}
				<Typography style={{ fontSize: '20px' }}></Typography>
				<span style={{ flexGrow: 1 }} />
				<IconButton onClick={handleDelete}>
					<Close />
				</IconButton>
			</ListItem>
			{open &&
				<Feedback id={props.feedback.id} info={info} close={() => setOpen(false)} refresh={() => setRefresh(refresh + 1)} />
			}
		</>
	)
}

function Requested(props) {
	return (
		<FeedbackNotification type="requested" {...props} />
	);
}

function Given(props) {
	return (
		<FeedbackNotification type="given" {...props} />
	);
}

function Invite(props) {
	const styles = useStyles();
	const [info, setInfo] = useState({
		name: '',
		username: '',
		group: ''
	});
	const [src, setSrc] = useState('');

	function handleAccept(e) {
		fetch(`${process.env.REACT_APP_API_HOST}/invite/${props.invite.id}/accept`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => props.refresh())
	}

	function handleReject(e) {
		fetch(`${process.env.REACT_APP_API_HOST}/invite/${props.invite.id}/reject`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => props.refresh())
	}

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_API_HOST}/invite/${props.invite.id}`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				signal: controller.signal
			})
			.then(res => res.json())
			.then(json => setInfo(json))
			.catch(err => console.log(err))

		return function cleanup() { controller.abort() }
	}, [props.invite.id]);

	useEffect(() => {
		const controller = new AbortController();

		if (info.username) {
			fetch(`${process.env.REACT_APP_API_HOST}/user/${info.username}/picture`,
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
		<ListItem button>
			<Avatar style={{ marginRight: '10px' }} src={src} />
			<Typography style={{ fontSize: '20px' }}>{info.name} has invited you to join <i>{info.group}</i></Typography>
			<span style={{ flexGrow: 1 }} />
			<ButtonGroup>
				<IconButton className={styles.check} onClick={handleAccept}> <Check /> </IconButton>
				<IconButton className={styles.cross} onClick={handleReject}> <Clear /> </IconButton>
			</ButtonGroup>
		</ListItem>
	)
}

export default function Inbox() {
	const [inbox, setInbox] = useState([]);
	const [refresh, setRefresh] = useState(0);

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_API_HOST}/user/0/inbox`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				signal: controller.signal
			})
			.then(res => res.json())
			.then(json => setInbox(json))
			.catch(err => console.log(err))

		return function cleanup() { controller.abort() }
	}, [refresh]);

	return (
		<Paper style={{ padding: '10px' }}>
			<Typography variant="h5"> Inbox </Typography>
			<Divider />
			<List style={{ paddingBottom: '0px' }}>
				{inbox.length > 0 ?
					inbox.map(entry => {
						if (entry.type === 'invite') {
							return <Invite key={entry.id} invite={entry} refresh={() => setRefresh(refresh + 1)} />
						}
						else if (entry.type === 'feedback-request') {
							return <Requested key={entry.id} feedback={entry} refresh={() => setRefresh(refresh + 1)} />
						}
						else if (entry.type === 'feedback-given') {
							return <Given key={entry.id} feedback={entry} refresh={() => setRefresh(refresh + 1)} />
						}
						else {
							return ''
						}
					})
					:
					<ListItem button onClick={() => setRefresh(refresh + 1)}>
						<Typography> Nothing here. Refresh?</Typography>
					</ListItem>
				}
			</List>
		</Paper >
	)
}