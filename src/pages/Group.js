import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { makeStyles, Paper, Card, Divider, Typography, Grid, Avatar, Button, Badge, IconButton } from '@material-ui/core';
import { PlayArrow, Stop } from '@material-ui/icons';
import token from '../js/token.js';

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
	const [members, setMembers] = useState(['', '', '']);
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
				setMembers(json.members);
				setGroupName(json.name);
			});

		return function cleanup() { };
	}, []);

	function Member(props) {
		const [info, setInfo] = useState({
			username: '',
			firstname: '',
			lastname: '',
			pronouns: '',
			email: '',
			picturesrc: '',
			audiosrc: ''
		});
		const [isPlaying, setPlaying] = useState(false);

		useEffect(() => {
			const controller = new AbortController();
			if (props.member !== '') {
				fetch(`http://localhost:3001/user/${props.member}`,
					{
						method: 'GET',
						headers: {
							'Authorization': `Bearer ${token.get()}`
						},
						signal: controller.signal
					})
					.then(res => res.json())
					.then(json => {
						const newInfo = {
							username: json.username,
							firstname: json.firstname,
							lastname: json.lastname,
							pronouns: json.pronouns,
							email: json.email,
							picturesrc: '',
							audiosrc: ''
						};

						if (json.picture !== null) {
							const picture = new Blob([new Uint8Array(json.picture.data)], { type: 'image/jpeg' });
							newInfo.picturesrc = URL.createObjectURL(picture);
						}

						if (json.audio !== null) {
							const audio = new Blob([new Uint8Array(json.audio.data)], { type: 'audio/m4a' });
							newInfo.audiosrc = URL.createObjectURL(audio);
						}

						setInfo(newInfo);
					})
					.catch(err => {
						if (err.name === 'AbortError') {
							console.log('Aborted fetch request.');
						}
					});
			}

			return function cleanup() { controller.abort() };
		}, [props.member]);

		function handlePlaying(e) {
			if (info.audiosrc !== '') {
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
									{info.audiosrc !== '' ?
										<audio src={info.audiosrc} id={'audio-' + props.index} onEnded={() => setPlaying(false)}></audio>
										:
										<> </>
									}
									<IconButton onClick={handlePlaying} style={{ padding: '3px' }}>
										{isPlaying ? <Stop /> : <PlayArrow />}
									</IconButton>
								</div>
							}
						>
							<Avatar src={info.picturesrc} style={{ width: '60px', height: '60px' }} />
						</Badge>
						<Typography variant="h6"> {info.firstname} {info.lastname} </Typography>
					</div >
					<Divider style={{ marginBottom: '10px' }} />
					{info.pronouns !== '' ?
						< Typography > {info.pronouns} </Typography>
						:
						<></>
					}
					<Typography> {info.username} </Typography>
					<Typography> <a href={'mailto:' + info.email}>{info.email}</a> </Typography>
				</Card >
			</Grid >
		)
	}

	function Members(props) {
		const [content, setContent] = useState(<div />);

		useEffect(() => {
			const newContent = props.members.map((member, index) => {
				return <Member member={member} key={index} index={index} />
			});
			setContent(newContent);
		}, [props.members]);

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