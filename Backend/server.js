// require('dotenv').config()
// const app = require("./src/app")
// const connectingDatabase = require("./src/Database/db");
// connectingDatabase()


// app.listen(3000,()=>{
//     console.log(("Server Is running on Port 3000"));
    
// })

require("dotenv").config();

const app = require("./src/app");
const connectingDatabase = require("./src/Database/db");

async function startServer() {
  try {
    await connectingDatabase();

    app.listen(3000, () => {
      console.log("Server is running on Port 3000");
    });

  } catch (err) {
    console.log("Database connection failed:", err);
  }
}

startServer();