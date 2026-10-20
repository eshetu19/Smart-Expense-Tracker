import mongoose from 'mongoose'
import {GOAL_STATUSES, PRIORITIES, DEFAULTS} from '../config/constants.js'

const savingsGoalSchema=new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
            index:true

        },
        account: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Account',
            required:[ true, 'Account is required']
        },
        name: {
            type:String,
            required: [true, 'Goal name is required'],
            trim: true,
            maxtlength: 100
        },
        description: {
            type: String,
            default: null,
            trim: true,
            maxlength: 1000,
        },
        targetAmountCents: {
            type: Number,
            required: [true, 'Target amount is required'],
            min: [1, 'Target amount must be greater than 0'],
        },

       targetDate: {
           type: Date,
           default: null,
        },
        status: {
           type: String,
           enum: Object.values(GOAL_STATUSES),
           default: DEFAULTS.GOAL_STATUS,
        },

        priority: {
           type: String,
           enum: Object.values(PRIORITIES),
           default: DEFAULTS.GOAL_PRIORITY,
        },

        icon: {
           type: String,
           default: null,
           maxlength: 100,
        },
        color: {
            type:String,
            default:null,
            maxlength:20
        }
    },
    {
        timestamps:true,
        versionKey:false,
        toJSON:{virtuals:true},
        toObject:{virtuals:true}
  
    }
)


savingsGoalSchema.index({ user: 1, status: 1 });
savingsGoalSchema.index({ account: 1 });

savingsGoalSchema.virtual('targetAmount').get(function () {
  return this.targetAmountCents / 100;
});

const SavingsGoal = mongoose.model('SavingsGoal', savingsGoalSchema);
export default SavingsGoal;