import mongoose from 'mongoose'

const tagSchema=new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
            index:true
        },
        name:{
            type:String,
            required:[true,'Tag name is required'],
            trim:true,
            maxlength:50
        },
        color:{
            type:String,
            default:null,
            maxlength:20
        }
    },
    {
        timestamps:true,
        versionKey:false
    }
)


tagSchema.index({user:1,name:1},{unique:true})

const Tag=mongoose.model('Tag',tagSchema)

export default Tag;