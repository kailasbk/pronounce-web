import React, { useState, useEffect, useRef } from 'react';
import { Paper, Typography, Divider, ButtonGroup, Button, Avatar, Slider } from '@material-ui/core';
import { ToggleButton, ToggleButtonGroup } from '@material-ui/lab';
import { Shuffle, AccountCircle, DescriptionOutlined, PlayArrow, Stop } from '@material-ui/icons';
import { useParams } from 'react-router-dom';
import fetchGroup from '../js/fetchGroup.js'
import fetchUser from '../js/fetchUser.js';
import '../css/flipcard.css';
import EndCard from '../components/EndCard';

function Flashcard(props) {
	const [flipped, setFlipped] = useState(false);
	const [info, setInfo] = useState({});
	const [playbackSpeed, setSpeed] = useState(0);
	const [isPlaying, setPlaying] = useState(false);
	const cardRef = useRef(null);
	const audioRef = useRef(null);

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

	useEffect(() => {
		if (audioRef.current) {
			audioRef.current.playbackRate = 2 ** playbackSpeed;
		}
	}, [playbackSpeed]);

	function handleSpeed(e, value) {
		setSpeed(value);
	}

	function handlePlaying(e) {
		e.stopPropagation();
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
				audioRef.current.currentTime = 0;
				setPlaying(false);
			}
			else {
				audioRef.current.play();
				setPlaying(true);
			}
		}
	}

	return (
		<div
			className="flip-card"
			style={props.hidden ?
				{ display: 'none' }
				:
				{ marginTop: '10px', marginBottom: '10px', height: '420px' }
			}
		>
			<div
				onKeyDown={(e) => {
					if (e.key === 'ArrowUp') {
						setFlipped(true);
					}
					else if (e.key === 'ArrowDown') {
						setFlipped(false);
					}
				}}
				onClick={(e) => {
					setFlipped(!flipped);
				}}
				ref={cardRef}
				tabIndex="0"
				className={flipped ? "flip-card-inner flip-card-inner-flipped" : "flip-card-inner"}
			>
				<div className="flip-card-front" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					{props.settings.picture &&
						<Avatar style={{ height: '200px', width: '200px', margin: '5px' }} src={info.picturesrc}></Avatar>
					}
					{props.settings.name &&
						<Typography variant="h5" style={{ margin: '5px' }}> {info.firstname} {info.lastname} </Typography>
					}
				</div>
				<div className="flip-card-back" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
					<Avatar style={{ height: '200px', width: '200px', margin: '5px' }} src={info.picturesrc}></Avatar>
					<Typography variant="h5" style={{ margin: '5px' }}> {info.firstname} {info.lastname} </Typography>
					{info.audiosrc ?
						<div>
							<audio src={info.audiosrc} ref={audioRef} onEnded={() => setPlaying(false)} />
							<Slider
								value={playbackSpeed}
								onChange={handleSpeed}
								onClick={(e) => e.stopPropagation()}
								valueLabelDisplay="auto"
								valueLabelFormat={(x) => `x${x}`}
								min={-2}
								step={1}
								max={1}
								scale={(x) => 2 ** x}
							/>
							<Button onClick={handlePlaying}> {!isPlaying ? <PlayArrow /> : <Stop />} </Button>
						</div>
						:
						<Typography> No audio</Typography>
					}
				</div>
			</div>
		</div>
	);
}

export default function Flashcards() {
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
			<Typography variant="h5"> Flashcards </Typography>
			<Divider />
			<ToggleButtonGroup style={{ marginTop: '10px', justifyContent: 'center' }}>
				<ToggleButton value="name" selected={settings.name} onClick={() => setSettings(old => ({ ...old, name: !settings.name }))}> <DescriptionOutlined /> </ToggleButton>
				<ToggleButton value="picture" selected={settings.picture} onClick={() => setSettings(old => ({ ...old, picture: !settings.picture }))}> <AccountCircle /> </ToggleButton>
				<ToggleButton value="shuffle" selected={shuffle > 0} onClick={handleShuffle}> <Shuffle /> </ToggleButton>
				<ToggleButton disabled value="index" style={{ width: '48px', padding: '0px', color: 'rgba(0, 0, 0, 0.38)' }}> {index + 1} / {members.length + 1} </ToggleButton>
			</ToggleButtonGroup>
			{shuffle ?
				<>{shuffledMembers.map((value, arrayIndex) => <Flashcard username={value} key={value} settings={settings} hidden={index !== arrayIndex} />)}</>
				:
				<>{members.map((value, arrayIndex) => <Flashcard username={value} key={value} settings={settings} hidden={index !== arrayIndex} />)}</>
			}
			<EndCard flashcard hidden={index !== members.length} restart={() => {
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