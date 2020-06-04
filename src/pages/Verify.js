import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Paper, Typography, makeStyles } from '@material-ui/core';

const useStyles = makeStyles({
	pane: {
		padding: '10px'
	}
});

export default function Verify() {
	const styles = useStyles();
	const { id } = useParams();
	const [done, setDone] = useState(0);

	useEffect(() => {
		fetch(`${process.env.REACT_APP_API_HOST}/account/verify/${id}`, { method: 'POST' })
			.then(res => {
				if (res.ok) {
					setDone(1);
				}
				else {
					setDone(2);
				}
			})
	}, [id])

	return (
		<Paper className={styles.pane}>
			{done === 0 ?
				<Typography> Verifying account... </Typography>
				:
				<>
					{done === 1 ?
						<Typography> Verification success! <Link to="/login"> Login here. </Link> </Typography>
						:
						<Typography> Verification failed! </Typography>
					}
				</>
			}

		</Paper>
	);
}