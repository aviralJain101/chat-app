const path = require('path')
const express = require('express')
const http = require('http')
const socketio = require('socket.io')
const Filter = require('bad-words')
const {generateMessage, generateLocationMessage} = require('./utils/messages')
const {addUser,removeUser,getUser,getUsersInRoom} = require('./utils/users.js')

const app = express()
const server = http.createServer(app)
const io = socketio(server) //socketio requires http server thts why we created a server

const port = process.env.PORT || 3000
const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

// let count=0
// io.on('connection',(socket)=>{
//     console.log('new web socket connection')
    
//     socket.emit('countUpdated',count)
//     socket.on('increment',()=>{
//         count++;
//         //socket.emit('countUpdated',count) using socket we are emitting count to a particular client i.e. who requested
//         io.emit('countUpdated',count) //it emits to all the clients connected
//     })
// })

io.on('connection',(socket)=>{
    console.log('new web socket connection')

    // socket.emit('message',generateMessage('Welcome to chat room!')) //to emit to a particular connection
    // socket.broadcast.emit('message',generateMessage('A new user has joined'))//to emit to all except that particular connection
    
    socket.on('join', ({username, room},callback)=>{
        const {error,user} = addUser({id:socket.id, username,room})
        if(error){
            return callback(error)
        }

        socket.join(user.room) //can be used on server only
        
        socket.emit('message',generateMessage('Welcome to chat room!')) //to emit to a particular connection
        socket.broadcast.to(user.room).emit('message',generateMessage(`${user.username} has joined`))//to emit to all except that particular connection
        io.to(user.room).emit('roomData',{
            room: user.room,
            users:getUsersInRoom(user.room)
        })
        
        callback()
    })

    socket.on('sentMessage',(message,callback)=>{
        const user = getUser(socket.id)
        const filter = new Filter()
        if(filter.isProfane(message)){
            return callback('Profanity is not allowed')
        }
        io.to(user.room).emit('message',generateMessage(user.username,message))//to emit to all the connections
        callback('Delivered')//for acknowledge that the message is delivered to server
    })

    socket.on('sendLocation',(coords,callback)=>{
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage',generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`))
        callback()
    })

    socket.on('disconnect',()=>{
        const user = removeUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage(`${user.username} has left`))
            io.to(user.room).emit('roomData',{
                room: user.room,
                users:getUsersInRoom(user.room)
            })
        }
    })//built in
})

server.listen(port, () => {
    console.log('Server listening on port',port)
})