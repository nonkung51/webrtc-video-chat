import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import io from "socket.io-client";

function App() {
	const socket = useRef();
	useEffect(() => {
		socket.current = io.connect('localhost:5000');
	});
	return <h1>Hey!</h1>;
}

export default App;
