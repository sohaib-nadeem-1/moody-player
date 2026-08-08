// import ImageKit from "@imagekit/nodejs";
var ImageKit = require ("imagekit") 
var imageKit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT,
});

function uploadingFile (file){
    return new Promise((resolve,reject)=>{
        imageKit.upload({
            file : file.buffer,
            fileName : "Gaana"
        },(err,res)=>{
            if(err){
                reject(`Error is ${err}`);
                
            }
            else{
                    resolve(res)
            }
        })
    })
}

module.exports = uploadingFile;