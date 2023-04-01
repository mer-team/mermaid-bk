require('dotenv').config()
const {User} = require('../models/index')
const bcrypt = require("bcrypt")
const { Op, json } = require('sequelize');
const { body } = require('express-validator');
const jwt = require("jsonwebtoken")

module.exports = {

    //Register the user 
    async store(req, res){
        try{
            //getting the name , email and password
            const {name, email, passw} = req.body
                    
            //Check if it is a valid password the password
            body("passw", 'This password is invalid try another one').matches(/(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/)

            //Check if the current name and email exists on the database 
            const users = await User.findAll({
                where: {
                    [Op.or]:[
                        {email: email}, 
                        {name: name}
                    ]
                }
            })
            if(users.length > 0){
                return res.status(400).json("This email or name is already in use")
            }
            //After all the verification we can create the user 

            //Create a hashed password 
            const hash_passw = await bcrypt.hash(passw, 10)

            User.create({
                email: email, 
                hash_passwd: hash_passw, 
                name: name
            }).then(user => {
                return res.status(200).json("User created")
            }).catch(err => {
                console.log(err)
            })

        }catch(e){
            console.log(e)
        }
    }, 

    //Login the user and return the jwt token
    async index(req, res){
        try{
            const {email, passw} = req.body
            //verify if the email exists on our database 
            const user = await User.findOne({
                where: {
                    email: email
                }
            })

            if(!user){
                return res.status(400).json("User Not Founded")
            }


            //verify if the password equals to the one on the database 
            if(await bcrypt.compare(passw, user.hash_passwd)){
                const token = jwt.sign({email: user.email}, process.env.ACESS_TOKEN_SECRET)
                return res.status(200).json({token})
            }else{
                return res.status(400).json("Wrong Password")
            }

        }catch(e){
            console.log(e)
        }
        

    }, 
}