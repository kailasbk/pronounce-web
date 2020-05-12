import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { makeStyles, Paper, Divider, Typography, Grid, Button, Menu, MenuItem, TextField, Backdrop } from '@material-ui/core';
import Member from '../components/Member';
import Invite from '../pages/Invite';
import token from '../js/token.js';
import fetchGroup from '../js/fetchGroup';

const useStyles = makeStyles({
	pane: {
		padding: '10px'
	},
	actionBar: {
		display: 'flex',
		flexWrap: 'wrap'
	},
	membersBar: {
		display: 'flex',
		alignItems: 'center'
	},
	study: {
		flexGrow: 1,
		minWidth: '200px',
		flexBasis: '30%'
	},
	add: {
		display: 'inline-block',
		margin: '5px'
	},
	email: {
		flexGrow: 1,
		minWidth: '200px',
		flexBasis: '30%'
	},
	members: {
		marginTop: '10px'
	},
	member: {
		padding: '10px',
		paddingTop: '0',
		position: 'relative'
	}
});

export default function Group() {
	const styles = useStyles();
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

	useEffect(() => {
		const controller = new AbortController();
		fetch('http://localhost:3001/user/0/groups',
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
			if (groups.length > 0 && groups[0].id) {
				history.push(`/group/${groups[0].id}`);
			}
		}
		else {
			fetchGroup(id, controller)
				.then(group => setGroup(group))
				.catch(err => {
					if (err.name === "AbortError") {
						console.log('Aborted fetch request.');
					}
				});
		}
		return function cleanup() { controller.abort() };
	}, [groups, history, id]);

	function handleCreate(e) {
		fetch('http://localhost:3001/group/new',
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
				fetch('http://localhost:3001/user/0/groups',
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
				<Typography variant="h5"> {groups.length === 0 ? 'No Groups!' : group.name} </Typography>
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
				<Button color="primary" variant="contained" className={styles.study}>
					<Link to={`/study/${id}`} style={{ all: 'inherit' }}> Study </Link>
				</Button>
				<Button color="secondary" variant="contained" className={styles.email} href=''> Email </Button>
			</div >
			<Divider style={{ marginTop: '10px' }} />
			<div className={styles.membersBar}>
				<Typography variant="h5" style={{ flexGrow: 1 }}> Members </Typography>
				{(id !== 'all' && group.me === group.owner) &&
					<Button color="primary" variant="outlined" className={styles.add} onClick={(e) => setBackdrop(true)}> Invite Members </Button>
				}
			</div>
			<Divider />
			<Grid container spacing={2} className={styles.members}>
				<Member owner username={group.owner} key={group.owner} />
				{group.members.map(member => <Member username={member} index={member} key={member} />)}
			</Grid>
			<Backdrop open={backdrop} style={{ zIndex: 1000 }}> <Invite handleClose={(e) => setBackdrop(false)} id={id} /> </Backdrop>
		</Paper >
	)
}