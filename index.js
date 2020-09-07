const express = require('express');
const http = require('http');
const app = express();
const server = http.createServer(app);
const socket = require('socket.io');
const io = socket(server);

const users = {};
const partners = {};

io.on('connection', (socket) => {
	if (!users[socket.id]) {
		users[socket.id] = { id: socket.id };
	}
	socket.emit('id_report', socket.id);
	io.sockets.emit('online_users_report', users);
	socket.on('call_someone', (data) => {
		io.to(data.callId).emit('someone_calling', {
			signal: data.data,
			from: data.callerId,
		});
	});
	socket.on('accept_calling', (data) => {
		io.to(data.to).emit('call_accepted', data.signal);
	});
	socket.on('disconnect', () => {
		delete users[socket.id];
        io.sockets.emit('online_users_report', users);
        io.to(partners[socket.id]).emit('hang_up');
        io.to(partners[partners[socket.id]]).emit('hang_up');
    });
    socket.on('call_initiate', ({callerId, callId}) => {
        console.log(`${callId} initiate call with ${callerId}`)
        partners[callId] = callerId;
        partners[callerId] = callId;
    });
    socket.on('end_call', ({ id }) => {
        console.log(`${id} end call with ${partners[id]}`)
        io.to(partners[id]).emit('hang_up');
    });
});

server.listen(5000, () => console.log('server is running on port 5000'));
