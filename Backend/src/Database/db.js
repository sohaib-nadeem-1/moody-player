const mongoose = require("mongoose");

async function connectingDatabase() {
    // agar already connected/connecting hai to dobara connect mat karo
    if (mongoose.connection.readyState >= 1) return;

    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Database Is Connected Successfully");
}

module.exports = connectingDatabase;