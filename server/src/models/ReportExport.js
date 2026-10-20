
import mongoose from 'mongoose';
import { REPORT_TYPES, EXPORT_FORMATS } from '../config/constants.js';

const reportExportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    reportType: {
      type: String,
      enum: Object.values(REPORT_TYPES),
      required: [true, 'Report type is required'],
      index: true,
    },

    exportFormat: {
      type: String,
      enum: Object.values(EXPORT_FORMATS),
      required: [true, 'Export format is required'],
    },

    fileName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },

    storageKey: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },

    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },

    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'COMPLETED',
    },

    expiresAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: { createdAt: 'exportedAt', updatedAt: true },
    versionKey: false,
  }
);

reportExportSchema.index({ user: 1, exportedAt: -1 });   
reportExportSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const ReportExport = mongoose.model('ReportExport', reportExportSchema);
export default ReportExport;