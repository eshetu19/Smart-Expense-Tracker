import mongoose from 'mongoose'

import {ACCOUNT_TYPES,DEFAULTS} from '../config/constants'
const accountSchema=new mongoose.Schema(
    {
     user:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'User',
        required:true,
        index:true
     },
     name:{
        type:String,
        required:[true,'Account name is required'],
        trim:true,
        maxlength:100
     },
     accountType:{
        type:String,
        enum:Object.values(ACCOUNT_TYPES),
        required:[true,'Account type is required'],
        
     },
     openingBalance:{
        type:Number,
        required:true,
        default:0,
        min:[0,'Opening balance cannot be negative']
     },
     currentBalance:{
        type:Number,
        required:true,
        default:0

     },
     currency:{
        type:String,
        required:true,
        default:DEFAULTS.CURRENCY,
        uppercase:true,
        trim:true,
        maxlength:3

     },
     color:{
        type:String,
        default:null,
        maxlength:20

     },
     icon:{
        type:String,
        default:null,
        maxlength:100
        
     },
     isActive:{
      type:Boolean,
      default:true

     }

    },
    {
        timestamps:true,
        versionKey:false,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }

)

accountSchema.index({user:1,name:1},{unique:true})

accountSchema.index({user:1,isActive:1})

accountSchema.virtual('openingBalance').get(function(){
   return this.openingBalance/100
})

accountSchema.virtual('currentBalance').get(function(){
   return this.currentBalance/100
})

const Accounts=mongoose.model('Accounts',accountSchema)
export default Accounts;