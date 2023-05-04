const express = require('express')
const route = express.Router()

const UserController = require('./controllers/UserController')
const SongController = require('./controllers/SongController')
const SongClassificationController = require('./controllers/SongClassificationController')

const { validateToken } = require('./JWT')
//Register User on the database  
route.post("/signup", UserController.store)
//Login the user with JWT
route.post("/login", UserController.index)
//validate the user
route.get("/confirm/:token", UserController.validate)
//Get user data by the token
route.get("/user", validateToken, UserController.show)
//resend the email 
route.get("/user/newtoken", UserController.resendEmail)

//Get all the songs in the database
route.get("/song", SongController.index)
route.get("/song/:id", SongController.show)
route.get("/song/name/:title", SongController.filterByName)
route.get("/song/emotion/:emotion", SongController.filterByEmotion)
route.get("/song/name/:title/emotion/:emotion", SongController.filterByAll)

//Get the song classification given the id of the song 
route.get("/classifications", SongClassificationController.index)


module.exports = route