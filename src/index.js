const express = require('express')
const cors = require('cors')
const route  = require('./routes')
const app = express()
const http = require('http')
const server = http.createServer(app)
const requestIp = require("request-ip")

app.use(requestIp.mw())//middleware to get the ip of the user
app.use(cors())
app.use(express.json())
app.use(route)

server.listen(8000, () => {
    console.log("Servidor a correr na porta 8000")
})


module.exports = {server}

