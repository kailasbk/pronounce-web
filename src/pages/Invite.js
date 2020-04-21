import React, { useState } from 'react';
import { makeStyles, Paper, Divider, Typography, TextField, Button, IconButton } from '@material-ui/core';
import { DeleteOutline } from '@material-ui/icons';

const useStyles = makeStyles({
	pane: {
		padding: '10px',
		paddingBottom: '0px'
	},
	emailBox: {
		width: '100%',
		marginTop: '10px'
	},
	submitButton: {
		marginTop: '10px',
		marginBottom: '10px',
		width: '100%'
	},
});

export default function Invite() {
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
			<div>
				{content}
			</div>
		)
	}

	return (
		<Paper className={styles.pane}>
			<Typography variant="h5"> Invite </Typography>
			<Divider />
			<TextField label="Group Name" className={styles.emailBox} />
			<TextField multiline label="Emails" className={styles.emailBox} onChange={handleChange} value={text} />
			<Button color="primary" variant="contained" className={styles.submitButton}> Send Invites </Button>
			<Preview text={text} />
		</Paper>
	);
}