// const express = require("express");
// const cors = require("cors")
// const songRoute = require('./Routes/song.routes')

// const app = express();

// app.use(express.json())
// app.use(cors())

// app.use('/',songRoute)



// module.exports = app



const express = require("express");
const cors = require("cors");
const songRoute = require("./Routes/song.routes");
const connectingDatabase = require("./Database/db");

const app = express();

app.use(express.json());
app.use(cors());

// Ensure DB is connected before any route handles a request
app.use(async (req, res, next) => {
    try {
        await connectingDatabase();
        next();
    } catch (err) {
        console.error("DB connection failed:", err);
        res.status(500).json({ error: "Database connection failed" });
    }
});

app.use("/", songRoute);

module.exports = app;