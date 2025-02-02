import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Divider, ButtonGroup, Button, Avatar } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Shuffle, AccountCircle, DescriptionOutlined, ThumbUp, ThumbDown, Help, Replay } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import fetchGroup from '../js/fetchGroup.js';
import fetchUser from '../js/fetchUser.js';
import audio from '../js/audio';
import token from '../js/token.js';
import '../css/pulse.css';
import EndCard from '../components/EndCard';

function Card(props) {
	const [answered, setAnswered] = useState(false);
	const [info, setInfo] = useState({});
	const [recorder, setRecorder] = useState(null);
	const [playing, setPlaying] = useState('');
	const cardRef = useRef(null);
	const [answerSource, setAnswerSource] = useState(null);
	const correctRef = useRef(null);
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
		fetchUser(props.username, controller)
			.then(newInfo => setInfo(newInfo));

		return function cleanup() { controller.abort() }
	}, [props.username]);

	useEffect(() => {
		if (cardRef.current !== null) {
			cardRef.current.focus();
		}
	});

	function handleRecord(e) {
		if (recorder === null) {
			navigator.mediaDevices.getUserMedia({ audio: true })
				.then(stream => {
					const recorder = new MediaRecorder(stream, { mimeType: 'audio/ogg; codecs=opus' });
					recorder.ondataavailable = async (e) => {
						recorder.stream.getAudioTracks()[0].stop();
						const array = await e.data.arrayBuffer();
						const audioBuffer = await audio.ctx.decodeAudioData(array);
						const truncated = audio.truncateBuffer(audioBuffer);
						const sourceNode = audio.connectBuffer(truncated);
						sourceNode.onended = (e) => {
							setAnswerSource(audio.connectBuffer(sourceNode.buffer));
							setPlaying('');
						}
						setAnswerSource(sourceNode);
						setAnswered(true);
					};
					recorder.start();
					setRecorder(recorder);
				})
				.catch(error => {
					console.log(error);
					setRecorder(null);
				});
		}
		else if (isRecording) {
			recorder.stop();
			setRecorder(null);
		}
	}

	function handlePlay(name) {
		if (!playing) {
			if (name === 'answer' && answerSource) {
				answerSource.start();
				setPlaying('answer');
			}
			else if (name === 'correct' && info.audiosrc) {
				correctRef.current.play();
				setPlaying('correct');
			}
		}
		else if (playing === 'answer') {
			answerSource.stop();
			if (name === 'correct' && info.audiosrc) {
				correctRef.current.play();
				setPlaying('correct');
			}
			else {
				setPlaying('');
			}
		}
		else if (playing === 'correct') {
			correctRef.current.pause();
			correctRef.current.currentTime = 0;
			if (name === 'answer' && answerSource) {
				answerSource.start();
				setPlaying('answer');
			}
			else {
				setPlaying('');
			}
		}
	}

	function handleCorrect(e) {
		props.advance();
	}

	function handleWrong(e) {
		props.advance();
	}

	async function handleFeedback(e) {
		const data = new FormData();
		audio.recordBuffer(answerSource.buffer)
			.then(blob => {
				data.append('audio', blob);
				data.append('username', info.username);
				fetch(`${process.env.REACT_APP_API_HOST}/learn/feedback/request`,
					{
						method: 'POST',
						headers: {
							'Authorization': `Bearer ${token.get()}`
						},
						body: data
					})
					.then(res => {
						if (res.ok) {
							props.advance();
						}
					})
			});
	}

	return (
		<div
			style={props.hidden ?
				{ display: 'none' }
				:
				{ marginTop: '10px', marginBottom: '10px', height: '420px', boxShadow: '0px 0px 1px .5px lightgray', borderRadius: '5px' }
			}
			ref={cardRef}
			tabIndex="0"
		>
			{!answered ?
				<div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					{props.settings.picture &&
						<Avatar style={{ height: '200px', width: '200px', margin: '5px' }} src={info.picturesrc}></Avatar>
					}
					{props.settings.name &&
						<Typography variant="h5" style={{ margin: '5px' }}> {info.firstname} {info.lastname} </Typography>
					}
					<Button variant="contained" onClick={handleRecord}>
						{isRecording ?
							<div className="pulse">Recording...</div>
							:
							<div>Pronouncit!</div>
						}
					</Button>
				</div>
				:
				<div style={{ display: 'flex', width: '100%', height: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					<Avatar style={{ height: '200px', width: '200px', margin: '5px' }} src={info.picturesrc}></Avatar>
					<Typography variant="h5" style={{ margin: '5px' }}> {info.firstname} {info.lastname} </Typography>
					{info.audiosrc &&
						<audio src={info.audiosrc} ref={correctRef} onEnded={() => setPlaying('')} />
					}
					<ButtonGroup style={{ width: '100%', maxWidth: '500px' }} >
						<Button style={{ flexBasis: '50%' }} variant="contained" onClick={() => handlePlay('answer')}>
							{playing === 'answer' ?
								<div className="pulse">Playing answer...</div>
								:
								<div>Your answer</div>
							}
						</Button>
						<Button style={{ flexBasis: '50%' }} variant="contained" onClick={() => handlePlay('correct')}>
							{playing === 'correct' ?
								<div className="pulse">Playing pronounciation...</div>
								:
								<>
									{info.audiosrc ?
										<div>Correct pronounciation</div>
										:
										<div>No pronounciation</div>
									}
								</>
							}
						</Button>
					</ButtonGroup>
					<Divider style={{ width: '100%', maxWidth: '500px', marginTop: '10px', marginBottom: '10px' }} />
					<Typography> How did you do? </Typography>
					<div style={{ display: 'flex', width: '100%', maxWidth: '500px' }}>
						<Button style={{ flexBasis: '25%' }} variant="text" title="Correct" onClick={handleCorrect}> <ThumbUp /> </Button>
						<Button style={{ flexBasis: '25%' }} variant="text" title="Incorrect" onClick={handleWrong}> <ThumbDown /> </Button>
						<Button style={{ flexBasis: '25%' }} variant="text" title="Try again" onClick={() => setAnswered(false)}> <Replay /> </Button>
						<Button style={{ flexBasis: '25%' }} variant="text" title="Ask them" onClick={handleFeedback}> <Help /> </Button>
					</div>
				</div>
			}
		</div >
	);
}

export default function Learn() {
	const { id } = useParams();
	const [members, setMembers] = useState([]);
	const [index, setIndex] = useState(0);
	const [settings, setSettings] = useState({
		name: true,
		picture: true
	});
	const [shuffledMembers, setShuffledMembers] = useState([]);
	const [shuffle, setShuffle] = useState(0);

	useEffect(() => {
		const controller = new AbortController();
		fetchGroup(id, controller)
			.then(group => {
				const total = [group.owner].concat(group.members);
				const others = total.filter(user => user !== group.me);
				setMembers(others);
			})
			.catch(err => {
				if (err.name === "AbortError") {
					console.log('Aborted fetch request.');
				}
			});

		return function cleanup() { controller.abort() }
	}, [id]);

	useEffect(() => {
		setIndex(0);
		if (shuffle) {
			setShuffledMembers(members.sort((a, b) => Math.random() - .5));
		}
	}, [shuffle, members])

	// find better name
	function handleMove(value) {
		if (index + value < 0) {
			setIndex(0);
		}
		else if (index + value > members.length) {
			setIndex(members.length);
		}
		else {
			setIndex(index + value);
		}
	}

	function handleArrows(e) {
		if (e.key === 'ArrowLeft') {
			handleMove(-1);
		}
		else if (e.key === 'ArrowRight') {
			handleMove(1);
		}
	}

	function handleShuffle(e) {
		if (shuffle === 0) {
			setShuffle(1);
		}
		else {
			setShuffle(0);
		}
	}

	return (
		<Paper style={{ padding: '10px', minHeight: '500px', display: 'flex', flexDirection: 'column', overflowX: 'hidden' }} onKeyDown={handleArrows} tabIndex="0">
			<Typography variant="h5"> Learn </Typography>
			<Divider />
			<ToggleButtonGroup style={{ marginTop: '10px', justifyContent: 'center' }}>
				<ToggleButton value="name" selected={settings.name} onClick={() => setSettings(old => ({ ...old, name: !settings.name }))}> <DescriptionOutlined /> </ToggleButton>
				<ToggleButton value="picture" selected={settings.picture} onClick={() => setSettings(old => ({ ...old, picture: !settings.picture }))}> <AccountCircle /> </ToggleButton>
				<ToggleButton value="shuffle" selected={shuffle > 0} onClick={handleShuffle}> <Shuffle /> </ToggleButton>
				<ToggleButton disabled value="index" style={{ width: '48px', padding: '0px', color: 'rgba(0, 0, 0, 0.38)' }}> {index + 1} / {members.length + 1} </ToggleButton>
			</ToggleButtonGroup>
			{shuffle ?
				<>{shuffledMembers.map((value, arrayIndex) => <Card username={value} key={value} settings={settings} hidden={index !== arrayIndex} advance={() => handleMove(1)} />)}</>
				:
				<>{members.map((value, arrayIndex) => <Card username={value} key={value} settings={settings} hidden={index !== arrayIndex} advance={() => handleMove(1)} />)}</>
			}
			<EndCard hidden={index !== members.length} restart={() => {
				if (shuffle > 0) {
					setShuffle(shuffle + 1);
				}
				else {
					setIndex(0);
				}
			}} />
			<div style={{ flexGrow: 1 }} />
			<ButtonGroup style={{ width: '100%', justifyContent: 'center' }}>
				<Button style={{ width: '150px' }} onClick={() => handleMove(-1)}> Previous </Button>
				<Button style={{ width: '150px' }} onClick={() => handleMove(1)}> Next </Button>
			</ButtonGroup>
		</Paper >
	);
}