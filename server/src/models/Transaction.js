import mongoose from 'mongoose'
import {
    TRANSACTION_TYPE,
    TRANSACTION_STATUS,
    DEFAULTS,
    TRANSACTION_TYPES
} from '../config/constants.js'

const transactionSchema=new mongoose.Schema(
    {
        user: {
            type:mongoose.Schema.Types.ObjectId,
            ref:'User',
            required:true,
            index:true
        },
        category:{
            type:mongoose.Schema.Types.ObjectId,
            ref:'Category',
            default:null
            
        },
        fromAccount:{
            type:mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default:null
        },
        toAccount:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            default: null
        },
        transactionType:{
            type:String,
            enum:Object.values(TRANSACTION_TYPES),
            required:[true,'Transaction type is required']
        },
        amountCents:{
            type:Number,
            required:[true,'Amount is required'],
            min:[1,'Amount must be greater than zero']
        },
        title :{
            type:String,
            required:[true,'Title is required'],
            trim: true
        },
        description: {
            type:String,
            default:null,
            trim:true,
            maxlength:500
        },
        paymentMethod:{
            type:String,
            default:null,
            trim:true,
            maxlength:50
        },
        transactionDate: {
            type:Date,
            required:[true,'Transaction date is required'],
            index:true

        },
        status: {
            type:String,
            enum:Object.values(TRANSACTION_STATUS),
            default:DEFAULTS.TRANSACTION_STATUS

        },
        referenceNumber: {
            type : String,
            default: null,
            trim : true,
            maxlength: 100
        },
        location: {
            type : String,
            default : null,
            trim : true,
            maxlength: 255
        }
        
    },
    {
        timestamps:true,
        versionKey:true,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)

transactionSchema.index({user:1,transactionDate:-1})
transactionSchema.index({user:1,category:1})
transactionSchema.index({user:1,status:1,transactionDate:-1})
transactionSchema.index({fromAccount:1})
transactionSchema.index({toAccount:1})


transactionSchema.virtual('amount').get(function(){
    return this.amountCents/100
})

transactionSchema.pre('validate',function(){
    if(this.transactionType===TRANSACTION_TYPES.INCOME){
        if(!this.toAccount){
            this.invalidate('toAccount','Income transaction requires destinaton Account')
        }
    }
    if (this.transactionType === TRANSACTION_TYPES.EXPENSE) {
    if (!this.fromAccount) {
      this.invalidate('fromAccount', 'Expense transactions require a source account');
    }
  }
})



const Transaction=mongoose.model('Transaction',transactionSchema)

export default Transaction;