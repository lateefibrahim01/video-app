const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const { ExpressPeerServer } = require('peer');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const peerServer = ExpressPeerServer(server, {
  path: '/peerjs',
});

app.use('/peerjs', peerServer);

io.on('connection', socket => {
  socket.on('join-room', (roomId, userId) => {
    socket.join(roomId);
    socket.to(roomId).broadcast.emit('user-connected', userId);

    socket.on('disconnect', () => {
      socket.to(roomId).broadcast.emit('user-disconnected', userId);
    });
  });
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
