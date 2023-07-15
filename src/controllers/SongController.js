require('dotenv').config()
const { Op } = require('sequelize')
const {Song, Sequelize} = require('../models/index')
var search = require('youtube-search');

var opts = {
    maxResults: 1,
    key: 'AIzaSyCVdyNQUbauI-DBDZ_a9GoRy3ukrIFiHMU'
  };

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
    }, 

    //Get a song by name 
    async filterByName(req, res){
        try{
            var {title} = req.params
            title = title.toLowerCase()

           const songs = await Song.findAll({
                where: {
                    title: Sequelize.where(
                        Sequelize.fn('LOWER',Sequelize.col("title")), "LIKE", `%${title}%`
                    )
                }
           })
    
           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }, 


    //Get a song by emotion 
    async filterByEmotion(req, res){
        try{
            var {emotion} = req.params
            emotion = emotion.toLowerCase()

           const songs = await Song.findAll({
                where: {
                    general_classification: Sequelize.where(
                        Sequelize.fn('LOWER',Sequelize.col("general_classification")), "LIKE", `%${emotion}%`
                    )
                }
           })
    
           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }, 

    //Get a song by name 
    async filterByAll(req, res){
        try{
            var {title, emotion} = req.params
            title = title.toLowerCase()
            emotion = emotion.toLowerCase()
           const songs = await Song.findAll({
                where: {
                    title: Sequelize.where(
                        Sequelize.fn('LOWER',Sequelize.col("title")), "LIKE", `%${title}%`
                    ), 
                    general_classification: Sequelize.where(
                        Sequelize.fn('LOWER',Sequelize.col("general_classification")), "LIKE", `%${emotion}%`
                    )
                }
           })
    
           return res.status(200).json(songs)
        }catch(e){
            console.log(e)
        }
    }, 


    async updateHits(req, res){
        try{
            const {song_id} = req.params

            const song = await Song.findOne({
                where: {
                    id: song_id
                }
            })

            song.hits = song.hits + 1

            await Song.update({hits: song.hits}, { where: { id: song_id } });
           return res.status(200).json("Hit updated")
        }catch(e){
            console.log(e)
        }
    }, 

    async getHits(req, res){
        try{
            const {song_id} = req.params

            const song = await Song.findOne({
                where: {
                    id: song_id
                }
            })

           return res.status(200).json(song.hits)
        }catch(e){
            console.log(e)
        }        
    }, 
}