import ApiError from '../utils/ApiError.js'

const validate = (schema, target='body') =>{
    return (req,res,next)=>{
        if (!['body','query','params',].includes(target)){
            return next(ApiError.internal(`validate: invalid target "${target}"`))

        }
        const result = schema.safeParse(req[target] ?? {})
        if(!result.success) {
             const errors = result.error.errors.map((e) => ({
        field: e.path.join('.') || target,
        message: e.message,
        }))
          return next(ApiError.unprocessable('Validation failed', errors));

    }
    req[target] = result.data;

    next();

    }

}

export default validate;