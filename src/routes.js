const express = require('express')
const route = express.Router()

const UserController = require('./controllers/UserController')
const { validateToken } = require('./JWT')

//Register User on the database  
route.post("/signup", UserController.store)
//Login the user with JWT
route.post("/login", UserController.index)
//Get user data by the JWT
route.get("/user", validateToken, UserController.show)


module.exports = route