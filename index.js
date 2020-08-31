const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const socket = require("socket.io");
const io = socket(server);

const users = {};

io.on('connection', socket => {
    if (!users[socket.id]) {
        users[socket.id] = {id: socket.id};
    }
    socket.emit("id_report", socket.id);
    io.sockets.emit("online_users_report", users);
    socket.on("call_someone", (data) => {
        io.to(data.callId).emit('someone_calling', {signal: data.data, from: data.callerId});
    })
    socket.on("accept_calling", (data) => {
        io.to(data.to).emit('call_accepted', data.signal);
    })
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.sockets.emit("online_users_report", users);
    })
});

server.listen(5000, () => console.log('server is running on port 5000'));
