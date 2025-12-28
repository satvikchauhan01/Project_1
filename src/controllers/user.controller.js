//Line 6
import {asyncHandler} from "../utils/asyncHandler.js";  //import the basic async handler utillity from the utills
import { ApiError } from "../utils/ApiError.js";
import {User} from "../models/user.model.js"
import { uploadOnCloud } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser=asyncHandler(async(req, res) =>{
     //steps:
     //1. get user details from frontend(here take from postman)
     //2. validation(no empty usenrmae, email.... are they valid or not(if missed by frontend))  --not empty(main checkup)
     //3. check if user already exists How?(by username or email)
     //4. files are there or not (as avatar is required in schem)
     //5. upload them to cloudinary, is avtar is uploaded on cloudinary or not
     //6. create user object (as mongodb require object data type)  --create entry in db
     //7. remove password and refresh token field from response(as response contains all the details)
     //8. check if response came or not(if not then user is not created)
     //return response (means user is successfully created);


     //1:
        const {fullname, email, username, password} =req.body
        console.log("email: ",email);

        //  if(fullname===""){    //but we have to write so many if statments so use something better;
        //     throw new ApiError(400, "Fullname is required")         //the apierror is imported from the utillity(it needs mainly 2 arguments)
        //  }

        //some:- checks for each value and return a boolean value 
        if ( [fullname,email,username,password].some((field) => field?.trim()==="")) {        //trim is there to remove the useless spaces
            throw new ApiError(400, "All fields are required")
        }

    //2: add validation:
        const emailRegex= /^[^\s@]+@[^\s@]+\.[^\s@]+$/;  //this is regex(a format which we have defined for the correct format of email)
        if(!emailRegex.test(email)){        //
            throw new ApiError(400, "Invalid email format");
        }

        const usernameRegex=/^[a-zA-Z0-9_]+$/;
        if(!usernameRegex.test(username)){
            throw new ApiError(400, "Username only contain letters, numbers and underscores");
        }

        const fullnameRegex= /^[a-zA-Z\s]+$/;
        if(!fullnameRegex.test(fullname)){
            throw new ApiError(400, "Full name only contain letters and spaces");
        }

        if(password.length<8){
            throw new ApiError(400, "Password must be at least 8 characters long");
        }
    
    //3: check if user already exist or not:
    //first we have to import the user from the models, because we have created the schemas from mongoose and that can directly talk to the database
       
        const existedUser = await User.findOne({
            $or: [{username}, {email}]
        })
        if(existedUser){
            throw new ApiError(409, "User already exists with this email or username");
        }
        console.log(req.files);
        
    //4: check for images (avtar is there or not) 

        const avatarLocalPath = req.files?.avatar[0]?.path;       //? -> is optional chaining ex:- if req.files dont exist it simply return undefined safely and prevents the server from crashing  
       
        //const coverimageLocalPath= req.files?.coverImage[0]?.path;  //this will not work when cover image is not provided
        //more optimal code: 
            let coverimageLocalPath;
            if(req.files && Array.isArray(req.files.coverImage) && req.files.coverImage.length >0){  //3 checks: does req.files exist, req.files.coverimage is an array or not,  and whether the size of that array is greater than 0 or not
                coverimageLocalPath=req.files.coverImage[0].path; 
            }

        if(!avatarLocalPath){
            throw new ApiError(400, "Avatar is required");
        }
        //when you upload a file through multer, express stores the files object to the req, it looks like this: 
                // req.files = {
                //     avatar: [
                //         {
                //         fieldname: "avatar", 
                //         originalname: "me.png",
                //         mimetype: "image/png",
                //         path: "uploads/me-123.png"
                //         }
                //     ],
                //     coverImage: [
                //         {
                //         path: "uploads/cover-456.png"
                //         }
                //     ]
                // }
      
                
    //5: Upload them to cloudinary
        const avatar = await uploadOnCloud(avatarLocalPath);   //we add await becasue uplaoding on server takes time
        const coverImage = await uploadOnCloud(coverimageLocalPath);

        if(!avatar){
            throw new ApiError(400, "Avatar is required");
        }

    //6: now store that link in the database through the user:
        const user = await  User.create({              //error occurs always so to catch handling takes time and also db is another continent so it takes time so use await
            fullname,
            avatar: avatar.url,
            coverImage: coverImage?.url  || "",       //if present save the url or just leave it empty as it is not mandatory
            email,
            password,
            username: username.toLowerCase()
        })
    
    //7: remove password and refreshToken from response which we will send in step 9
        const userCreated= await User.findById(user._id).select("-password -refreshToken");       //mongodb creates a uniqe id for each object created;  //.slect selects all the entries except the provided in the string
    
    //8: check if user is created or not
        if(!userCreated){
            throw new ApiError(500, "Something went wrong while creating user");
        }
    //9: send API response back to user:
        //first import the ApiResponse utillity:
        return res.status(201).json( 
            new ApiResponse(200, userCreated, "User registered succesfully") //created object of the apiresponse class and gave its arguments(statuscode, data, message)
        )
})

export {registerUser}
//Line6 end    