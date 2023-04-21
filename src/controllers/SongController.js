require('dotenv').config()
const { Op } = require('sequelize')
const {Song, Sequelize} = require('../models/index')

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
    async filter(req, res){
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
    }
    

}