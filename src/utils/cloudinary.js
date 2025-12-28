//Line 5 start
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs'    //it is a file system library given by node js(read write remove in sync, async )

//now we will configure it 
cloudinary.config({ 
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        api_key: process.env.CLOUDINARY_API_KEY, 
        api_secret:  process.env.CLOUDINARY_API_SECRET
    });
//Line 5 end

//Line 6 start:
//uploading on cloudinary

const uploadOnCloud= async (localFilePath) =>{
    try{
        if(!localFilePath) return null
        //uploading:
        const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto"              //type of resource image video etc
        })
        //file has beeen uploaded now 
        //console.log("File is uploaded on the cloudinary", response.url);            //response has so many attributes .url will return the public url
        fs.unlinkSync(localFilePath)  //removes after uploading //write after writing controller
        return response;
    }
    catch(error){ //so if upload failed
        fs.unlinkSync(localFilePath)            //removes the locally saved(locally means backend server not user) temp file as the upload operation failed
        return null
    }
}

export {uploadOnCloud};

//Line 6 end;