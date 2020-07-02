import React, { useState } from 'react';
import { makeStyles, Paper, Divider, Typography, TextField, Button, IconButton } from '@material-ui/core';
import { DeleteOutline, Close } from '@material-ui/icons';
import token from '../js/token.js';

const useStyles = makeStyles({
	pane: {
		padding: '10px',
		paddingBottom: '5px',
	},
	emailBox: {
		width: '100%',
		marginTop: '10px'
	},
	button: {
		marginTop: '5px',
		marginBottom: '5px',
		width: '100%'
	},
});

export default function Invite(props) {
	const styles = useStyles();
	const [text, setText] = useState('');

	function removeEmail(email) {
		var newText = text;
		newText = newText.replace(email, '');
		newText = newText.replace(';;', ';');
		if (newText[0] === ';') {
			newText = newText.substring(1);
		}
		setText(newText);
	}

	function handleChange(e) {
		var newText = e.target.value;
		setText(newText);
	}

	function handleSubmit(e) {
		var emails = text.split(';');
		fetch(`${process.env.REACT_APP_API_HOST}/group/${props.id}/invite`, {
			method: 'POST',
			headers: {
				'Authorization': `Bearer ${token.get()}`,
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({
				emails: emails
			})
		})
			.then(res => {
				if (res.ok) {
					handleClose();
				}
			})
	}

	function handleClose(e) {
		setText('');
		props.close();
	}

	function Preview(props) {
		var list = props.text.split(';');
		var content = list.map((email, index) => {
			if (email.length > 0) {
				return (
					<div key={index} style={{ width: "100%", height: "49px" }}>
						<Divider />
						<Typography style={{ display: "inline-block", paddingTop: "12px", overflow: "hidden" }}>{email}</Typography>
						<div style={{ float: "right" }}>
							<IconButton onClick={() => removeEmail(email)}>
								<DeleteOutline />
							</IconButton>
						</div>
					</div >
				)
			}
			return <div key={index} />;
		});

		return (
			<div style={{ overflowY: 'scroll', height: '300px' }}>
				{content}
			</div>
		)
	}

	return (
		<Paper className={styles.pane}>
			<div style={{ display: 'flex', alignItems: 'center' }}>
				<Typography variant="h5"> Invite (by email) </Typography>
				<span style={{ flexGrow: 1 }} />
				<IconButton onClick={() => props.close()}>
					<Close />
				</IconButton>
			</div>
			<Divider />
			<TextField multiline label="Emails" className={styles.emailBox} onChange={handleChange} value={text} />
			<Button color="primary" variant="contained" className={styles.button} onClick={handleSubmit}> Send Invites </Button>
			<Button color="primary" variant="contained" className={styles.button} onClick={handleClose}> Cancel </Button>
			<Preview text={text} />
		</Paper>
	);
}