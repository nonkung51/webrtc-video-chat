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

const CallerContainer = styled.div`
	display: flex;
	flex-direction: row;
	justify-content: space-between;
`;

const CallButton = styled.button`
	margin: 1rem;
	padding: 0.8rem;
	border-radius: 2rem;
	border-width: 0rem;

	&:hover {
		background-color: gray;
	}

	&:focus {
		outline: none;
	}
`;

function App() {
	const socket = useRef();
	const [stream, setStream] = useState();
	const userVideo = useRef();
	const [myID, setMyID] = useState();
	const [onlineUsers, setOnlineUsersList] = useState({});

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
		socket.current.on('id_report', (id) => {
			setMyID(id);
		});
		socket.current.on('online_users_report', (users) => {
			setOnlineUsersList(users);
		});
	}, []);

	let UserVideo;
	if (stream) {
		UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
	}

	return (
		<Container>
			{UserVideo}
			<h1>Hey!</h1>
			<CallerContainer>
				{Object.values(onlineUsers).map((user) => {
					if (user.id !== myID) {
						return <CallButton>{`Call ${user.id}`}</CallButton>;
					}
				})}
			</CallerContainer>
		</Container>
	);
}

export default App;
