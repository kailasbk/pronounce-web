import React, { useState, useEffect } from 'react';
import { Backdrop, Paper, Typography, IconButton, Divider, makeStyles, Button } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import token from '../js/token.js';
import '../css/pulse.css';

const useStyles = makeStyles({
	pane: {
		padding: '10px',
		width: '100%',
		maxWidth: '600px'
	}
});

export default function Feedback(props) {
	const styles = useStyles();
	// eslint-disable-next-line
	const [update, setUpdate] = useState(0);
	const [attempt, setAttempt] = useState(null);
	const [recorder, setRecorder] = useState(null);
	const [feedback, setFeedback] = useState(null);
	const isRecording = (() => {
		if (recorder) {
			if (recorder.state === 'recording') {
				return true;
			}
		}
		return false;
	})();

	useEffect(() => {
		const controller = new AbortController();

		fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/${props.id}/attempt`,
			{
				method: 'GET',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				signal: controller.signal
			})
			.then(res => res.blob())
			.then(blob => {
				if (blob.size > 0) {
					const audio = new Audio(URL.createObjectURL(blob));
					audio.onended = () => {
						setUpdate(Math.random());
					}
					setAttempt(audio);
				}
			});

		if (props.info.given) {
			fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/${props.id}/feedback`,
				{
					method: 'GET',
					headers: {
						'Authorization': `Bearer ${token.get()}`
					},
					signal: controller.signal
				})
				.then(res => res.blob())
				.then(blob => {
					if (blob.size > 0) {
						const audio = new Audio(URL.createObjectURL(blob));
						audio.onended = () => {
							setUpdate(Math.random());
						}
						setFeedback(audio);
					}
				});
		}

		return function cleanup() { controller.abort() };
	}, [props.id, props.info.given]);

	function handleClose(e) {
		e.stopPropagation();
		props.close();
	}

	function handleRecord(e) {
		if (!isRecording) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(stream => {
					const recorder = new MediaRecorder(stream, { mimeType: 'audio/ogg; codecs=opus' });
					recorder.ondataavailable = (e) => {
						recorder.stream.getAudioTracks()[0].stop();
						const audio = new Audio(URL.createObjectURL(e.data));
						audio.onended = () => {
							setUpdate(Math.random());
						}
						setFeedback(audio);
					};
					recorder.start();
					setRecorder(recorder);
				})
				.catch(err => {
					console.log(err);
					setRecorder(null);
				});
		}
		else if (recorder) {
			recorder.stop();
			setRecorder(null);
		}
	}

	function handleAttempt(e) {
		if (attempt) {
			if (attempt.paused) {
				attempt.play();
			}
			else {
				attempt.pause();
				attempt.currentTime = 0;
			}
		}
		setUpdate(Math.random());
	}

	function handleFeedback(e) {
		if (feedback) {
			if (feedback.paused) {
				feedback.play();
			}
			else {
				feedback.pause();
				feedback.currentTime = 0;
			}
		}
		setUpdate(Math.random());
	}

	async function handleSubmit(e) {
		const data = new FormData();
		await fetch(feedback.src)
			.then(res => res.blob())
			.then(blob => data.append('audio', blob));

		fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/${props.id}/give`,
			{
				method: 'POST',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				body: data
			})
			.then(res => {
				if (res.ok) {
					props.refresh();
				}
			})
	}

	return (
		<Backdrop open={true} style={{ zIndex: 1000 }}>
			<Paper className={styles.pane}>
				<div style={{ display: 'flex', alignItems: 'center' }}>
					<Typography variant="h5">Feedback</Typography>
					<span style={{ flexGrow: 1 }} />
					<IconButton onClick={handleClose}><Close /></IconButton>
				</div>
				<Divider />
				<div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
					<Typography variant="h6">Name:</Typography>
					<span style={{ flexGrow: 1 }} />
					<Typography variant="h6">{props.info.givername}</Typography>
				</div>
				<Divider />
				<div style={{ display: 'flex', alignItems: 'center', margin: '10px 0' }}>
					<Typography variant="h6">Attempt:</Typography>
					<span style={{ flexGrow: 1 }} />
					<Button onClick={handleAttempt} style={{ width: '80px' }} variant="outlined">
						{attempt && !attempt.paused ?
							'Pause'
							:
							'Play'
						}
					</Button>
				</div>
				<Divider />
				<div style={{ display: 'flex', alignItems: 'center', marginTop: '10px' }}>
					<Typography variant="h6">Feedback:</Typography>
					<span style={{ flexGrow: 1 }} />
					{!props.info.given &&
						<Button onClick={handleRecord} style={{ width: '80px', marginRight: '10px' }} variant="outlined">
							{isRecording ?
								<div className="pulse">Stop</div>
								:
								'Record'
							}
						</Button>
					}
					<Button onClick={handleFeedback} style={{ width: '80px' }} variant="outlined">
						{feedback && !feedback.paused ?
							'Pause'
							:
							'Play'
						}
					</Button>
				</div>
				{!props.info.given &&
					<Button style={{ display: 'flex', width: '100%', marginTop: '10px' }} onClick={handleSubmit} variant="contained">Sumbit Feedback</Button>
				}
			</Paper>
		</Backdrop>
	)
}