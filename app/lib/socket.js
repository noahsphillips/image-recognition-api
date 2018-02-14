module.exports = (io) => {
    io.on('connection', (socket) => {
        socket.emit('connected', { hello: 'world' });
    });
}
