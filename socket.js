const SocketIO = require('socket.io')

module.exports = (server, app, sessionMiddleware) => {
    const io = SocketIO(server, {path: '/socket.io'});
    app.set('io', io)
    const index = io.of('/')

    index.on('connection', (socket) => {
        const req = socket.request;
        const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        console.log('New Client Join', ip, socket.id, req.ip);
    
        socket.on('disconnet', () => {
            console.log('Client Exit', ip, socket.id)
            clearInterval(socket.interval)
            socket.emit('exit', {
                user : '나간놈'
            })
        })

        // socket.on('error', (error) => {
        //     console.error(error)
        // })

        // socket.on('reply', (data) => {
        //     console.log(data);
        // })
        
        // socket.interval = setInterval(() => {
        //     socket.emit('userUpdate', {
        //         users : socket.adapter.rooms
        //     })
        // }, 1000)
    })

    index.on('disconnect', (socket) => {
            console.log('Client Exit', ip, socket.id)
            clearInterval(socket.interval)
    })
}