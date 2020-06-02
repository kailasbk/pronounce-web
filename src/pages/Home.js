import React, { useState, useEffect } from 'react';
import { Paper, Typography, Divider, makeStyles, List, ListItem, Button } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import Invites from './Inbox';
import token from '../js/token.js';

const useStyles = makeStyles({
	pane: {
		padding: '10px'
	}
});

export default function Home() {
	const styles = useStyles();
	const history = useHistory();
	const [groups, setGroups] = useState([]);

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

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Home </Typography>
			<Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
			<Paper className={styles.pane}>
				<Typography variant="h5"> Groups </Typography>
				<Divider />
				<List style={{ paddingBottom: '0px' }}>
					<ListItem key="all" button onClick={(e) => history.push('/group/all')}>
						<Typography variant="h6"> All groups </Typography>
					</ListItem>
					{groups.map(group => {
						return (
							<ListItem key={group.id} button onClick={(e) => history.push(`/group/${group.id}`)} >
								<Typography variant="h6"> {group.name} </Typography>
							</ListItem>
						);
					})}
				</List>
			</Paper>
			<Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
			<Invites />
			<Divider style={{ marginTop: '10px', marginBottom: '10px' }} />
			<Link to="/account" >
				<Button style={{ width: '100%', justifyContent: 'left' }}>
					<Typography variant="h6" style={{ textDecoration: 'none', textTransform: 'none' }}> My account </Typography>
				</Button>
			</Link>
			<Link to="/about" >
				<Button style={{ width: '100%', justifyContent: 'left' }}>
					<Typography variant="h6" style={{ textDecoration: 'none', textTransform: 'none' }}> About this app </Typography>
				</Button>
			</Link>
		</Paper >
	);
}