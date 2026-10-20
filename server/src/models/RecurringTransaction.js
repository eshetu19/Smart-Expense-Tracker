
import mongoose from 'mongoose';
import {
  TRANSACTION_TYPES,
  PERIODS,
} from '../config/constants.js';

const recurringTransactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },

    account: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Account',
      required: [true, 'Account is required'],
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },

    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },

    transactionType: {
      type: String,
      enum: Object.values(TRANSACTION_TYPES),
      required: [true, 'Transaction type is required'],
    },

    amountCents: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [1, 'Amount must be greater than 0'],
    },

    frequency: {
      type: String,
      enum: Object.values(PERIODS),
      required: [true, 'Frequency is required'],
    },

    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
    },

    endDate: {
      type: Date,
      default: null,
    },

    nextExecutionDate: {
      type: Date,
      required: true,
      index: true,
    },

    lastExecutionDate: {
      type: Date,
      default: null,
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

recurringTransactionSchema.index({ isActive: 1, nextExecutionDate: 1 });
recurringTransactionSchema.index({ user: 1, isActive: 1 });

recurringTransactionSchema.virtual('amount').get(function () {
  return this.amountCents / 100;
});

recurringTransactionSchema.pre('validate', function () {
  if (this.endDate && this.startDate && this.endDate < this.startDate) {
    this.invalidate('endDate', 'End date must be on or after start date');
  }
});

const RecurringTransaction = mongoose.model(
  'RecurringTransaction',
  recurringTransactionSchema
);
export default RecurringTransaction;