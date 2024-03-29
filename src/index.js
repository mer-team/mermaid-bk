const express = require('express')
const cors = require('cors')
const route  = require('./routes')
const app = express()
const http = require('http')
const socketIo = require('socket.io')
const server = http.createServer(app)
const requestIp = require("request-ip")
const swaggerUI = require('swagger-ui-express')
const swaggerDocs = require('./swagger.json')
//setup the server to send realtime updates to the frontend
const io = socketIo(server)
const connectedSong = {};

io.on('connection', socket => {
    const {song_id} = socket.handshake.query; 
    connectedSong[song_id] = socket.id; 
});

 app.use( (req, res, next) => {
    req.io = io; 
    req.connectedSong = connectedSong;
    return next(); 
 });


app.use(requestIp.mw()) //middleware to get the ip of the user
app.use(cors())              
app.use(express.json()) 
app.use(route) 
app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocs))

server.listen(8000, () => { 
    console.log("Servidor a correr na porta 8000")
})


module.exports = {io}

