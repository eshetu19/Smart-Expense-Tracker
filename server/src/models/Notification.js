
import mongoose from 'mongoose';
import { NOTIFICATION_TYPES } from '../config/constants.js';

const notificationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 150,
    },

    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 2000,
    },

    notificationType: {
      type: String,
      enum: Object.values(NOTIFICATION_TYPES),
      required: [true, 'Notification type is required'],
    },

    relatedEntity: {
      entityType: {
        type: String,
        enum: ['Transaction', 'Budget', 'SavingsGoal', 'Account', 'RecurringTransaction'],
        default: null,
      },
      entityId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
      },
    },

    isRead: {
      type: Boolean,
      default: false,
      index: true,
    },

    readAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

notificationSchema.index({ user: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ createdAt: -1 });

notificationSchema.methods.markAsRead = function () {
  if (this.isRead) return;
  this.isRead = true;
  this.readAt = new Date();
};

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;