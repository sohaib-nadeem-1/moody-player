const mongoose = require("mongoose");


let songSchema = mongoose.Schema({
    songName : String,
    artist : String,
    audio : String,
    mood : String
})

let songModel = mongoose.model("song",songSchema)

module.exports = songModel;