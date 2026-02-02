import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";

export const verifyJWT= asyncHandler(async(req, res, next)=>{             //whenever we write middleware we write next(this work is done move to next)
    try {
        const token = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");   //used to extarct token from the user with the help of cookies
        
        
        if(!token){
            throw new ApiError(401, "Unauthorized request")
        }
        const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);    //decodes and verifies the token
    
        const user = await User.findById(decodedToken?._id).select("-password -refreshToken");     //fetches user form the db
        if(!user){
            //IMPT: 
            throw new ApiError(401, "Invalid Access Token");          
        }
        req.user =user;                           //assign User to the req(so now req can acces id username and all)
        next();            //auth done move to the controller
    } 
    catch (error) {
        throw new ApiError(401, error?.message || "Invalid access token"); 
    }
})