require('dotenv').config()
const { verify } = require("jsonwebtoken");


const tokenToUser = (token) => {
  var decodedClaims = verify(token, process.env.ACESS_TOKEN_SECRET)
  return decodedClaims
}

const validateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const accessToken = authHeader && authHeader.split(' ')[1]
  
  if (!accessToken) return res.status(400).json("User not Authenticated!" );

    verify(accessToken, process.env.ACESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403)
        req.user = user
        next()
    })

};

module.exports = {validateToken, tokenToUser };