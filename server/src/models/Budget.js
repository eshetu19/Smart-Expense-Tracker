import mongoose from 'mongoose'

import {PERIODS} from '../config/constants.js'

const budgetSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index: true
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'category',
            default: null
        },
        name: {
            type: String,
            required: [true,'Budget name is required'],
            trim: true,
            maxlength: 100
        },
        amountCents: {
            type: Number,
            required: [true,'Budget amount is required'],
            min: [1,'Budget amount must be greater than 0']

        },
        period: {
            type: String,
            enum: Object.values(PERIODS),
            required: [true,'Budget period is required']

        },
        startDate: {
            type: Date,
            required: [true, 'Start date is required']
        },
        endDate: {
            type: Date,
            required: [true, 'End date is required']
        },
        alertPercentage: {
            type: Number,
            default: 80,
            min:[1, 'Alert percentage must be between 1 and 100'],
            max:[100 ,'Alert percentage must be between 1 and 100 ']
        },
        isActive: {
            type: Boolean,
            default: true
        }

    },
    {
        timestamps:true,
        versionKey:false,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
    }
)


budgetSchema.index({user:1,isActive:1})
budgetSchema.index({category:1})
budgetSchema.index({user:1,category:1,periods:1,startDate:1},{unique:true})

budgetSchema.virtual('amount').get(function(){
    return this.amountCents/100
})

budgetSchema.pre('validate', function () {
  if (this.startDate && this.endDate && this.startDate > this.endDate) {
    this.invalidate('endDate', 'End date must be after start date');
  }
});


const Budget=mongoose.model('Budget',budgetSchema)

export default Budget;