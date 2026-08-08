
console.log("🔥 DB FILE LOADED");
const mongoose = require("mongoose");


// async function connectingDatabase() {
//     try {
//         await mongoose.connect(process.env.MONGODB_URL);

//         console.log("Database Is Connected Successfully");
//     } catch (err) {
//         console.log("Database connection failed:", err);
//         throw err;
//     }
// }

async function connectingDatabase() {
    console.log("🔥 CONNECTING DATABASE");
    console.log("MONGODB_URL EXISTS:", Boolean(process.env.MONGODB_URL));

    try {
        await mongoose.connect(process.env.MONGODB_URL);

        console.log("🔥 DATABASE CONNECTED");
    } catch (err) {
        console.log("🔥 DATABASE ERROR:", err);
        throw err;
    }
}

module.exports = connectingDatabase;