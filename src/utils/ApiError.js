 //line 3
 
 class ApiError extends Error {   //extends the Error class given by the node js
    constructor(
        statusCode, 
        message= "Something went wrong",
        error=[],     //if you wnat to pass multiple errors (extra)
        stack=""       //if you ewant to give custom error stack
    ){
        super(message)       //calls the parent Error class constructor
        this.statusCode= statusCode   //
        this.data=null
        this.message=message 
        this.success=false
        this.errors= error
        //assigns default values
        if(stack){
            this.stack=stack
        }else{
            Error.captureStackTrace(this, this.constructor)
        }
    }
 }

 export {ApiError}
 //line 3 END