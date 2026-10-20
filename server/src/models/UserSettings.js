import mongoose from 'mongoose';
import {
  LANGUAGES,
  DATE_FORMATS,
  TIME_FORMATS,
  THEMES,
  FIRST_DAY_OF_WEEK,
  EXPORT_FORMATS,
  TRANSACTION_TYPES,
  DEFAULTS,
} from '../config/constants.js'

const userSettingsSchema = new mongoose.Schema(
  {
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },
    preferredCurrency:{
        type:String,
        default: DEFAULTS.CURRENCY,
        uppercase:true,
        trim:true,
        maxlenght:3
    },
    language:{
        type:String,
        enum: Object.values(LANGUAGES),
        default: DEFAULTS.LANGUAGE,
    },
    timezone:{
        type:String,
        default: DEFAULTS.TIMEZONE,
        trim:true,
    },
    dateFormat:{
        type:String,
        enum: Object.values(DATE_FORMATS),
        default: DEFAULTS.DATE_FORMAT,
    },
    timeFormat:{
        type:String,
        enum: Object.values(TIME_FORMATS),
        default: DEFAULTS.TIME_FORMAT,
    },
    theme:{
        type:String,
        enum: Object.values(THEMES),
        default: DEFAULTS.THEME,
    },
    defaultAccountId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Account',
        default: null,
    },
    defaultTransactionType:{
        type:String,
        enum: Object.values(TRANSACTION_TYPES),
        default: TRANSACTION_TYPES.EXPENSE,

    },
    defaultExportFormat:{
        type:String,
        enum: Object.values(EXPORT_FORMATS),
        default: DEFAULTS.EXPORT_FORMAT,
    },
    firstDayOfWeek:{
        type:String,
        enum: Object.values(FIRST_DAY_OF_WEEK),
        default: DEFAULTS.FIRST_DAY_OF_WEEK,
    },
    defaultBudgetAlertPercentage:{
        type:Number,
        min:0,
        max:100,
        default: DEFAULTS.BUDGET_ALERT_PERCENT,
    },
    quietHoursEnabled: { type: Boolean, default: false },
    quietHoursStart:   { type: String, default: '22:00' },
    quietHoursEnd:     { type: String, default: '07:00' },

    notificationEnabled: { type: Boolean, default: true },
    emailNotifications:  { type: Boolean, default: true },
    pushNotifications:   { type: Boolean, default: true },



},
{
    timestamps: true,
    versionKey: false,
}
)
userSettingsSchema.methods.isQuietHours = function(currentHour) {
    if (!this.quietHoursEnabled)return false; 
    const [startH]=this.quietHoursStart.split(':').map(number);
    const [endH]=this.quietHoursEnd.split(':').map(number);

    if(startH>endH){
        return currentHour >= startH && currentHour < endH;
    }
     return currentHour >= startH || currentHour < endH;
}

userSettingsSchema.statics.findByUser = function (userId) {
  return this.findOne({ user: userId });
};

const UserSettings = mongoose.model('UserSettings', userSettingsSchema);
export default UserSettings;
    
