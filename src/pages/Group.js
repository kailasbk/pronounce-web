import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'
import { makeStyles, Paper, Card, Divider, Typography, Grid, Avatar, Button } from '@material-ui/core';

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
		paddingTop: '0'
	}
});

export default function Group() {
	const [groupName, setGroupName] = useState('');
	const [members, setMembers] = useState([]);
	const styles = useStyles();

	useEffect(() => {
		var timeout = setTimeout(() => {
			setGroupName("John Doe's Class");
			setMembers([
				{
					name: 'John Doe',
					username: 'johndoe123',
					email: 'johndoe123@gmail.com'
				},
				{
					name: 'Kailas',
					username: 'kailasbk',
					email: 'kailas@gmail.com'
				},
				{
					name: 'Ishan',
					username: 'ishankahler',
					email: 'ishan@gmail.com'
				},
				{
					name: 'Eric',
					username: 'ericsong710',
					email: 'eric@gmail.com'
				}
			])
		}, 1000);
		return function cleanup() {
			clearTimeout(timeout);
		};
	}, []);

	function Members(props) {
		var content = props.members.map((member, index) => {
			return (
				<Grid item xs={12} sm={6} md={4} key={index}>
					<Card className={styles.member}>
						<div style={{ display: 'flex', alignItems: 'center' }}>
							<Avatar style={{ margin: '10px', marginLeft: '0px', width: '60px', height: '60px' }} />
							<Typography variant="h6"> {member.name} </Typography>
						</div>
						<Divider />
						<Typography style={{ marginTop: '10px' }}> {member.username} </Typography>
						<Typography> <a href={'mailto:' + member.email}>{member.email}</a> </Typography>
					</Card>
				</Grid>
			)
		});

		return (
			<Grid container spacing={2} className={styles.members}>
				{content}
			</Grid>
		)
	}

	function emails() {
		var emailList = members.map((member, index) => {
			if (index < members.length - 1) {
				return (member.email + ';');
			}
			else {
				return member.email;
			}
		});
		var string = '';
		emailList.map(email => {
			string += email;
			return 1;
		});
		return 'mailto: ' + string;
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> {groupName} </Typography>
			<Divider style={{ marginBottom: '10px' }} />
			<div className={styles.actionBar}>
				<Button color="primary" variant="contained" className={styles.study}>
					<Link to="/study" style={{ all: 'inherit' }}> Study </Link>
				</Button>
				<Button color="secondary" variant="contained" className={styles.email} href={emails()}> Email </Button>
			</div >
			<Divider style={{ marginTop: '10px' }} />
			<div className={styles.membersBar}>
				<Typography variant="h5" style={{ flexGrow: 1 }}> Members </Typography>
				<Button color="primary" variant="outlined" className={styles.add}> Add Members </Button>
			</div>
			<Divider />
			<Members members={members} />
		</Paper >
	)
}