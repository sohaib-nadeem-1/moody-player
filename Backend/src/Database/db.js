const mongoose = require("mongoose");

async function connectingDatabase() {
    try {
        console.log("MONGODB_URL exists:", !!process.env.MONGODB_URL);

        await mongoose.connect(process.env.MONGODB_URL);

        console.log("Database Is Connected Successfully");
    } catch (err) {
        console.log("Database connection failed:", err);
        throw err;
    }
}

module.exports = connectingDatabase;