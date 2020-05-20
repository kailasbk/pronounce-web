import React, { useState, useEffect, useRef } from 'react';
import { useTheme, Button, ButtonGroup } from '@material-ui/core';
import { PlayArrow, Stop, RecordVoiceOver, Publish, DeleteForever, FiberManualRecord } from '@material-ui/icons';
import token from '../js/token.js';

function Recorder(props) {
	const theme = useTheme();
	const [preview, setPreview] = useState('');
	const [isPlaying, setPlaying] = useState(false);
	const [isRecording, setRecording] = useState(false);
	const [recorder, setRecorder] = useState(null);
	const audioRef = useRef(null);

	async function handleUploadAudio(e) {
		const data = new FormData();
		await fetch(preview)
			.then(res => res.blob())
			.then(blob => data.append('file', blob));

		const audio = await fetch(`${process.env.REACT_APP_API_HOST}/user/0/audio`,
			{
				method: 'PUT',
				headers: {
					'Authorization': `Bearer ${token.get()}`
				},
				body: data
			})
			.then(res => {
				if (res.ok) {
					handleDeletePreview();
					return fetch(`${process.env.REACT_APP_API_HOST}/user/0/audio`,
						{
							method: 'GET',
							headers: {
								'Authorization': `Bearer ${token.get()}`
							}
						});
				}
				return null;
			})
			.then(res => {
				if (res !== null) {
					return res.blob();
				}
				return new Blob();
			});

		props.update(URL.createObjectURL(audio));
	}

	function handleDeletePreview(e) {
		URL.revokeObjectURL(preview);
		setPreview('');
	}

	function handleAudio(e) {
		if (props.audiosrc || preview) {
			const audio = audioRef.current;
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

	function handleRecord(e) {
		if (recorder === null) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(stream => setRecorder(new MediaRecorder(stream)))
				.catch(error => console.log(error));
			setRecording(true);
		}
		else if (isRecording) {
			recorder.stop();
			recorder.stream.getAudioTracks()[0].stop();
			setRecorder(null);
			setRecording(false);
		}
	}

	useEffect(() => {
		if (recorder !== null) {
			recorder.ondataavailable = (e) => {
				URL.revokeObjectURL(preview);
				const url = URL.createObjectURL(e.data);
				setPreview(url);
			};

			if (isRecording) {
				recorder.start();
			}
		}
	}, [recorder, isRecording, preview]);

	return (
		<>
			{(props.audiosrc || preview) &&
				<audio ref={audioRef} style={{ display: 'none' }} onEnded={() => setPlaying(false)} src={!preview ? props.audiosrc : preview} />
			}
			<ButtonGroup style={{ maxWidth: '300px', minWidth: '166px', marginTop: '5px', marginBottom: '5px', flexBasis: '50%', flexGrow: 2 }}>
				<Button style={{ width: '50%' }} color={props.audiosrc || preview ? 'primary' : 'secondary'} variant='contained' onClick={handleAudio}>
					{isPlaying ? <Stop /> : <PlayArrow />}
				</Button>
				{!preview ?
					<Button style={{ width: '50%' }} color='primary' variant='contained' onClick={handleRecord}>
						{isRecording ?
							<FiberManualRecord />
							:
							<RecordVoiceOver />
						}
					</Button>
					:
					[
						<Button key={0} style={{ width: '25%', color: '#ffffff', backgroundColor: theme.palette.success.main }} variant='contained' onClick={handleUploadAudio}>
							<Publish />
						</Button>
						,
						<Button key={1} style={{ width: '25%', color: '#ffffff', backgroundColor: theme.palette.error.main }} variant='contained' onClick={handleDeletePreview}>
							<DeleteForever />
						</Button>
					]
				}
			</ButtonGroup>
		</>
	);
}

export default Recorder;