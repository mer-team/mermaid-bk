const express = require('express')
const cors = require('cors')
const route  = require('./routes')
const app = express()

// load vars from .env (do I need to repeat this in other places? test!)
require('dotenv').config();

app.use(cors())
app.use(express.json())
app.use(route)

app.listen(8000)


