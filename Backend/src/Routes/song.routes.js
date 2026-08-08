const express = require("express")
const multer = require("multer")
const route = express.Router();
const songModel = require("../Models/songs.model")
const uploadingFile = require("../Services/song.service");

const upload = multer({ storage: multer.memoryStorage() })

route.post('/songs', upload.single("audio"), async (req, res) => {
    try {
        const imagekites = await uploadingFile(req.file)

        const savingSong = await songModel.create({
            songName: req.body.songname,
            artist: req.body.artist,
            audio: imagekites.url,
            mood: req.body.mood
        })

        res.json({
            message: "Song Created Successfully",
            song: savingSong
        })
    } catch (err) {
        console.error("Error creating song:", err);
        res.status(500).json({
            message: "Failed to create song",
            error: err.message
        })
    }
})

route.get('/songs', async (req, res) => {
    try {
        const { mood } = req.query;

        // agar mood diya gaya hai to filter karo, warna sab songs bhejo
        const filter = mood ? { mood } : {};

        const song = await songModel.find(filter);

        res.json({
            message: "Get Updates",
            song
        })
    } catch (err) {
        console.error("Error fetching songs:", err);
        res.status(500).json({
            message: "Failed to fetch songs",
            error: err.message
        })
    }
})

module.exports = route;