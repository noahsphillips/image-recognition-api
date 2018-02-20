module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('connected');
        socket.emit('connected', { hello: 'world' });
    });
}
