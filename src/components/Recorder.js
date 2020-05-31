import React, { useState, useEffect } from 'react';
import { useTheme, Button, ButtonGroup } from '@material-ui/core';
import { PlayArrow, Stop, RecordVoiceOver, Publish, DeleteForever, FiberManualRecord } from '@material-ui/icons';
import token from '../js/token.js';
import audio from '../js/audio';
import '../css/pulse.css';

function Recorder(props) {
	const theme = useTheme();
	const [isPlaying, setPlaying] = useState(false);
	const [isRecording, setRecording] = useState(false);
	const [recorder, setRecorder] = useState(null);
	const [audioEl, setAudio] = useState(null);
	const [previewSource, setPreviewSource] = useState(null);

	useEffect(() => {
		if (props.audiosrc) {
			setAudio(new Audio(props.audiosrc));
		}
	}, [props.audiosrc]);

	useEffect(() => {
		if (audioEl !== null) {
			audioEl.onended = (e) => {
				setPlaying(false);
			}
		}
	}, [audioEl]);

	async function handleUploadAudio(e) {
		const data = new FormData();
		await audio.recordBuffer(previewSource.buffer)
			.then(blob => data.append('file', blob));

		const audioSrc = await fetch(`${process.env.REACT_APP_API_HOST}/user/0/audio`,
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

		props.update(URL.createObjectURL(audioSrc));
	}

	function handleDeletePreview(e) {
		setPreviewSource(null);
	}

	function handlePlaying(e) {
		if (previewSource) {
			if (isPlaying) {
				previewSource.stop();
			}
			else {
				previewSource.start();
			}
			setPlaying(!isPlaying);
		}
		else if (audioEl) {
			if (isPlaying) {
				audioEl.pause();
				audioEl.currentTime = 0;
			}
			else {
				audioEl.play();
			}
			setPlaying(!isPlaying);
		}
	}

	function handleRecord(e) {
		if (recorder === null) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(stream => {
					setRecorder(new MediaRecorder(stream, { mimeType: 'audio/ogg; codecs=opus' }));
					setRecording(true);
				})
				.catch(error => {
					console.log(error);
					setRecorder(null);
					setRecording(false);
				});
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
			recorder.ondataavailable = async (e) => {
				const array = await e.data.arrayBuffer();
				const audioBuffer = await audio.ctx.decodeAudioData(array);
				const truncated = audio.truncateBuffer(audioBuffer);
				setPreviewSource(audio.connectBuffer(truncated));
			};

			if (isRecording) {
				recorder.start();
			}
		}
	}, [recorder, isRecording]);

	useEffect(() => {
		if (previewSource !== null) {
			previewSource.onended = (e) => {
				setPreviewSource(audio.connectBuffer(previewSource.buffer));
				setPlaying(false);
			}
		}
	}, [previewSource]);

	return (
		<>
			<ButtonGroup style={{ maxWidth: '300px', minWidth: '166px', marginTop: '5px', marginBottom: '5px', flexBasis: '50%', flexGrow: 2 }}>
				<Button style={{ width: '50%' }} color={audioEl || previewSource ? 'primary' : 'secondary'} variant='contained' onClick={handlePlaying}>
					{isPlaying ? <Stop /> : <PlayArrow />}
				</Button>
				{!previewSource ?
					<Button style={{ width: '50%' }} color='primary' variant='contained' onClick={handleRecord}>
						{isRecording ?
							<FiberManualRecord className="pulse" />
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