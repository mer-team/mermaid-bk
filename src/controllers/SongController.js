require('dotenv').config()
const {Song} = require('../models/index')

module.exports = {

    //Get the Songs in the database
    async index(req, res){
        try{
           const songs = await Song.findAll()
           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }, 

    async show(req, res){
        try{
           const songs = await Song.findAll()
           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }
    

}