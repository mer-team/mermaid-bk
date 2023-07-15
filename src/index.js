const express = require('express')
const cors = require('cors')
const socketIO = require("socket.io")
const route  = require('./routes')
const { startScript, sendMessage } = require('../dummy-service/dummy-service')
const app = express()


app.use(cors())
app.use(express.json())
app.use(route)

const server = app.listen(8000, () => {
    console.log("Servidor a correr na porta 8000")
})

const io = socketIO(server)

//RABBIT MQ Connection
startScript()

module.exports = {server}

