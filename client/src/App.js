import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import Peer from 'simple-peer';
import io from 'socket.io-client';

const Video = styled.video`
	height: 20rem;
	margin: 2rem;
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

const RecievingCallButton = styled.button`
	margin: 1rem;
	padding: 0.8rem;
	border-radius: 2rem;
	border-width: 0rem;
	color: white;
	background-color: darkolivegreen;

	&:hover {
		background-color: green;
	}

	&:focus {
		outline: none;
	}
`;

const VideoContainer = styled.div`
	display: flex;
	justify-content: space-between;
`;

const BlankContainer = styled.div`
	background-color: gray;
	height: 20rem;
	width: 28rem;
	margin: 2rem;
`;

function App() {
	const [stream, setStream] = useState();
	const [myID, setMyID] = useState();
	const [onlineUsers, setOnlineUsersList] = useState({});
	const [callerId, setCallerId] = useState('');
	const [receivingCall, setReceivingCall] = useState(false);
	const [callerSignal, setCallerSignal] = useState();
	const [callAccepted, setCallAccepted] = useState(false);

	const socket = useRef();
	const userVideo = useRef();
	const partnerVideo = useRef();

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
		socket.current.on('someone_calling', (data) => {
			setReceivingCall(true);
			setCallerId(data.from);
			setCallerSignal(data.signal);
		});
	}, []);

	function callPeer(id) {
		const peer = new Peer({
			initiator: true,
			trickle: false,
			stream: stream,
		});

		peer.on('signal', (data) => {
			socket.current.emit('call_someone', {
				callId: id,
				data: data,
				callerId: myID,
			});
		});

		peer.on('stream', (stream) => {
			if (partnerVideo.current) {
				partnerVideo.current.srcObject = stream;
			}
		});

		socket.current.on('call_accepted', (signal) => {
			setCallAccepted(true);
			peer.signal(signal);
		});
	}

	function acceptCall() {
		setCallAccepted(true);
		const peer = new Peer({
			initiator: false,
			trickle: false,
			stream: stream,
		});
		peer.on('signal', (data) => {
			socket.current.emit('accept_calling', {
				signal: data,
				to: callerId,
			});
		});

		peer.on('stream', (stream) => {
			partnerVideo.current.srcObject = stream;
		});

		peer.signal(callerSignal);
	}

	let UserVideo;
	if (stream) {
		UserVideo = <Video playsInline muted ref={userVideo} autoPlay />;
	}

	let PartnerVideo;
	if (callAccepted) {
		PartnerVideo = <Video playsInline ref={partnerVideo} autoPlay />;
	}

	let incomingCall;
	if (receivingCall) {
		incomingCall = (
			<>
				<p>{callerId} is calling you</p>
				<RecievingCallButton onClick={acceptCall}>
					Accept
				</RecievingCallButton>
			</>
		);
	}

	return (
		<Container>
			<h1>HCRL - Video Chat!</h1>
			<VideoContainer>
				{UserVideo}
				{PartnerVideo ? PartnerVideo : <BlankContainer />}
			</VideoContainer>

			<CallerContainer>
				{Object.values(onlineUsers).map((user) => {
					if (user.id !== myID) {
						return (
							<CallButton
								onClick={() => callPeer(user.id)}
							>{`Call ${user.id}`}</CallButton>
						);
					}
				})}
			</CallerContainer>
			{incomingCall}
		</Container>
	);
}

export default App;
