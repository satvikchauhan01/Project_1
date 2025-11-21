import mongoose , {Schema} from 'mongoose'    //if we take Schema we dont have to write mongoose.schema
import jwt from "jsonwebtoken"
import bcrypt from "bcrypt"

const userSchema=new Schema(
    {
        username:{
            type:String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true,
            index: true              //it increases the searching capapbiliity of this// without this also search will work but it enhances it
        },
        email :{
            type:String,
            required: true,
            unique: true,
            lowercase:true,
            trim:true
        },
        fullname:{
            type:String,
            required: true,
            lowercase:true,
            index:true
        },
        avatar: {
            type: String,             //urls is stored in the string (cloudinary)
            required:true,
        },
        coverImage: {
            type: string
        },
        watchHistory:[
            {
                type: Schema.Types.ObjectId,
                ref:"Video"
            }
        ],
        password: {
            type: String,             //we have to store in encrypted form 
            required: [true, "Please enter password"]          //custom error message can be given to every required message
        },
        refreshToken: {
            type: String
        }
    },
    {
        timestamps: true         //gives the created at and updated at;
    }
)

//FOR ENCRYPTION OF PASSWORD
//use async as it takes time
userSchema.pre("save", async function(next) {   //means before saving the document cheack //dont use arrow function as "this" functionallity is not avil in arrow
    if(this.isModified("password")){
        //this if ensures passowrd is encrypted only when password field is updated

        this.password=bcrypt.hash(this.password, 8)         //what we have to hash and number of rounds
    next();
    }
}) 


export const User= mongoose.model("User", userSchema)