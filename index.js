const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const socket = require('socket.io');

const { mongoURI } = require('./config.json');

require('./models/Call');

const app = express();
const server = http.createServer(app);
const io = socket(server);

mongoose.connect(mongoURI, { useNewUrlParser: true });

const users = {};
const partners = {};

const Call = mongoose.model('call');

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
		if (partners[data.to] != null) {
			io.to(data.to).emit('call_accepted', data.signal);
		}
	});
	socket.on('disconnect', () => {
		delete users[socket.id];
		io.sockets.emit('online_users_report', users);
		io.to(partners[socket.id]).emit('hang_up');
		io.to(partners[partners[socket.id]]).emit('hang_up');
	});
	socket.on('call_initiate', ({ callerId, callId }) => {
		partners[callId] = callerId;
		partners[callerId] = callId;
	});
	socket.on('end_call', async ({ id, elapseTime }) => {
		io.to(partners[id]).emit('hang_up');
		const call = new Call({
			caller1: id,
			caller2: partners[id],
			elapseTime,
		});
		await call.save();
	});
});

server.listen(5000, () => console.log('server is running on port 5000'));
