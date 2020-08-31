import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import io from 'socket.io-client';

const Video = styled.video`
	height: 30%;
`;

const Container = styled.div`
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	justify-content: start;
	align-items: center;
`;

function App() {
	const socket = useRef();
	const [stream, setStream] = useState();
	const userVideo = useRef();
	

	useEffect(() => {
		socket.current = io.connect('localhost:5000');
		navigator.mediaDevices
			.getUserMedia({ video: true, audio: true })
			.then((stream) => {
				setStream(stream);
				if (userVideo.current) {
					userVideo.current.srcObject = stream;
				}
			});
	}, []);

	let UserVideo;
	if (stream) {
		UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
	}

	return (
		<Container>
			{ UserVideo }
			<h1>Hey!</h1>
		</Container>
	);
}

export default App;
