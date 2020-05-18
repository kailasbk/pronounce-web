import React from 'react';
import { Paper, Typography, makeStyles, Divider } from '@material-ui/core';

const useStyles = makeStyles({
	aboutPane: {
		padding: '10px'
	}
});

export default function About() {
	const styles = useStyles();

	return (
		<Paper className={styles.aboutPane}>
			<Typography variant="h5"> About this app </Typography>
			<Divider />
			<Typography> Name: Pronouncit App </Typography>
			<Typography> Version: 0.1.0 </Typography>
			<Typography> Author: Kailas Kahler </Typography>
			<Typography> Contact: kailasbk230@gmail.com </Typography>
		</Paper>
	);
}