
import mongoose from 'mongoose';

const savingsContributionSchema = new mongoose.Schema(
  {
    savingsGoal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'SavingsGoal',
      required: true,
      index: true,
    },

    transaction: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transaction',
      required: true,
      unique: true,      
      index: true,
    },

    note: {
      type: String,
      default: null,
      trim: true,
      maxlength: 255,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
    versionKey: false,
  }
);

savingsContributionSchema.index({ savingsGoal: 1, createdAt: -1 });

const SavingsContribution = mongoose.model(
  'SavingsContribution',
  savingsContributionSchema
);
export default SavingsContribution;