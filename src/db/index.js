import mongoose from 'mongoose';
import {DB_NAME} from "../constants.js";  //single dot meands current folder // double dot means parent folder


const connectDB= async () => {
    try{
        //we can store it in a constatnt because it return a object
        const connectionInstance =await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)   //here the $ things return a string 
        console.log(`\n Mongo DB connected: DB Host--${connectionInstance.connection.host}`);
        
    }
    catch (error){
        console.log("MOngo connection error", error);
        process.exit()   //provided by node to stop the code,,  takes diffrent values(1,2,,,)
    }
}

export default connectDB;  //exports the connectDB function