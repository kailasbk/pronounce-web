import React, { useEffect, useRef } from 'react';
import { Typography, Button } from '@material-ui/core';

export default function EndCard(props) {
	const cardRef = useRef(null);

	useEffect(() => {
		if (cardRef.current !== null) {
			cardRef.current.focus();
		}
	});

	return (
		<div
			style={
				props.hidden ?
					{ display: 'none' }
					:
					{
						height: '420px',
						boxShadow: '0px 0px 1px .5px lightgray',
						borderRadius: '5px',
						maxWidth: props.flashcard ? '600px' : '',
						width: '100%',
						margin: 'auto',
						marginTop: '10px',
						marginBottom: '10px',
					}
			}
			tabIndex="0"
			ref={cardRef}
		>
			<div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
				<Typography variant="h2">All done!</Typography>
				<Button onClick={props.restart}>Restart?</Button>
			</div>
		</div >
	);
}