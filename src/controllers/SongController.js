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

    //Get a song by external_id 
    async show(req, res){
        try{
            const {id} = req.params

           const songs = await Song.findOne({
                where: {
                    external_id: id
                }
           })

           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }
    

}