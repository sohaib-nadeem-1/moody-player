const mongoose = require("mongoose")

 function connectingDatabase(){
    mongoose.connect(process.env.MONGODB_URL)
    .then(()=>{
        console.log("Database Is Connected Sucessfully");
            })
     .catch((err)=>{
        console.log("Error Accoured",err);
        
     })       
 }

 module.exports = connectingDatabase; 