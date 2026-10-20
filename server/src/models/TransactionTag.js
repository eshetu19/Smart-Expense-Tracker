import mongoose from "mongoose";

const transactionTagSchema=new mongoose.Schema(
    {
        transaction: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Transaction',
            required: true,
            index: true
        },
        tag:{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Tag',
            required:true,
            index:true
        }

    },
    {
        timestamps:{createdAt:true,updatedAt:false},
        versionKey:false
    }
)

transactionTagSchema.index({trnasaction:1,tag:1},{unique:1})

const TransactionTag=mongoose.model('TransactionTag',transactionTagSchema)

export default TransactionTag;