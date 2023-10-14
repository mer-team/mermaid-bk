const express = require('express')
const route = express.Router()

const UserController = require('./controllers/UserController')
const SongController = require('./controllers/SongController')
const SongClassificationController = require('./controllers/SongClassificationController')

const { validateToken } = require('./JWT')
const FeedbackController = require('./controllers/FeedbackController')
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
route.get("/user/ip", UserController.getUserIp)
route.post("/user/bynameoremail", UserController.getUsersByEmailOrUsername)
route.get("/user/blocked", UserController.getOnlyBlockedUsers)
route.post("/user/blockuser/:email", UserController.blockUser)
route.post("/user/unblockuser/:email", UserController.unblockUser)
route.get("/user/getall", UserController.getUsers)
route.post("/user/change/password", UserController.changePassword)
route.post("/user/change/username", UserController.changeUsername)
//Get all the songs in the database
route.get("/song", SongController.index)
route.get("/song/:id", SongController.show)
route.get("/song/name/:title", SongController.filterByName)
route.get("/song/emotion/:emotion", SongController.filterByEmotion)
route.get("/song/name/:title/emotion/:emotion", SongController.filterByAll)
route.get("/song/getqueuesongs/:user_id", SongController.getQueueSongs)
route.get("/song/getqueuesongsbyip/:ip", SongController.getQueueSongsByIp)

route.post("/song/hits/:song_id", SongController.updateHits)
route.get("/song/hits/:song_id", SongController.getHits)
route.delete("/song/delete/:id", SongController.deleteSong)

//Get the song classification given the id of the song 
route.get("/classifications", SongClassificationController.index)
route.post("/song/classification/song/:external_id/user/:user_id", SongClassificationController.classify)

//Agree or Disagree with a classification
route.post("/feedback/agree/disagree/:agreeordisagree/user/:user_id/song/:song_id", FeedbackController.index)
route.get("/feedback/agrees/:song_id", FeedbackController.getTotalAgrees)
route.get("/feedback/disagrees/:song_id", FeedbackController.getTotalDisagrees)
route.get("/feedback/opinion/:user_id/:song_id", FeedbackController.getUserOpinion)
module.exports = route