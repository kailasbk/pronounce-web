import React, { useState, useEffect } from 'react';
import { Link, useParams, useHistory } from 'react-router-dom';
import { makeStyles, Paper, Divider, Typography, Grid, Button, Menu, MenuItem } from '@material-ui/core';
import Member from '../components/Member'
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
		members: ['']
	});
	const [isMenu, setMenu] = useState(false);

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

	if (groups.length === 0) {
		return (
			<Paper className={styles.pane}>
				<div style={{ display: 'flex' }}>
					<Typography variant="h5"> No groups! </Typography>
					<span style={{ flexGrow: 1 }} />
					<Button id='menu-button' onClick={() => setMenu(true)}> Select Group </Button>
					<Menu
						anchorEl={document.getElementById('menu-button')}
						keepMounted
						open={isMenu}
						onClose={() => setMenu(false)}
					>
						{groups.map((group, index) => {
							return (
								<MenuItem key={index} onClick={() => { history.push(`/group/${group.id}`); setMenu(false) }}>
									<Typography style={{ width: '300px' }}>{group.name}</Typography>
								</MenuItem>
							);
						})}
						<MenuItem key='create' onClick={console.log('created group')}>
							<Typography style={{ width: '300px' }}> Create Group </Typography>
						</MenuItem>
					</Menu>
				</div>
			</Paper>
		);
	}

	return (
		<Paper className={styles.pane}>
			<div style={{ display: 'flex' }}>
				<Typography variant="h5"> {group.name} </Typography>
				<span style={{ flexGrow: 1 }} />
				<Button id='menu-button' onClick={() => setMenu(true)}> Select Group </Button>
				<Menu
					anchorEl={document.getElementById('menu-button')}
					keepMounted
					open={isMenu}
					onClose={() => setMenu(false)}
				>
					{groups.map((group, index) => {
						return (
							<MenuItem key={index} onClick={() => { history.push(`/group/${group.id}`); setMenu(false) }}>
								<Typography style={{ width: '300px' }}>{group.name}</Typography>
							</MenuItem>
						);
					})}
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
				<Button color="primary" variant="outlined" className={styles.add}> Invite Members </Button>
			</div>
			<Divider />
			<Grid container spacing={2} className={styles.members}>
				<Member owner username={group.owner} key={group.owner} />
				{group.members.map(member => <Member username={member} index={member} key={member} />)}
			</Grid>
		</Paper >
	)
}