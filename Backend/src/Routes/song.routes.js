const express = require("express")
const multer = require("multer")
const route = express.Router();
const songModel = require("../Models/songs.model")
const uploadingFile = require("../Services/song.service");

const upload = multer({storage:multer.memoryStorage()})

route.post('/songs',upload.single("audio"),async (req,res)=>{
    const imagekites = await uploadingFile(req.file)
          const savingSong = await songModel.create({
       songName : req.body.songname,
    artist : req.body.artist,
    audio : imagekites.url,
    mood : req.body.mood
   })
    
    res.json({
        message : " Song Created Sucessfully",
        song : savingSong 
    })
})

route.get('/songs',async(req,res)=>{
const {mood} = req.query;
    console.log(req.query);
    
  const song = await songModel.find({
    mood : mood,
  })  
    
  res.json({
    message : "Get Updates",
    song
  })
    
})

 
module.exports = route;