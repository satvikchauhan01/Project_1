//Line 6
import { asyncHandler } from "../utils/asyncHandler.js";  //import the basic async handler utillity from the utills
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js"
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

const generateAccessAndRefreshToken =async(userId) =>{
    try {
        const user1 = await User.findById(userId);

        const accessToken = user1.generateAccessToken();      //both needs to send to user side             
        const refrshToken = user1.generateRefreshToken();  
       //refreshToken need to stored in db also
       user1.refrshToken=refreshToken;
       await user1.save({ validateBeforeSave : false})    //because on saving the mongodb needs all the fields, but here you are logging in so you already have all the fields so just keep it false

        return {accessToken, refrshToken}                 //return it to send it to the user
    } catch (error) {
        throw new ApiError(500, "Something went wrong");
    }
}
const loginUser= asyncHandler(async(req, res) =>{
    //steps:
    //1. fetch the data from req.body
    //2. give access based on username or email
    //3. find the user in the database (if not req is denied)
    //4. if there do password check (if wrong prompt password is wrong)
    //5. generate access and refresh token and send it to user
    //6. send cookie and send a respone the login is successfull

    //1. fetch data from req.body
        const {email, username, password} =req.body;  
    //2. 
        if(!username || !email){
            throw new ApiError(400, "username or email is required");
        }
        //user can login with both usename and email so create for both 
    //3. 
        const user = await User.findOne({          //db operation use await          //Capital(User) is the mongoose object 
            $or: [{username}, {email}]             //finds a value for any of the variables and returns the first value found
        })
        if(!user){
            throw new ApiError(404, "User doesnt exist");
        }
    //4. 
        const isPasswordValid = await user.isPasswordCorrect(password);
        if(!isPasswordValid){
            throw new ApiError(401, "Invalid user Credentials");
        }
    //5. 
        const {accessToken,refreshToken} = await generateAccessAndRefreshToken(user._id)  //this function is defined above
    //6. sending to user: 
        const loggedInUser = await User.findById(user._id).select("-password -refreshToken");  //we do another database query because the previous user object that we created didnt had the refresh token saved
        
        //sending cookies:
        const options ={
            httpOnly: true,
            secure: true
            //by this these cookies cant be modified at the frontend side
        }
        return res.status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(
            new ApiResponse(200, 
                {
                    user: loggedInUser, accessToken, refreshToken   //we send it here also(already in cookies) because if user wnats these values or if user is using mobile application where cookies arent saved

                },
            "User logged in successfully"
            )
        )
})

const logoutUser= asyncHandler(async(req, res) =>{
    //steps:  firstly auth middleware is required because this req has no idea which user has just clicked the logout 
    //1. remove thew cookies 
    //2. remove the refresh and access token 
    //after the verifyJWt middleware runs now the req has access to the user:

    //1: remove refresh token: 
    await User.findByIdAndUpdate(         //captial User is the Db one which is doing search to find the user which has that id provided inside
        req.user._id,
        {
            $set: {
                refreshToken: undefined           //removes the refresh token from the data base
            }
        },
        {
            new: true
        }
    )

    //2: delete cookies: 
    const options={
        httpOnly:true,
        secure: true
    }
    return res.status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken",options)     
    .json(new ApiResponse(200, {}, "User logged out"))  //no data need to be send
     
})

export {registerUser, loginUser, logoutUser}
//Line6 end    
