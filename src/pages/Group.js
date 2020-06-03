import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { makeStyles, Paper, Divider, Typography, Grid, Button, Menu, MenuItem, TextField, Backdrop, useTheme } from '@material-ui/core';
import Member from '../components/Member';
import Invite from '../components/Invite';
import token from '../js/token.js';
import fetchGroup from '../js/fetchGroup';

const useStyles = makeStyles(theme => ({
	pane: {
		padding: '10px'
	},
	actionBar: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	membersBar: {
		minHeight: '50px',
		display: 'flex',
		alignItems: 'center'
	},
	button: {
		[theme.breakpoints.down('xs')]: {
			flexBasis: '100%'
		},
		flexGrow: 1,
		flexBasis: '33%'
	},
	add: {
		display: 'inline-block',
		margin: '5px'
	},
	members: {
		marginTop: '10px'
	},
	member: {
		padding: '10px',
		paddingTop: '0',
		position: 'relative'
	}
}));

export default function Group() {
	const styles = useStyles();
	const theme = useTheme();
	const { id } = useParams();
	const history = useHistory();
	const [groups, setGroups] = useState([
		{
			id: '',
			name: ''
		}
	])
	const [group, setGroup] = useState({
		name: '',
		owner: '',
		members: [''],
		me: ''
	});
	const [isMenu, setMenu] = useState(false);
	const menuRef = useRef(null);
	const [newName, setName] = useState('');
	const [backdrop, setBackdrop] = useState(false);
	const [emails, setEmails] = useState([]);

	useEffect(() => {
		const controller = new AbortController();
		fetch(`${process.env.REACT_APP_API_HOST}/user/0/groups`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				signal: controller.signal
			})
			.then(res => res.json())
			.then(json => {
				setGroups(json);
			})
			.catch(err => {
				if (err.name === "AbortError") {
					console.log('Aborted fetch request.');
				}
			});

		return function cleanup() { controller.abort() };
	}, []);

	useEffect(() => {
		const controller = new AbortController();
		if (!id) {
			history.push(`/group/all`);
		}
		else {
			fetchGroup(id, controller)
				.then(group => setGroup(group))
				.catch(err => {
					if (err.name === "AbortError") {
						console.log('Aborted fetch request.');
					}
				});

			if (id !== 'all') {
				fetch(`${process.env.REACT_APP_API_HOST}/group/${id}/emails`,
					{
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token.get()}`
						},
						signal: controller.signal
					})
					.then(res => res.json())
					.then(emails => setEmails(emails))
					.catch(err => {
						if (err.name === "AbortError") {
							console.log('Aborted fetch request.');
						}
					});
			}
			else {
				setEmails([]);
			}
		}
		return function cleanup() { controller.abort() };
	}, [groups, history, id]);

	function handleCreate(e) {
		fetch(`${process.env.REACT_APP_API_HOST}/group/new`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`,
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					name: newName
				})
			})
			.then(res => {
				fetch(`${process.env.REACT_APP_API_HOST}/user/0/groups`,
					{
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token.get()}`
						},
					})
					.then(res => res.json())
					.then(json => {
						setGroups(json);
						setName('');
					});
			});
	}

	return (
		<Paper className={styles.pane}>
			<div style={{ display: 'flex' }}>
				<Typography variant="h5"> Groups </Typography>
				<span style={{ flexGrow: 1 }} />
				<Button ref={menuRef} onClick={() => setMenu(true)}> Select Group </Button>
				<Menu
					anchorEl={menuRef.current}
					keepMounted
					open={isMenu}
					onClose={() => setMenu(false)}
				>
					<MenuItem key='all' onClick={() => { history.push('/group/all'); setMenu(false); }}>
						<Typography style={{ width: '300px' }}> All Groups </Typography>
					</MenuItem>
					{groups.map(group => {
						return (
							<MenuItem key={group.id} onClick={() => { history.push(`/group/${group.id}`); setMenu(false); }}>
								<Typography style={{ width: '300px' }}>{group.name}</Typography>
							</MenuItem>
						);
					})}
					<MenuItem key='create'>
						<TextField key='field' value={newName} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.stopPropagation()} style={{ width: '200px' }}></TextField>
						<Button variant="outlined" onClick={handleCreate} style={{ width: '80px', marginLeft: '20px' }}> Create </Button>
					</MenuItem>
				</Menu>
			</div>
			<Divider style={{ marginBottom: '10px' }} />
			<div className={styles.actionBar}>
				<Button style={{ backgroundColor: theme.palette.success.main }} variant="contained" className={styles.button}>
					<Link to={`/flashcards/${id}`} style={{ all: 'inherit' }}> Flashcards </Link>
				</Button>
				<Button style={{ backgroundColor: theme.palette.warning.main }} variant="contained" className={styles.button}>
					<Link to={`/learn/${id}`} style={{ all: 'inherit' }}> Learn </Link>
				</Button>
				{id !== 'all' &&
					<Button style={{ backgroundColor: theme.palette.info.main }} variant="contained" className={styles.button} href={`mailto: ${emails.join(';')}`}> Email </Button>
				}
			</div >
			<Divider style={{ marginTop: '10px' }} />
			<div className={styles.membersBar}>
				<Typography variant="h5" style={{ flexGrow: 1 }}> {group.name} </Typography>
				{(id !== 'all' && group.me === group.owner) &&
					<Button color="primary" variant="outlined" className={styles.add} onClick={(e) => setBackdrop(true)}> Invite Members </Button>
				}
			</div>
			<Divider />
			<Grid container spacing={1} className={styles.members}>
				<Member owner username={group.owner} key={group.owner} />
				{group.members.map(member => <Member username={member} index={member} key={member} />)}
			</Grid>
			<Backdrop open={backdrop} style={{ zIndex: 1000 }}> <Invite close={(e) => setBackdrop(false)} id={id} /> </Backdrop>
		</Paper >
	)
}