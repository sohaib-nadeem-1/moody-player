const express = require("express");
const cors = require("cors")
const songRoute = require('./Routes/song.routes')

const app = express();

app.use(express.json())
app.use(cors())

app.use('/',songRoute)



module.exports = app



