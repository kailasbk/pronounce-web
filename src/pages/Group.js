import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Paper, Card, Divider, Typography, Grid, Avatar, Button, Badge, IconButton } from '@material-ui/core';
import { PlayArrow, Stop } from '@material-ui/icons';
import token from '../token.js';

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
	const [members, setMembers] = useState([
		{
			username: '',
			firstname: '',
			lastname: '',
			email: '',
			picturesrc: '',
			audiosrc: ''
		},
		{
			username: '',
			firstname: '',
			lastname: '',
			email: '',
			picturesrc: '',
			audiosrc: ''
		},
		{
			username: '',
			firstname: '',
			lastname: '',
			email: '',
			picturesrc: '',
			audiosrc: ''
		},
	]);
	const styles = useStyles();

	useEffect(() => {
		fetch('http://localhost:3001/group/all',
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				}
			})
			.then(res => res.json())
			.then((json) => {
				const newMembers = json.members.map((member) => {
					const newMember = {
						username: member.username,
						firstname: member.firstname,
						lastname: member.lastname,
						email: member.email,
						picturesrc: '',
						audiosrc: ''
					};

					if (member.picture !== null) {
						const picture = new Blob([new Uint8Array(member.picture.data)], { type: 'image/jpeg' });
						newMember.picturesrc = URL.createObjectURL(picture);
					}

					if (member.audio !== null) {
						const audio = new Blob([new Uint8Array(member.audio.data)], { type: 'audio/m4a' });
						newMember.audiosrc = URL.createObjectURL(audio);
					}

					return newMember;
				});
				setMembers(newMembers);
				setGroupName(json.name);
			});

		return function cleanup() { };
	}, []);

	function Member(props) {
		const [isPlaying, setPlaying] = useState(false);

		function handlePlaying(e) {
			if (props.member.audiosrc !== '') {
				const audio = document.getElementById(`audio-${props.index}`);
				if (isPlaying) {
					audio.pause();
					audio.currentTime = 0;
				}
				else {
					audio.play();
				}
				setPlaying(!isPlaying);
			}
		}

		return (
			<Grid item xs={12} sm={6} md={4}>
				<Card className={styles.member}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Badge
							style={{ margin: '10px', marginLeft: '0px' }}
							overlap="circle"
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'right',
							}}
							badgeContent={
								<div>
									{props.member.audiosrc !== '' ?
										<audio src={props.member.audiosrc} id={'audio-' + props.index} onEnded={() => setPlaying(false)}></audio>
										:
										<> </>
									}
									<IconButton onClick={handlePlaying} style={{ padding: '3px' }}>
										{isPlaying ? <Stop /> : <PlayArrow />}
									</IconButton>
								</div>
							}
						>
							<Avatar src={props.member.picturesrc} style={{ width: '60px', height: '60px' }} />
						</Badge>
						<Typography variant="h6"> {props.member.firstname} {props.member.lastname} </Typography>
					</div >
					<Divider />
					<Typography style={{ marginTop: '10px' }}> {props.member.username} </Typography>
					<Typography> <a href={'mailto:' + props.member.email}>{props.member.email}</a> </Typography>
				</Card >
			</Grid >
		)
	}

	function Members(props) {
		var content = props.members.map((member, index) => {
			return <Member member={member} key={index} index={index} />
		});

		if (content.length === 0) {
			return <Typography> No members! </Typography>
		}

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