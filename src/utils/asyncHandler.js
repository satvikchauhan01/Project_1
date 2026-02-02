//line 1
//method 2 using promise
 const asyncHandler= (requestHandler) => {
    return (req, res, next) =>{
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
 }





export {asyncHandler};

// const as=() => {}
// const as =(func) => () =>{}
// const as=(func) => async () => {}
//1st method: using try catch inside async

/*
const asyncHandler=(fn) => async(req, res, next) =>{
    try{
        await fn(req, res, next)
    }
    catch(error){
        res.status(error.code || 500).json({
            success: false,
            message: error.message
        })
    }
}
*/

//line 2 END


