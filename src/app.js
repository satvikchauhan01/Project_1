import express from 'express'
import cors from 'cors'
import cookieParser from "cookie-parser";

const app=express();


app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials:true
}))

app.use(express.json({limit: "16kb"}))  //for the json requests limits the size of json to 16kb bb
//line 1: 
//for url requests  //complex  
app.use(express.urlencoded({extended: true,
    limit: "16kb"
}))         //most cases without exteneded is not used just it is fine


//for public assets  like images 
app.use(express.static("public"));

//use of cookie parser: to use and access the cookies of the user from the server:
app.use(cookieParser());
//line 1 END


//Routes import: 
import userRouter from './routes/user.routes.js';

//Routes decalaration:
app.use("/api/v1/users", userRouter)


export {app};