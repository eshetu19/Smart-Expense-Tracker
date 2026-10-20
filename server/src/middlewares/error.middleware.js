import config from '../config/config.js';
import ApiError from '../utils/ApiError.js';


const handleMongooseValidationError = (err) => {
  const errors=Object.values(err.errors).map((e)=>({
    field=e.path,
    message=e.message
    
  }))
  return ApiError.unprocessable('Validation failed', errors);
}

const handleMongooseCastError = (err) => {
    return ApiError.badRequest(`Invalid ${err.path}: ${err.value}`);
}

const handleMongooseDuplicateKeyError = (err) => {
    const field = Object.keys(err.keyValue)[0];
    const value = err.keyValue[field];
    return ApiError.conflict(`Duplicate value for field '${field}': ${value}`,[
        {field,message:`${field} already exists`},
    ]);
}

const handleJWTError=()=>ApiError.unauthorized('Invalid token. Please log in again!');

const handleJWTExpiredError=()=>ApiError.unauthorized('Your token has expired! Please log in again.');

const errorHandler=(err,req,res,next)=>{
    let error =err

    if(!(err instanceof ApiError)){ 
        if(err.name==='ValidationError'){
            error=handleMongooseValidationError(err);
        }
        else if(err.name==='CastError'){
            error=handleMongooseCastError(err);
        }
        else if(err.code===11000){
            error=handleMongooseDuplicateKeyError(err);
        }
        else if(err.name==='JsonWebTokenError'){
            error=handleJWTError();
        }
        else if(err.name==='TokenExpiredError'){
            error=handleJWTExpiredError();
        }
        else{
            error = new ApiError(
                error.statusCode ||500,
                error.message || 'internal server error'
            )
        }
    }
    const response={
        statusCode:error.statusCode,
        success:false,
        message:error.message,
        errors :error.errors || [],
    }
    if (config.isDevelopment) {
        console.error('error',error)
    }else{
        console.error(`${error.statusCode} - ${error.message}`)
    }
    res.status(error.statusCode).json(response)
}

export default errorHandler;