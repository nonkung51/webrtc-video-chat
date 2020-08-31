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
    socket.on('disconnect', () => {
        delete users[socket.id];
        io.sockets.emit("online_users_report", users);
    })
});

server.listen(5000, () => console.log('server is running on port 5000'));
