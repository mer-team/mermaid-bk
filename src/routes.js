const express = require('express')
const route = express.Router()

const UserController = require('./controllers/UserController')

//Register User on the database  
route.post("/signup", UserController.store)
//Login the user with JWT
route.post("/login", UserController.index)


module.exports = route