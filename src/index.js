// require('dotenv').config({path: './env'}) 
import dotenv from"dotenv"

dotenv.config({
    path: './env'
})


import connectDB from "./db/index.js";  //no need to write the index.js as JS will automatically look for index.js or db.js

connectDB();







//first approach: 
/*
import express from 'express'
const app=express();
// function connectDB(){

// }

// connectDB() rather than this we will use the iffe(immediately run) function:  (use semicolons before iffe, because if semicolon is not there in the previous line some errors occur)
;(async () => {   //asunc tells the js to always return a promise
    try{
        await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   //await is used to hold this line until the promise is returned
        app.on("error", (error) => {
            console.log("ERR: ", error);
            throw error;
        })
        app.listen(process.env.PORT, () =>{
            console.log(`App is listneing on port ${process.env.PORT}`);
            
        })
    }
    catch(error){
        console.log("Error: ",error);
        throw error;
    }
//     The code tries to connect to MongoDB.
// It fails, so JS jumps into the catch block.
// Inside the catch, you log the message.
// Then throw error; sends that same error to the caller (the place where this function was called).

//Why throw again:
// connectDB() handles its own internal logging.
// But it also throws the error again.
// So the outer code (main app) also knows connection failed, and it can stop or retry.

})()

*/