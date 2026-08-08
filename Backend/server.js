require('dotenv').config()
const app = require("./src/app")
const connectingDatabase = require("./src/Database/db");
connectingDatabase()


app.listen(3000,()=>{
    console.log(("Server Is running on Port 3000"));
    
})