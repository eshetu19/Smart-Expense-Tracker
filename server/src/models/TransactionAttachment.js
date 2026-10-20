import mongoose  from "mongoose";

const transactionAttachmentSchema=new mongoose.model(
    {
    transaction:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transaction',
        required:true,
        index: true
    },
    originalFileName: {
        type: String,
        required: true,
        trim: true,
        maxlength:255
    },
    storedFileName: {
        type:String,
        required:true,
        trim:true,
        maxlength:255
    },
    filePath: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500

    },
    mimeType:{
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    fileSize: {
        type: Number,
        required: true,
        min: [1,'File size must be postive']
    }

    },
    {
        timestamps:{createdAt:true,updatedAt:false},
        versionKey:false
    }

)


const TransactionAttachment=mongoose.model('TransactionAttachment',transactionAttachmentSchema)

export default TransactionAttachment;