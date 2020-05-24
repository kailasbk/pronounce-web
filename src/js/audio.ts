function truncateBuffer(buffer: AudioBuffer): AudioBuffer {
	const ctx = new AudioContext();
	console.log('original:', buffer);
	let channels = [];
	for (let i = 0; i < buffer.numberOfChannels; i++) {
		channels[i] = buffer.getChannelData(i);
	}

	// implement reduce for scalability
	const max = Math.max(...channels[0]);
	console.log(max);

	const cutoff = max / 20;

	let start = 0;
	for (let i = 1000; i < channels[0].length; i++) {
		if (channels[0][i] > cutoff) {
			start = Math.max(start, i - 1000);
			break;
		}
	}

	let end = 0;
	for (let i = channels[0].length - 1; i >= 0; i--) {
		if (channels[0][i] > cutoff) {
			end = Math.min(channels[0].length - 1, i + 1000);
			break;
		}
	}

	console.log(start + ' to ' + end);
	channels = channels.map(channel => channel.subarray(start, end));

	let newBuffer = ctx.createBuffer(channels.length, channels[0].length, buffer.sampleRate);
	channels.forEach((channel, index) => {
		newBuffer.copyToChannel(channel, index);
	});
	console.log('edited: ', newBuffer)

	return newBuffer;
}

function connectBuffer(buffer: AudioBuffer): AudioBufferSourceNode {
	const ctx = new AudioContext();
	let source = ctx.createBufferSource();
	source.buffer = buffer;
	source.connect(ctx.destination);

	return source;
}

function recordBuffer(buffer: AudioBuffer): Promise<Blob> {
	const ctx = new AudioContext();
	let source = ctx.createBufferSource();
	const dest = ctx.createMediaStreamDestination();
	source.buffer = buffer;
	source.connect(dest);
	const recorder = new MediaRecorder(dest.stream, { mimeType: 'audio/ogg; codecs=opus' });
	const promise = new Promise<Blob>((res, rej) => {
		try {
			recorder.start();
			source.start();
			source.onended = (e) => {
				recorder.stop();
			}
			recorder.ondataavailable = (e) => {
				res(e.data)
			}
		} catch (err) {
			rej(err);
		}
	});

	return promise;
}

const audio = { truncateBuffer, recordBuffer, connectBuffer };

export default audio;