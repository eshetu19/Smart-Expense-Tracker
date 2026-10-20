import mongoose from 'mongoose'
import  TRANSACTION_TYPES from '../config/constants.js'


const categorySchema=new mongoose.Schema(
    {
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            default:null,
            index:true
        },
        name:{
            type:String,
            required:[true,'category name is required'],
            trim:true,
            maxlength:50
        },
        transactionType : {
            type : String,
            enum : Object.values(TRANSACTION_TYPES),
            required : [true,'Transaction type is required']
        },
        icon : {
            type : String,
            default : null,
            maxlength : 100
        },
        color : {
            type:String,
            default:null,
            maxlength:20

        },
        isSystem : {
            type:Boolean,
            default:false

        },
        isActive : {
            type:Boolean,
            default:true
        },

    },
    {
        timestamps:true,
        versionKey:false
    }

)

categorySchema.index({user:1,name:1,transactionType:1},{unique:true})

categorySchema.index({user:1,transactionType:1,isActive:1})

categorySchema.index({isSystem:1,transactionType:1})

const Category=mongoose.model('Category',categorySchema)

export default Category;