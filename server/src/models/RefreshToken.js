import mongoose from 'mongoose'

const refreshTokenSchema=new mongoose.Schema(
    {
        user:{
            type : mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
            index:true
        },
        tokenHash:{
            type:String,
            required:true,
            unique:true
        },
        expiresAt:{
            type:Date,
            required:true,
            index:true
        },
        revokedAt:{
            type:date,
            default:null
        },
        deviceName:{
            type:String,
            default:null,
            maxlength:100,
            trim:true
        },
        ipAddress:{
            type:String,
            default:null,
            maxlength:45,
            trim: true

        },
        userAgent:{
            type:String,
            default:null,
            trim: true
        }
    },
    {
        timestamps:true,
        versionKey=false,
    }
)

refreshTokenSchema.index({user:1,revokedAt:1})

refreshTokenSchema.index({expiresAt:1},{expireAfterSeconds:0})

const RfreshToken=mongoose.model('RefreshToken',refreshTokenSchema)

export default RfreshToken;